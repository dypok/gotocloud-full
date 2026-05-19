from datetime import datetime, timedelta
from collections import Counter

from sqlmodel import Session as DBSession, select

from app.models.schemas import Session as SessionModel, Conversation, Incident


class AnalyticsAggregator:
    def __init__(self, db: DBSession):
        self.db = db

    def _get_recent_sessions(self, hours: int = 24) -> list[SessionModel]:
        since = datetime.utcnow() - timedelta(hours=hours)
        statement = select(SessionModel).where(SessionModel.created_at >= since)
        return self.db.exec(statement).all()

    def _get_recent_conversations(self, hours: int = 24) -> list[Conversation]:
        since = datetime.utcnow() - timedelta(hours=hours)
        statement = select(Conversation).where(Conversation.timestamp >= since)
        return self.db.exec(statement).all()

    def _get_recent_incidents(self, hours: int = 24) -> list[Incident]:
        since = datetime.utcnow() - timedelta(hours=hours)
        statement = select(Incident).where(Incident.created_at >= since)
        return self.db.exec(statement).all()

    def get_operational_summary(self, hours: int = 24) -> dict:
        sessions = self._get_recent_sessions(hours=hours)
        conversations = self._get_recent_conversations(hours=hours)
        incidents = self._get_recent_incidents(hours=hours)

        active_incidents = [
            i for i in incidents
            if (i.status or "").lower() in ("open", "in_progress", "escalated")
        ]
        resolved_incidents = [
            i for i in incidents
            if (i.status or "").lower() == "resolved"
        ]

        anonymous_sessions = [s for s in sessions if s.anonymous]
        identified_sessions = [s for s in sessions if not s.anonymous]

        incident_categories = Counter((i.category or "unknown") for i in incidents)
        priorities = Counter((i.priority or "unknown") for i in incidents)
        channels = Counter((c.channel or "unknown") for c in conversations)

        sessions_with_conversations = {str(c.session_id) for c in conversations if c.session_id}
        inactive_sessions = [s for s in sessions if str(s.id) not in sessions_with_conversations]

        return {
            "window_hours": hours,
            "session_volume": len(sessions),
            "anonymous_sessions": len(anonymous_sessions),
            "identified_sessions": len(identified_sessions),
            "sessions_without_conversation": len(inactive_sessions),
            "conversation_volume": len(conversations),
            "incident_volume": len(incidents),
            "active_incidents": len(active_incidents),
            "resolved_incidents": len(resolved_incidents),
            "incident_categories": dict(incident_categories),
            "priority_breakdown": dict(priorities),
            "channel_breakdown": dict(channels),
            "sla_risk": len(
                [i for i in active_incidents if (i.priority or "").lower() in ("high", "critical")]
            ),
            "emerging_topics": self._extract_emerging_topics(conversations),
            "resolution_rate": self._calculate_resolution_rate(incidents),
        }

    def get_commercial_summary(self, hours: int = 24) -> dict:
        conversations = self._get_recent_conversations(hours=hours)

        signals = {
            "cloud_migration_mentions": 0,
            "security_mentions": 0,
            "pricing_demo_mentions": 0,
            "enterprise_mentions": 0,
            "multiple_conversations_sessions": 0,
        }

        session_message_counter = Counter()
        opportunity_sessions = set()

        for conv in conversations:
            text = (conv.message or "").lower()
            session_id = str(conv.session_id) if conv.session_id else None

            if session_id:
                session_message_counter[session_id] += 1

            if any(word in text for word in ["gemini", "cloud"]) and any(word in text for word in ["migration", "migrate", "modernization"]):
                signals["cloud_migration_mentions"] += 1
                if session_id:
                    opportunity_sessions.add(session_id)

            if any(word in text for word in ["security", "mfa", "casb", "zero trust", "identity"]):
                signals["security_mentions"] += 1
                if session_id:
                    opportunity_sessions.add(session_id)

            if any(word in text for word in ["pricing", "demo", "quote", "proposal", "cost"]):
                signals["pricing_demo_mentions"] += 1
                if session_id:
                    opportunity_sessions.add(session_id)

            if any(word in text for word in ["enterprise", "company", "corporate", "organization", "business"]):
                signals["enterprise_mentions"] += 1
                if session_id:
                    opportunity_sessions.add(session_id)

        multi_conversation_sessions = [
            session_id for session_id, count in session_message_counter.items()
            if count >= 3
        ]
        signals["multiple_conversations_sessions"] = len(multi_conversation_sessions)
        opportunity_sessions.update(multi_conversation_sessions)

        lead_score = (
            signals["cloud_migration_mentions"] * 30
            + signals["security_mentions"] * 20
            + signals["enterprise_mentions"] * 25
            + signals["multiple_conversations_sessions"] * 15
            + signals["pricing_demo_mentions"] * 30
        )

        return {
            "window_hours": hours,
            "signals": signals,
            "potential_opportunity_sessions": list(opportunity_sessions),
            "estimated_lead_score": lead_score,
            "service_demand_summary": self._extract_service_demand(conversations),
            "opportunity_trend": self._classify_opportunity_level(lead_score),
        }

    def get_full_summary(self, hours: int = 24) -> dict:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "operational": self.get_operational_summary(hours=hours),
            "commercial": self.get_commercial_summary(hours=hours),
        }

    def _extract_emerging_topics(self, conversations: list[Conversation]) -> list[str]:
        keywords = []
        tracked_terms = [
            "gemini",
            "migration",
            "vm",
            "security",
            "mfa",
            "casb",
            "network",
            "data",
            "ai",
            "pricing",
            "demo",
            "incident",
            "cloud",
            "copilot",
        ]

        for conv in conversations:
            text = (conv.message or "").lower()
            for term in tracked_terms:
                if term in text:
                    keywords.append(term)

        common = Counter(keywords).most_common(5)
        return [term for term, _ in common]

    def _extract_service_demand(self, conversations: list[Conversation]) -> dict:
        service_map = {
            "cloud_modernization": ["gemini", "migration", "cloud", "modernization"],
            "security": ["security", "mfa", "casb", "zero trust", "identity"],
            "data_ai": ["data", "ai", "analytics", "copilot", "ml"],
            "infrastructure": ["vm", "server", "network", "infra", "hosting"],
        }

        counts = Counter()

        for conv in conversations:
            text = (conv.message or "").lower()
            for service, terms in service_map.items():
                if any(term in text for term in terms):
                    counts[service] += 1

        return dict(counts)

    def _calculate_resolution_rate(self, incidents: list[Incident]) -> float:
        if not incidents:
            return 0.0

        resolved = [i for i in incidents if (i.status or "").lower() == "resolved"]
        return round((len(resolved) / len(incidents)) * 100, 2)

    def _classify_opportunity_level(self, lead_score: int) -> str:
        if lead_score >= 120:
            return "high"
        if lead_score >= 60:
            return "medium"
        if lead_score > 0:
            return "low"
        return "none"