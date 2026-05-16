import json
from typing import Any

import redis


class RedisService:
    def __init__(self, redis_url: str):
        self.client = redis.Redis.from_url(redis_url, decode_responses=True)

    def ping(self) -> bool:
        return self.client.ping()

    def get_json(self, key: str) -> dict[str, Any] | None:
        value = self.client.get(key)
        if not value:
            return None
        return json.loads(value)

    def set_json(self, key: str, value: dict[str, Any], ttl_seconds: int | None = None) -> bool:
        payload = json.dumps(value)
        return bool(self.client.set(name=key, value=payload, ex=ttl_seconds))

    def delete(self, key: str) -> int:
        return self.client.delete(key)