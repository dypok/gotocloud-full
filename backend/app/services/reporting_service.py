from sqlmodel import Session, select, func
from app.models.schemas import Conversation, LeadOpportunity, Report
from app.agents.intelligence_agent import IntelligenceAgent
from datetime import datetime, timedelta

class ReportingService:
    def __init__(self, db: Session, intelligence_agent: IntelligenceAgent):
        self.db = db
        self.agent = intelligence_agent

    def generate_daily_report(self):
        """Aggregate metrics and generate a daily report."""
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        # Simple aggregations
        total_convs = self.db.exec(select(func.count(Conversation.id)).where(Conversation.timestamp > yesterday)).one()
        total_leads = self.db.exec(select(func.count(LeadOpportunity.id)).where(LeadOpportunity.created_at > yesterday)).one()
        
        metrics = {
            "period": "Last 24 hours",
            "total_conversations": total_convs,
            "new_leads": total_leads,
            "top_interests": ["Cloud Migration", "AI Solutions"], # Mocked for now
        }
        
        narrative = self.agent.generate_report(metrics)
        
        report = Report(
            report_type="daily_operational",
            title=f"Daily Report - {datetime.utcnow().strftime('%Y-%m-%d')}",
            content_markdown=narrative,
            distributed=False
        )
        self.db.add(report)
        self.db.commit()
        return report
