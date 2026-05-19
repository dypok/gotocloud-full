from fastapi import APIRouter, Request, Depends, Response
from twilio.twiml.voice_response import VoiceResponse
from app.services.chat_orchestrator import ChatOrchestrator
from app.services.twilio_service import TwilioService
from app.core.dependencies import get_chat_orchestrator
from app.memory.session_manager import SessionManager
from app.core.config import settings
from app.services.redis_service import RedisService
import uuid

router = APIRouter(prefix="/voice", tags=["voice"])

def get_session_manager(redis_service: RedisService = Depends(lambda: RedisService(settings.redis_url))):
    return SessionManager(redis_service=redis_service, context_ttl_minutes=settings.redis_context_ttl_minutes)

@router.post("/inbound")
async def handle_voice_inbound(
    request: Request,
    orchestrator: ChatOrchestrator = Depends(get_chat_orchestrator),
    session_manager: SessionManager = Depends(get_session_manager)
):
    form_data = await request.form()
    from_number = form_data.get("From")
    speech_result = form_data.get("SpeechResult")
    
    # Use phone number as session identifier
    session_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, from_number))
    context = session_manager.get_or_create_context(session_id=session_id, channel="voice")
    
    if not speech_result:
        # Initial greeting
        reply = "Hola, bienvenido a GoToCloud. ¿En qué puedo ayudarte hoy?"
    else:
        reply = orchestrator.process(user_message=speech_result, context=context)
        context["recent_messages"].append({"role": "user", "message": speech_result, "channel": "voice"})
        context["recent_messages"].append({"role": "assistant", "message": reply, "channel": "voice"})
        session_manager.save_context(context)

    response = VoiceResponse()
    gather = response.gather(input="speech", action="/voice/inbound", language="es-MX", speech_timeout="auto")
    gather.say(reply, language="es-MX")
    
    return Response(content=str(response), media_type="application/xml")
