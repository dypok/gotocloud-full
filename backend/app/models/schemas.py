from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import Column, JSON
from pgvector.sqlalchemy import Vector  # Asegúrate de tener instalado pip install pgvector

# --- 1. SESSIONS (Ancla de identidad global) ---
class Session(SQLModel, table=True):
    __tablename__ = "sessions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    phone_number: Optional[str] = Field(default=None, index=True)
    anonymous: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    # Relaciones para acceder fácilmente a los datos vinculados
    conversations: List["Conversation"] = Relationship(back_populates="session")
    incidents: List["Incident"] = Relationship(back_populates="session")


# --- 2. CONVERSATIONS (Historial de chat persistente multicanal) ---
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    channel: str  # "web_chat", "whatsapp", "voice"
    role: str     # "user", "assistant", "system"
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Relación inversa hacia la sesión
    session: Session = Relationship(back_populates="conversations")


# --- 3. INCIDENTS (Tickets de soporte técnico/operativo) ---
class Incident(SQLModel, table=True):
    __tablename__ = "incidents"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    category: str
    priority: str
    status: str = Field(default="open")  # "open", "resolved", "escalated"
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relación inversa hacia la sesión
    session: Session = Relationship(back_populates="incidents")


# --- 4. VECTOR DOCUMENTS (Base de conocimiento indexada para el RAG) ---
class VectorDocument(SQLModel, table=True):
    __tablename__ = "vector_documents"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    content: str
    # JSONB nativo de PostgreSQL para metadatos flexibles del scraper
    metadata_doc: dict = Field(default={}, sa_column=Column("metadata", JSON))
    # Dimensión 1536 mapea directo con text-embedding-3-small o text-encoding-ada-002 de Azure
    embedding: Any = Field(sa_column=Column(Vector(3072)))