from app.agents.customer_agent import CustomerAgent
from app.services.azure_openai import AzureOpenAIService
from app.services.tool_service import ToolService


class ChatOrchestrator:
    def __init__(
        self,
        azure_openai_service: AzureOpenAIService,
        tool_service: ToolService,
    ):
        self.customer_agent = CustomerAgent(
            azure_openai_service=azure_openai_service,
            tool_service=tool_service,
        )

    def process(self, user_message: str, context: dict) -> str:
        return self.customer_agent.respond(
            user_message=user_message,
            context=context,
        )