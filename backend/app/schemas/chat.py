from uuid import UUID
from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: UUID | None = None
    message: str
    channel: str = "webchat"


class ChatResponse(BaseModel):
    session_id: UUID
    reply: str
    channel: str
    context_loaded: bool
    context_persisted: bool