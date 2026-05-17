from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session as DBSession, select

from app.core.config import settings
from app.core.dependencies import get_chat_orchestrator, get_db, get_redis_service
from app.memory.session_manager import SessionManager
from app.models.schemas import Session as SessionModel, Conversation, Incident
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


def rebuild_context_from_db(
    db: DBSession,
    session_id: UUID,
    channel: str,
) -> dict:
    session_obj = db.get(SessionModel, session_id)

    if not session_obj:
        session_obj = SessionModel(
            id=session_id,
            anonymous=True,
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)

    recent_messages_stmt = (
        select(Conversation)
        .where(Conversation.session_id == session_obj.id)
        .order_by(Conversation.timestamp.desc())
        .limit(10)
    )
    recent_conversations = db.exec(recent_messages_stmt).all()
    recent_conversations.reverse()

    recent_messages = [
        {
            "role": item.role,
            "message": item.message,
            "channel": item.channel,
        }
        for item in recent_conversations
    ]

    incident_stmt = (
        select(Incident)
        .where(Incident.session_id == session_obj.id)
        .order_by(Incident.created_at.desc())
    )
    incidents = db.exec(incident_stmt).all()

    active_incident = next(
        (
            {
                "id": str(item.id),
                "category": item.category,
                "priority": item.priority,
                "status": item.status,
                "summary": item.summary,
            }
            for item in incidents
            if (item.status or "").lower() in ("open", "in_progress", "escalated")
        ),
        None,
    )

    last_channel = recent_messages[-1]["channel"] if recent_messages else channel

    return {
        "session_id": str(session_obj.id),
        "active_issue": active_incident,
        "recent_messages": recent_messages,
        "last_channel": last_channel,
        "sentiment": "neutral",
        "priority": active_incident["priority"] if active_incident else "normal",
    }


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    session_manager: SessionManager = Depends(get_session_manager),
    chat_orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
    db: DBSession = Depends(get_db),
):
    context_loaded = True

    context = session_manager.load_context(str(payload.session_id) if payload.session_id else None)

    if not context:
        context_loaded = False
        if payload.session_id:
            context = rebuild_context_from_db(
                db=db,
                session_id=payload.session_id,
                channel=payload.channel,
            )
        else:
            context = session_manager.get_or_create_context(
                session_id=None,
                channel=payload.channel,
            )

    session_id_str = str(context["session_id"])
    context["session_id"] = session_id_str
    session_id = UUID(session_id_str)

    session_obj = db.get(SessionModel, session_id)
    if not session_obj:
        session_obj = SessionModel(
            id=session_id,
            anonymous=True,
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)

    context["last_channel"] = payload.channel

    reply = chat_orchestrator.process(
        user_message=payload.message,
        context=context,
    )

    user_message_row = Conversation(
        session_id=session_obj.id,
        channel=payload.channel,
        role="user",
        message=payload.message,
        timestamp=datetime.utcnow(),
    )
    assistant_message_row = Conversation(
        session_id=session_obj.id,
        channel=payload.channel,
        role="assistant",
        message=reply,
        timestamp=datetime.utcnow(),
    )

    db.add(user_message_row)
    db.add(assistant_message_row)

    session_obj.last_activity = datetime.utcnow()
    db.add(session_obj)
    db.commit()

    recent_messages = context.get("recent_messages", [])
    recent_messages.append({"role": "user", "message": payload.message, "channel": payload.channel})
    recent_messages.append({"role": "assistant", "message": reply, "channel": payload.channel})
    context["recent_messages"] = recent_messages[-10:]

    context_persisted = session_manager.save_context(context)

    return ChatResponse(
        session_id=session_obj.id,
        reply=reply,
        channel=payload.channel,
        context_loaded=context_loaded,
        context_persisted=context_persisted,
    )