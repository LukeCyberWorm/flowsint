"""
SQLAlchemy models for Scarlet-IA chat and notes
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class ScarletIAMessage(Base):
    __tablename__ = "scarlet_ia_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investigation_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Optional link to investigation
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # User who created the message
    chat_id = Column(String(50), nullable=False, index=True)  # Client-generated chat session ID
    message_id = Column(String(50), nullable=False, unique=True)  # Client-generated message ID
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=True)  # Plain text content (for backwards compatibility)
    parts = Column(JSONB, nullable=True)  # Array of message parts: [{"type": "text", "text": "...", "state": "done"}, {"type": "step-start"}]
    sources = Column(JSONB, nullable=True)  # Array of sources: [{"title": "...", "url": "..."}]
    tools_used = Column(JSONB, nullable=True)  # Array of tool names used in this message
    attachments = Column(JSONB, nullable=True)  # Array of attachments
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<ScarletIAMessage {self.id} role={self.role} chat_id={self.chat_id}>"


class ScarletIANote(Base):
    __tablename__ = "scarlet_ia_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investigation_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Optional link to investigation
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # User who created the note
    content = Column(Text, nullable=False)
    tags = Column(JSONB, nullable=True)  # Array of tag strings
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ScarletIANote {self.id} investigation_id={self.investigation_id}>"


class ScarletIAChatSession(Base):
    __tablename__ = "scarlet_ia_chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(String(50), nullable=False, unique=True, index=True)  # Client-generated chat session ID
    investigation_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Optional link to investigation
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # User who owns the chat
    title = Column(String(500), nullable=True)  # Auto-generated from first message
    message_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ScarletIAChatSession {self.chat_id} user_id={self.user_id}>"
