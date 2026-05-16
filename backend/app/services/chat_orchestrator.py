from app.agents.customer_agent import CustomerAgent
from app.services.azure_openai import AzureOpenAIService


class ChatOrchestrator:
    def __init__(self, azure_openai_service: AzureOpenAIService):
        self.customer_agent = CustomerAgent(
            azure_openai_service=azure_openai_service
        )

    def process(self, user_message: str, context: dict) -> str:
        return self.customer_agent.respond(
            user_message=user_message,
            context=context,
        )