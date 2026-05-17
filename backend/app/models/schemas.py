from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID, uuid4

from datetime import datetime, UTC
from typing import Optional
from sqlmodel import Field

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import JSONB

try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ModuleNotFoundError:
    Vector = None
    PGVECTOR_AVAILABLE = False


# --- 1. SESSIONS (Ancla de identidad global) ---
class Session(SQLModel, table=True):
    __tablename__ = "sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    phone_number: Optional[str] = Field(default=None, index=True)
    anonymous: bool = Field(default=True)
    caller_type: Optional[str] = Field(default=None)
    first_channel: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    conversations: List["Conversation"] = Relationship(back_populates="session")
    incidents: List["Incident"] = Relationship(back_populates="session")
    leads: List["LeadOpportunity"] = Relationship(back_populates="session")
    escalations: List["Escalation"] = Relationship(back_populates="session")
    channel_switches: List["ChannelSwitch"] = Relationship(back_populates="session")


# --- 2. CONVERSATIONS ---
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    channel: str
    role: str
    message: str
    sentiment_score: Optional[float] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    session: Session = Relationship(back_populates="conversations")


# --- 3. INCIDENTS ---
class Incident(SQLModel, table=True):
    __tablename__ = "incidents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    category: str
    priority: str
    status: str = Field(default="open")
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Session = Relationship(back_populates="incidents")


# --- 4. VECTOR DOCUMENTS (RAG) ---
if PGVECTOR_AVAILABLE:
    class VectorDocument(SQLModel, table=True):
        __tablename__ = "vector_documents"

        id: UUID = Field(default_factory=uuid4, primary_key=True)
        content: str
        metadata_doc: dict = Field(
            default_factory=dict,
            sa_column=Column("metadata", JSONB),
        )
        embedding: Any = Field(sa_column=Column(Vector(3072)))
else:
    class VectorDocument(SQLModel, table=True):
        __tablename__ = "vector_documents"

        id: UUID = Field(default_factory=uuid4, primary_key=True)
        content: str
        metadata_doc: dict = Field(
            default_factory=dict,
            sa_column=Column("metadata", JSONB),
        )
        embedding: Any = Field(default=None, sa_column=Column(Text, nullable=True))


# --- 5. LEAD OPPORTUNITIES ---
class LeadOpportunity(SQLModel, table=True):
    __tablename__ = "lead_opportunities"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    phone_number: Optional[str] = Field(default=None, index=True)
    industry: Optional[str] = Field(default=None)
    interest_area: Optional[str] = Field(default=None)
    lead_score: Optional[int] = Field(default=None, index=True)
    recommended_action: Optional[str] = Field(default=None)
    qualified: bool = Field(default=False)
    notes: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    session: Session = Relationship(back_populates="leads")


# --- 6. ESCALATIONS ---
class Escalation(SQLModel, table=True):
    __tablename__ = "escalations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    reason: str
    conversation_summary: Optional[str] = Field(default=None)
    status: str = Field(default="pending", index=True)
    assigned_to: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)

    session: Session = Relationship(back_populates="escalations")


# --- 7. CHANNEL SWITCHES ---
class ChannelSwitch(SQLModel, table=True):
    __tablename__ = "channel_switches"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    from_channel: str
    to_channel: str
    reason: Optional[str] = Field(default=None)
    context_summary: Optional[str] = Field(default=None)
    initiated_by: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    session: Session = Relationship(back_populates="channel_switches")


# --- 8. INSIGHTS (Intelligence Agent output) ---
class Insight(SQLModel, table=True):
    __tablename__ = "insights"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    insight_type: str = Field(index=True)
    severity: str = Field(default="info", index=True)
    title: str
    narrative: str
    recommended_action: Optional[str] = Field(default=None)
    data_payload: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    acknowledged: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


# --- 9. REPORTS ---
class Report(SQLModel, table=True):
    __tablename__ = "reports"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    report_type: str = Field(index=True)
    title: str
    content_markdown: str = Field(sa_column=Column(Text))
    distribution_channels: list = Field(default_factory=list, sa_column=Column(JSONB))
    distributed: bool = Field(default=False)
    distributed_at: Optional[datetime] = Field(default=None)
    period_start: Optional[datetime] = Field(default=None)
    period_end: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

class ChatLog(SQLModel, table=True):
    _tablename_ = "chat_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_message: str
    bot_response: str
    lead_score: int = Field(default=0)  
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))