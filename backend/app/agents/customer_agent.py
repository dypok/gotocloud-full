from app.prompts.customer_agent_prompt import SYSTEM_PROMPT
from app.services.azure_openai import AzureOpenAIService


class CustomerAgent:
    def __init__(self, azure_openai_service: AzureOpenAIService):
        self.azure_openai_service = azure_openai_service

    def build_messages(self, user_message: str, context: dict) -> list[dict]:
        recent_messages = context.get("recent_messages", [])
        active_issue = context.get("active_issue")
        last_channel = context.get("last_channel")
        sentiment = context.get("sentiment")

        context_summary_parts = []

        if active_issue:
            context_summary_parts.append(f"Active issue: {active_issue}")
        if last_channel:
            context_summary_parts.append(f"Last channel: {last_channel}")
        if sentiment:
            context_summary_parts.append(f"Sentiment: {sentiment}")

        context_summary = "\n".join(context_summary_parts).strip()

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if context_summary:
            messages.append(
                {
                    "role": "system",
                    "content": f"Conversation context:\n{context_summary}",
                }
            )

        for message in recent_messages[-6:]:
            role = message.get("role", "user")
            content = message.get("message", "")
            if content:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})
        return messages

    def respond(self, user_message: str, context: dict) -> str:
        messages = self.build_messages(user_message=user_message, context=context)
        return self.azure_openai_service.chat(messages=messages)