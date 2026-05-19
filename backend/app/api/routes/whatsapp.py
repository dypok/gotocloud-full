from fastapi import APIRouter, Request, Depends, Response
from app.services.chat_orchestrator import ChatOrchestrator
from app.services.twilio_service import TwilioService
from app.core.dependencies import get_chat_orchestrator
from app.memory.session_manager import SessionManager
from app.core.config import settings
from app.services.redis_service import RedisService
import uuid

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

def get_session_manager(redis_service: RedisService = Depends(lambda: RedisService(settings.redis_url))):
    return SessionManager(redis_service=redis_service, context_ttl_minutes=settings.redis_context_ttl_minutes)

@router.post("/inbound")
async def handle_whatsapp_inbound(
    request: Request,
    orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
    session_manager: SessionManager = Depends(get_session_manager)
):
    form_data = await request.form()
    from_number = form_data.get("From", "").replace("whatsapp:", "")
    message_body = form_data.get("Body")
    
    if not message_body:
        return Response(status_code=200)

    session_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, from_number))
    context = session_manager.get_or_create_context(session_id=session_id, channel="whatsapp")
    
    reply = orchestrator.process(user_message=message_body, context=context)
    
    context["recent_messages"].append({"role": "user", "message": message_body, "channel": "whatsapp"})
    context["recent_messages"].append({"role": "assistant", "message": reply, "channel": "whatsapp"})
    session_manager.save_context(context)

    # Return TwiML to send reply
    return Response(
        content=f'<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>{reply}</Body></Message></Response>',
        media_type="application/xml"
    )
