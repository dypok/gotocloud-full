from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_azure_openai_service, get_redis_service
from app.schemas.health import HealthResponse
from app.services.azure_openai import AzureOpenAIService
from app.services.redis_service import RedisService

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health_check(
    redis_service: RedisService = Depends(get_redis_service),
    azure_service: AzureOpenAIService = Depends(get_azure_openai_service),
):
    try:
        redis_ok = redis_service.ping()
    except Exception:
        redis_ok = False

    try:
        azure_ok = azure_service.healthcheck()
    except Exception:
        azure_ok = False

    overall_status = "ok" if redis_ok and azure_ok else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.app_name,
        environment=settings.app_env,
        redis=redis_ok,
        azure_openai=azure_ok,
    )