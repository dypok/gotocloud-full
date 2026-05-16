from functools import lru_cache

from app.core.config import settings
from app.services.azure_openai import AzureOpenAIService
from app.services.redis_service import RedisService


@lru_cache
def get_settings():
    return settings


@lru_cache
def get_redis_service() -> RedisService:
    return RedisService(redis_url=settings.redis_url)


@lru_cache
def get_azure_openai_service() -> AzureOpenAIService:
    return AzureOpenAIService(
        endpoint=settings.azure_openai_endpoint,
        api_key=settings.azure_openai_api_key,
        deployment_gpt4o=settings.azure_openai_deployment_gpt4o,
        deployment_mini=settings.azure_openai_deployment_mini,
        embeddings_deployment=settings.azure_openai_embeddings,
    )

