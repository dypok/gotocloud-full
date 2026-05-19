from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from app.models.schemas import VectorDocument, LeadOpportunity, Session as SessionModel, PGVECTOR_AVAILABLE
from app.services.gemini_service import GeminiService


class ToolService:
    def __init__(self, db: Session, ai_service: GeminiService):
        self.db = db
        self.ai_service = ai_service

    def search_knowledge_base(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        """Search the vector_documents table and return relevant snippets."""
        if not query or not query.strip():
            return []

        vector_query = self.ai_service.embed_text(query)
        if not vector_query:
            return []

        # Update dimension check for Gemini (768)
        if PGVECTOR_AVAILABLE and len(vector_query) == 768:
            stmt = (
                select(VectorDocument)
                .order_by(VectorDocument.embedding.cosine_distance(vector_query))
                .limit(limit)
            )
        else:
            # Fallback when the query embedding size does not match the stored vector dimension.
            search_pattern = f"%{query}%"
            stmt = (
                select(VectorDocument)
                .where(VectorDocument.content.ilike(search_pattern))
                .limit(limit)
            )

        results = self.db.exec(stmt).all()
        return [
            {
                "content": doc.content,
                "metadata": doc.metadata_doc or {},
            }
            for doc in results
        ]

    def detect_lead_opportunity(self, message: str, session_id: UUID | str | None) -> dict[str, Any] | None:
        """Detect basic commercial intent and persist a lead opportunity."""
        if not message or not session_id:
            return None

        normalized_message = message.lower()
        keyword_weights = {
            "demo": 20,
            "cotiz": 18,
            "precio": 18,
            "interes": 15,
            "reunión": 15,
            "reunion": 15,
            "compr": 15,
            "solución": 12,
            "solucion": 12,
            "servicio": 10,
            "implement": 10,
            "proyecto": 10,
            "evaluar": 10,
            "consultor": 10,
            "alianza": 10,
            "necesitamos": 10,
            "presupuesto": 15,
            "cotización": 18,
            "publicidad": 8,
            "campaña": 8,
        }

        score = sum(weight for keyword, weight in keyword_weights.items() if keyword in normalized_message)
        if score < 20:
            return None

        interest_areas = {
            "azure": "Azure",
            "seguridad": "Security",
            "cloud": "Cloud",
            "datos": "Data",
            "data": "Data",
            "ia": "AI",
            "inteligencia": "AI",
            "saas": "SaaS",
            "automat": "Automation",
            "ciberseguridad": "Security",
            "servicio": "Service",
        }
        detected_interest = None
        for token, area in interest_areas.items():
            if token in normalized_message:
                detected_interest = area
                break

        recommended_action = (
            "Contact the customer with a commercial follow-up, share pricing or demo details, "
            "and verify requirements for a potential project."
        )

        session = None
        try:
            session = self.db.get(SessionModel, UUID(str(session_id)))
        except Exception:
            pass

        existing_lead = None
        if session:
            existing_lead = self.db.exec(
                select(LeadOpportunity).where(LeadOpportunity.session_id == session.id)
            ).first()

        if existing_lead:
            existing_lead.lead_score = max(existing_lead.lead_score or 0, score)
            existing_lead.interest_area = existing_lead.interest_area or detected_interest
            existing_lead.recommended_action = existing_lead.recommended_action or recommended_action
            existing_lead.notes = {**existing_lead.notes, "trigger": normalized_message}
            existing_lead.updated_at = existing_lead.updated_at
            self.db.add(existing_lead)
            self.db.commit()
            return {
                "lead_score": existing_lead.lead_score,
                "qualified": existing_lead.lead_score >= 30,
                "interest_area": existing_lead.interest_area,
                "recommended_action": existing_lead.recommended_action,
            }

        lead = LeadOpportunity(
            session_id=UUID(str(session_id)),
            phone_number=session.phone_number if session else None,
            industry=None,
            interest_area=detected_interest,
            lead_score=score,
            recommended_action=recommended_action,
            qualified=score >= 30,
            notes={"trigger": normalized_message},
        )

        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)

        return {
            "lead_score": lead.lead_score,
            "qualified": lead.qualified,
            "interest_area": lead.interest_area,
            "recommended_action": lead.recommended_action,
        }

    def build_conversation_summary(self, context: dict[str, Any]) -> str:
        """Create a short structured summary from the session context."""
        lines: list[str] = []

        session_id = context.get("session_id")
        if session_id:
            lines.append(f"Session ID: {session_id}")

        last_channel = context.get("last_channel")
        if last_channel:
            lines.append(f"Last channel: {last_channel}")

        active_issue = context.get("active_issue")
        if active_issue:
            lines.append(f"Active issue: {active_issue}")

        priority = context.get("priority")
        if priority:
            lines.append(f"Priority: {priority}")

        sentiment = context.get("sentiment")
        if sentiment:
            lines.append(f"Sentiment: {sentiment}")

        recent_messages = context.get("recent_messages", [])
        if recent_messages:
            lines.append("Recent conversation:")
            for item in recent_messages[-4:]:
                role = item.get("role", "user")
                content = item.get("message", "")
                lines.append(f"- {role}: {content}")

        return "\n".join(lines)
