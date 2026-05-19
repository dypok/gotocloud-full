from fastapi import APIRouter, Depends
from sqlmodel import Session as DBSession

from app.agents.intelligence_agent import IntelligenceAgent
from app.analytics.aggregator import AnalyticsAggregator
from app.core.dependencies import get_gemini_service, get_db
from app.models.schemas import Report
from app.services.gemini_service import GeminiService
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(tags=["dashboard"])


class IntelligenceQuery(BaseModel):
    query: str


@router.get("/dashboard/metrics")
def get_metrics(db: DBSession = Depends(get_db)):
    aggregator = AnalyticsAggregator(db=db)
    summary = aggregator.get_full_summary(hours=24)

    operational = summary["operational"]
    commercial = summary["commercial"]

    kpis = {
        "active_incidents": operational.get("active_incidents", 0),
        "sla_risk": operational.get("sla_risk", 0),
        "sentiment": "Positivo" if operational.get("resolution_rate", 0) >= 60 else "Neutro",
        "leads": len(commercial.get("potential_opportunity_sessions", [])),
    }

    return {
        "kpis": kpis,
        "operational": operational,
        "commercial": commercial,
        "generated_at": summary.get("generated_at"),
    }


@router.post("/intelligence/query")
def query_intelligence(
    payload: IntelligenceQuery,
    db: DBSession = Depends(get_db),
    gemini_service: GeminiService = Depends(get_gemini_service),
):
    aggregator = AnalyticsAggregator(db=db)
    summary = aggregator.get_full_summary(hours=24)

    agent = IntelligenceAgent(gemini_service=gemini_service)

    messages = [
        {
            "role": "user",
            "content": (
                f"Usa este contexto de analíticas:\n{summary}\n\n"
                f"Responde a esta pregunta: {payload.query}\n\n"
                "Sé conciso y responde en el mismo idioma de la pregunta."
            ),
        },
    ]
    answer = gemini_service.chat(messages=messages)

    return {"answer": answer, "type": "intelligence"}


@router.post("/reports/generate")
def generate_report(
    db: DBSession = Depends(get_db),
    gemini_service: GeminiService = Depends(get_gemini_service),
):
    aggregator = AnalyticsAggregator(db=db)
    summary = aggregator.get_full_summary(hours=24)

    agent = IntelligenceAgent(gemini_service=gemini_service)
    # IntelligenceAgent has generate_report method
    content = agent.generate_report(summary)

    report = Report(
        report_type="operational",
        title=f"Reporte Operativo — {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC",
        content_markdown=content,
        distribution_channels=["dashboard"],
        distributed=False,
        period_start=datetime.utcnow(),
        period_end=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Reporte generado correctamente.",
        "report_id": str(report.id),
        "content": content,
    }