from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_gemini_service, get_redis_service
from app.schemas.health import HealthResponse
from app.services.gemini_service import GeminiService
from app.services.redis_service import RedisService

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health_check(
    redis_service: RedisService = Depends(get_redis_service),
    gemini_service: GeminiService = Depends(get_gemini_service),
):
    try:
        redis_ok = redis_service.ping()
    except Exception:
        redis_ok = False

    try:
        gemini_ok = gemini_service.healthcheck()
    except Exception:
        gemini_ok = False

    overall_status = "ok" if redis_ok and gemini_ok else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.app_name,
        environment=settings.app_env,
        redis=redis_ok,
        gemini=gemini_ok,
    )
