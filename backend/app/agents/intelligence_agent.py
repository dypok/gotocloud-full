from app.services.gemini_service import GeminiService
from typing import List, Dict

class IntelligenceAgent:
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    def generate_report(self, metrics: Dict, report_type: str = "daily") -> str:
        """Generate a narrative report based on raw metrics."""
        prompt = f"""
        You are the GoToCloud Intelligence Agent. Generate a {report_type} executive report based on the following metrics:
        {metrics}
        
        The report should include:
        1. Executive Summary
        2. Operational Trends (Sentiment, Volume)
        3. Commercial Insights (Lead Quality, Interest Areas)
        4. Recommended Actions
        
        Format the output in professional Markdown.
        """
        messages = [{"role": "user", "content": prompt}]
        return self.gemini_service.chat(messages=messages)

    def analyze_anomalies(self, recent_logs: List[Dict]) -> List[Dict]:
        """Detect anomalies or urgent issues in recent logs."""
        prompt = f"""
        Analyze these recent conversation logs for anomalies, high frustration, or urgent lead opportunities:
        {recent_logs}
        
        Return a list of alerts in JSON format with 'title', 'severity' (high, medium, low), and 'description'.
        """
        # Note: In a real scenario, we'd use structured output (JSON mode)
        messages = [{"role": "user", "content": prompt}]
        response = self.gemini_service.chat(messages=messages)
        return response # Simplified for now

    def summarize_commercial_analytics(self, payload: Dict) -> str:
        prompt = f"Analyze the following commercial data and provide a concise summary of leads and opportunities:\n{payload}"
        return self.gemini_service.chat([{"role": "user", "content": prompt}])

    def summarize_operational_analytics(self, payload: Dict) -> str:
        prompt = f"Analyze the following operational data and provide a concise summary of session volumes and resolution rates:\n{payload}"
        return self.gemini_service.chat([{"role": "user", "content": prompt}])

    def generate_insights(self, payload: Dict) -> str:
        prompt = f"Based on the following data, generate 3 high-level strategic insights for the business:\n{payload}"
        return self.gemini_service.chat([{"role": "user", "content": prompt}])
