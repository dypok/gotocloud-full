import json
from typing import Any

from app.services.redis_service import RedisService


class ContextStore:
    def __init__(self, redis_service: RedisService):
        self.redis = redis_service

    def _key(self, session_id: str) -> str:
        return f"context:{session_id}"

    def get_context(self, session_id: str) -> dict[str, Any]:
        raw = self.redis.get(self._key(session_id))
        if not raw:
            return {
                "active_issue": None,
                "recent_messages": [],
                "last_channel": "webchat",
                "sentiment": "neutral",
                "priority": "normal",
            }

        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")

        return json.loads(raw)

    def save_context(self, session_id: str, context: dict[str, Any], ttl_seconds: int = 3600) -> None:
        self.redis.set(
            self._key(session_id),
            json.dumps(context),
            ex=ttl_seconds,
        )

    def update_context(self, session_id: str, updates: dict[str, Any], ttl_seconds: int = 3600) -> dict[str, Any]:
        current = self.get_context(session_id)
        current.update(updates)
        self.save_context(session_id, current, ttl_seconds=ttl_seconds)
        return current

    def append_message(
        self,
        session_id: str,
        role: str,
        message: str,
        channel: str = "webchat",
        max_messages: int = 10,
        ttl_seconds: int = 3600,
    ) -> dict[str, Any]:
        current = self.get_context(session_id)

        recent = current.get("recent_messages", [])
        recent.append(
            {
                "role": role,
                "message": message,
                "channel": channel,
            }
        )
        current["recent_messages"] = recent[-max_messages:]
        current["last_channel"] = channel

        self.save_context(session_id, current, ttl_seconds=ttl_seconds)
        return current

    def clear_context(self, session_id: str) -> None:
        self.redis.delete(self._key(session_id))