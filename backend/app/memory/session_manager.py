import uuid
from typing import Any
from uuid import UUID

from app.services.redis_service import RedisService


class SessionManager:
    def __init__(self, redis_service: RedisService, context_ttl_minutes: int = 60):
        self.redis_service = redis_service
        self.context_ttl_minutes = context_ttl_minutes

    def generate_session_id(self) -> str:
        return str(uuid.uuid4())

    def _to_string(self, session_id: str | UUID | None) -> str | None:
        """Convierte UUID a string, mantiene string si ya es string."""
        if session_id is None:
            return None
        return str(session_id)

    def build_context_key(self, session_id: str | UUID) -> str:
        return f"session:{self._to_string(session_id)}:context"

    def default_context(self, session_id: str | UUID, channel: str = "webchat") -> dict[str, Any]:
        return {
            "session_id": self._to_string(session_id),
            "active_issue": None,
            "recent_messages": [],
            "last_channel": channel,
            "sentiment": "neutral",
            "priority": "normal",
        }

    def load_context(self, session_id: str | UUID | None) -> dict[str, Any] | None:
        session_id_str = self._to_string(session_id)
        if not session_id_str:
            return None
        key = self.build_context_key(session_id_str)
        return self.redis_service.get_json(key)

    def get_or_create_context(self, session_id: str | UUID | None, channel: str = "webchat") -> dict[str, Any]:
        session_id_str = self._to_string(session_id)
        if not session_id_str:
            session_id_str = self.generate_session_id()

        key = self.build_context_key(session_id_str)
        context = self.redis_service.get_json(key)

        if context:
            return context

        context = self.default_context(session_id=session_id_str, channel=channel)
        self.redis_service.set_json(
            key=key,
            value=context,
            ttl_seconds=self.context_ttl_minutes * 60,
        )
        return context

    def save_context(self, context: dict[str, Any]) -> bool:
        session_id = self._to_string(context["session_id"])
        key = self.build_context_key(session_id)
        return self.redis_service.set_json(
            key=key,
            value=context,
            ttl_seconds=self.context_ttl_minutes * 60,
        )