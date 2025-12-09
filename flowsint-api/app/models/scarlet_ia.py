"""
SQLAlchemy models for Scarlet-IA chat and notes
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base


class ScarletIAMessage(Base):
    __tablename__ = "scarlet_ia_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investigation_id = Column(UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    chat_id = Column(String(50), nullable=False, index=True)  # Client-generated chat session ID
    message_id = Column(String(50), nullable=False, unique=True)  # Client-generated message ID
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=True)  # Plain text content (for backwards compatibility)
    parts = Column(JSONB, nullable=True)  # Array of message parts: [{"type": "text", "text": "...", "state": "done"}, {"type": "step-start"}]
    sources = Column(JSONB, nullable=True)  # Array of sources: [{"title": "...", "url": "..."}]
    tools_used = Column(JSONB, nullable=True)  # Array of tool names used in this message
    attachments = Column(JSONB, nullable=True)  # Array of attachments
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    investigation = relationship("Investigation", back_populates="scarlet_ia_messages")
    user = relationship("Profile", back_populates="scarlet_ia_messages")

    def __repr__(self):
        return f"<ScarletIAMessage {self.id} role={self.role} chat_id={self.chat_id}>"


class ScarletIANote(Base):
    __tablename__ = "scarlet_ia_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investigation_id = Column(UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    tags = Column(JSONB, nullable=True)  # Array of tag strings
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    investigation = relationship("Investigation", back_populates="scarlet_ia_notes")
    user = relationship("Profile", back_populates="scarlet_ia_notes")

    def __repr__(self):
        return f"<ScarletIANote {self.id} investigation_id={self.investigation_id}>"


class ScarletIAChatSession(Base):
    __tablename__ = "scarlet_ia_chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(String(50), nullable=False, unique=True, index=True)  # Client-generated chat session ID
    investigation_id = Column(UUID(as_uuid=True), ForeignKey("investigations.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=True)  # Auto-generated from first message
    message_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    investigation = relationship("Investigation", back_populates="scarlet_ia_chat_sessions")
    user = relationship("Profile", back_populates="scarlet_ia_chat_sessions")

    def __repr__(self):
        return f"<ScarletIAChatSession {self.chat_id} user_id={self.user_id}>"
