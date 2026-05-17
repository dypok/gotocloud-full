import json

from app.services.azure_openai import AzureOpenAIService


class IntelligenceAgent:
    def __init__(self, azure_service: AzureOpenAIService):
        self.azure_service = azure_service
        self.system_prompt = (
            "You are the GoToCloud Intelligence Agent. "
            "You receive precomputed operational and commercial analytics in structured JSON. "
            "Do not invent raw metrics. Interpret the analytics and produce concise executive insights, "
            "risk alerts, recommendations, and business opportunities."
        )

    def summarize_operational_analytics(self, analytics_payload: dict) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": (
                    "Generate an operational executive summary from this JSON. "
                    "Include risks, trends, and recommended actions.\n\n"
                    f"{json.dumps(analytics_payload, ensure_ascii=False, indent=2)}"
                ),
            },
        ]
        return self.azure_service.chat(messages)

    def summarize_commercial_analytics(self, analytics_payload: dict) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": (
                    "Generate a commercial summary from this JSON. "
                    "Highlight service demand, intent signals, lead opportunities, and next actions.\n\n"
                    f"{json.dumps(analytics_payload, ensure_ascii=False, indent=2)}"
                ),
            },
        ]
        return self.azure_service.chat(messages)

    def generate_insights(self, analytics_payload: dict) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": (
                    "Generate 3 to 5 high-value business and operational insights from this analytics JSON. "
                    "Be concrete, executive, and action-oriented.\n\n"
                    f"{json.dumps(analytics_payload, ensure_ascii=False, indent=2)}"
                ),
            },
        ]
        return self.azure_service.chat(messages)

    def detect_lead_opportunities(self, analytics_payload: dict) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {
                "role": "user",
                "content": (
                    "Based on this structured analytics JSON, identify lead opportunities, commercial intent, "
                    "priority level, and recommended follow-up actions.\n\n"
                    f"{json.dumps(analytics_payload, ensure_ascii=False, indent=2)}"
                ),
            },
        ]
        return self.azure_service.chat(messages)