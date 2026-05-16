from fastapi import Request

from backend.app.core.config import AppSettings, get_settings as get_app_settings
from backend.app.services.azure_openai import AzureOpenAIService
from backend.app.services.gemini_service import GeminiService
from backend.app.services.redis_service import RedisService


def get_settings() -> AppSettings:
    return get_app_settings()


def get_azure_openai_service(request: Request) -> AzureOpenAIService:
    return request.app.state.azure_openai


def get_redis_service(request: Request) -> RedisService:
    return request.app.state.redis


def get_gemini_service(request: Request) -> GeminiService:
    return request.app.state.gemini
