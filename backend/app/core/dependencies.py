from functools import lru_cache

from fastapi import Depends

from app.core.config import settings
from app.services.azure_openai import AzureOpenAIService
from app.services.chat_orchestrator import ChatOrchestrator
from app.services.redis_service import RedisService


@lru_cache
def get_redis_service() -> RedisService:
    return RedisService(redis_url=settings.redis_url)


@lru_cache
def get_azure_openai_service() -> AzureOpenAIService:
    return AzureOpenAIService()


def get_chat_orchestrator(
    azure_service: AzureOpenAIService = Depends(get_azure_openai_service),
) -> ChatOrchestrator:
    return ChatOrchestrator(azure_openai_service=azure_service)