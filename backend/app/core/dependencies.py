from functools import lru_cache

from fastapi import Depends
from sqlmodel import Session, create_engine

from app.core.config import settings
from app.memory.memory_store import MemoryStore
from app.services.gemini_service import GeminiService
from app.services.chat_orchestrator import ChatOrchestrator
from app.services.redis_service import RedisService
from app.services.tool_service import ToolService

engine = create_engine(settings.postgres_url, echo=False)


def get_db():
    with Session(engine) as session:
        yield session


@lru_cache
def get_redis_service() -> RedisService:
    return RedisService(redis_url=settings.redis_url)


def get_memory_store(
    redis_service: RedisService = Depends(get_redis_service),
) -> MemoryStore:
    return MemoryStore(redis_service=redis_service)


@lru_cache
def get_gemini_service() -> GeminiService:
    return GeminiService()


def get_tool_service(
    db: Session = Depends(get_db),
    gemini_service: GeminiService = Depends(get_gemini_service),
) -> ToolService:
    return ToolService(db=db, ai_service=gemini_service)


def get_chat_orchestrator(
    gemini_service: GeminiService = Depends(get_gemini_service),
    tool_service: ToolService = Depends(get_tool_service),
) -> ChatOrchestrator:
    return ChatOrchestrator(
        gemini_service=gemini_service,
        tool_service=tool_service,
    )
