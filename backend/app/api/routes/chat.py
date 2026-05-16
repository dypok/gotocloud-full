from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_chat_orchestrator, get_redis_service
from app.memory.session_manager import SessionManager
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_orchestrator import ChatOrchestrator
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
    chat_orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
):
    context = session_manager.get_or_create_context(
        session_id=payload.session_id,
        channel=payload.channel,
    )

    context["last_channel"] = payload.channel

    reply = chat_orchestrator.process(
        user_message=payload.message,
        context=context,
    )

    recent_messages = context.get("recent_messages", [])
    recent_messages.append({"role": "user", "message": payload.message})
    recent_messages.append({"role": "assistant", "message": reply})
    context["recent_messages"] = recent_messages[-10:]

    persisted = session_manager.save_context(context)

    return ChatResponse(
        session_id=context["session_id"],
        reply=reply,
        channel=payload.channel,
        context_loaded=True,
        context_persisted=persisted,
    )