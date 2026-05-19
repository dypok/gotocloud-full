from app.agents.customer_agent import CustomerAgent
from app.services.gemini_service import GeminiService
from app.services.tool_service import ToolService


class ChatOrchestrator:
    def __init__(
        self,
        gemini_service: GeminiService,
        tool_service: ToolService,
    ):
        self.customer_agent = CustomerAgent(
            gemini_service=gemini_service,
            tool_service=tool_service,
        )

    def process(self, user_message: str, context: dict) -> str:
        return self.customer_agent.respond(
            user_message=user_message,
            context=context,
        )
