import json
from typing import Any

import redis
from redis.exceptions import ConnectionError as RedisConnectionError


class RedisService:
    def __init__(self, redis_url: str):
        self.client = redis.Redis.from_url(
            redis_url,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
            retry_on_timeout=True,
        )

    def ping(self) -> bool:
        try:
            return self.client.ping()
        except RedisConnectionError:
            return False

    def get_json(self, key: str) -> dict[str, Any] | None:
        try:
            value = self.client.get(key)
            if not value:
                return None
            return json.loads(value)
        except RedisConnectionError:
            return None

    def set_json(
        self,
        key: str,
        value: dict[str, Any],
        ttl_seconds: int | None = None,
    ) -> bool:
        try:
            payload = json.dumps(value)
            return bool(self.client.set(name=key, value=payload, ex=ttl_seconds))
        except RedisConnectionError:
            return False

    def delete(self, key: str) -> int:
        try:
            return self.client.delete(key)
        except RedisConnectionError:
            return 0