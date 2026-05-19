from app.prompts.customer_agent_prompt import SYSTEM_PROMPT, VOICE_PROMPT
from app.services.gemini_service import GeminiService
from app.services.tool_service import ToolService


class CustomerAgent:
    def __init__(
        self,
        gemini_service: GeminiService,
        tool_service: ToolService,
    ):
        self.gemini_service = gemini_service
        self.tool_service = tool_service

    def build_messages(
        self,
        user_message: str,
        context: dict,
        kb_results: list[dict] | None,
        conversation_summary: str | None,
        lead_info: dict | None,
    ) -> list[dict]:
        recent_messages = context.get("recent_messages", [])
        active_issue = context.get("active_issue")
        last_channel = context.get("last_channel", "webchat")
        sentiment = context.get("sentiment")

        is_voice = last_channel == "voice"
        system = VOICE_PROMPT if is_voice else SYSTEM_PROMPT

        messages = [{"role": "system", "content": system}]

        context_summary_parts = []
        if active_issue:
            context_summary_parts.append(f"Active issue: {active_issue}")
        if last_channel:
            context_summary_parts.append(f"Channel: {last_channel}")
        if sentiment:
            context_summary_parts.append(f"Sentiment: {sentiment}")

        context_summary = "\n".join(context_summary_parts).strip()
        if context_summary:
            messages.append({
                "role": "system",
                "content": f"Conversation context:\n{context_summary}",
            })

        if kb_results:
            kb_text = "\n\n".join(
                [f"Snippet {i + 1}: {item['content']}" for i, item in enumerate(kb_results)]
            )
            if is_voice:
                messages.append({
                    "role": "system",
                    "content": (
                        "Use this knowledge to answer, but summarize in 1-2 spoken sentences only:\n\n"
                        f"{kb_text}"
                    ),
                })
            else:
                messages.append({
                    "role": "system",
                    "content": (
                        "Use the following knowledge base snippets when answering the user. "
                        "If the answer is not covered by these snippets, be honest about it.\n\n"
                        f"{kb_text}"
                    ),
                })

        if conversation_summary:
            messages.append({
                "role": "system",
                "content": f"Conversation summary:\n{conversation_summary}",
            })

        if lead_info:
            lead_text = (
                f"Lead opportunity detected with score {lead_info['lead_score']}. "
                f"Interest area: {lead_info.get('interest_area') or 'unspecified'}. "
                f"Recommended action: {lead_info['recommended_action']}"
            )
            messages.append({
                "role": "system",
                "content": f"A commercial lead has been detected in this conversation. {lead_text}",
            })

        for message in recent_messages[-6:]:
            role = message.get("role", "user")
            content = message.get("message", "")
            if content:
                messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})
        return messages

    def respond(self, user_message: str, context: dict) -> str:
        kb_results = self.tool_service.search_knowledge_base(user_message)
        conversation_summary = self.tool_service.build_conversation_summary(context)
        lead_info = self.tool_service.detect_lead_opportunity(
            message=user_message,
            session_id=context.get("session_id"),
        )

        messages = self.build_messages(
            user_message=user_message,
            context=context,
            kb_results=kb_results,
            conversation_summary=conversation_summary,
            lead_info=lead_info,
        )
        return self.gemini_service.chat(messages=messages)
