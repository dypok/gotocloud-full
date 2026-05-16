from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_redis_service
from app.memory.session_manager import SessionManager
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.redis_service import RedisService

router = APIRouter(prefix="/chat", tags=["chat"])


def get_session_manager(
    redis_service: RedisService = Depends(get_redis_service),
) -> SessionManager:
    return SessionManager(
        redis_service=redis_service,
        context_ttl_minutes=settings.redis_context_ttl_minutes,
    )


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    session_manager: SessionManager = Depends(get_session_manager),
):
    context = session_manager.get_or_create_context(
        session_id=payload.session_id,
        channel=payload.channel,
    )

    recent_messages = context.get("recent_messages", [])
    recent_messages.append({"role": "user", "message": payload.message})
    context["recent_messages"] = recent_messages[-10:]
    context["last_channel"] = payload.channel

    persisted = session_manager.save_context(context)

    return ChatResponse(
        session_id=context["session_id"],
        reply="Backend foundation ready. Customer Agent will be connected in Phase 2.",
        channel=payload.channel,
        context_loaded=True,
        context_persisted=persisted,
    )