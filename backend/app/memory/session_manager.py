import uuid
from typing import Any

from app.services.redis_service import RedisService


class SessionManager:
    def __init__(self, redis_service: RedisService, context_ttl_minutes: int = 60):
        self.redis_service = redis_service
        self.context_ttl_minutes = context_ttl_minutes

    def generate_session_id(self) -> str:
        return str(uuid.uuid4())

    def build_context_key(self, session_id: str) -> str:
        return f"session:{session_id}:context"

    def default_context(self, session_id: str, channel: str = "webchat") -> dict[str, Any]:
        return {
            "session_id": session_id,
            "active_issue": None,
            "recent_messages": [],
            "last_channel": channel,
            "sentiment": "neutral",
            "priority": "normal",
        }

    def get_or_create_context(self, session_id: str | None, channel: str = "webchat") -> dict[str, Any]:
        if not session_id:
            session_id = self.generate_session_id()

        key = self.build_context_key(session_id)
        context = self.redis_service.get_json(key)

        if context:
            return context

        context = self.default_context(session_id=session_id, channel=channel)
        self.redis_service.set_json(
            key=key,
            value=context,
            ttl_seconds=self.context_ttl_minutes * 60,
        )
        return context

    def save_context(self, context: dict[str, Any]) -> bool:
        session_id = context["session_id"]
        key = self.build_context_key(session_id)
        return self.redis_service.set_json(
            key=key,
            value=context,
            ttl_seconds=self.context_ttl_minutes * 60,
        )