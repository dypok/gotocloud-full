from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str = Field(..., min_length=1)
    channel: str = "webchat"


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    channel: str
    context_loaded: bool
    context_persisted: bool