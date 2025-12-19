"""
SQLAlchemy models for Dossier System
Sistema de dossiês para apresentação de casos aos clientes
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from flowsint_core.core.postgre_db import Base
import enum


class DossierStatus(str, enum.Enum):
    """Status do dossiê"""
    DRAFT = "draft"  # Rascunho
    ACTIVE = "active"  # Ativo
    ARCHIVED = "archived"  # Arquivado
    CLOSED = "closed"  # Fechado


class DossierFileType(str, enum.Enum):
    """Tipos de arquivo no dossiê"""
    DOCUMENT = "document"  # PDF, DOCX, etc
    IMAGE = "image"  # PNG, JPG, etc
    VIDEO = "video"  # MP4, etc
    AUDIO = "audio"  # MP3, etc
    OTHER = "other"


class Dossier(Base):
    """
    Dossiê principal de um caso
    Contém todas as informações, arquivos e anotações de um caso
    """
    __tablename__ = "dossiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investigation_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Link para investigation
    case_number = Column(String(50), nullable=False, unique=True, index=True)  # Número do caso
    title = Column(Text, nullable=False)  # Título do caso
    description = Column(Text, nullable=True)  # Descrição do caso
    status = Column(String(20), default="active", nullable=True, index=True)
    
    # Metadados
    client_name = Column(Text, nullable=True)  # Nome do cliente
    
    # Configurações de acesso
    is_public = Column(Boolean, default=False, nullable=True)  # Se é público para o cliente
    access_token = Column(String(64), nullable=False, unique=True, index=True)  # Token para acesso do cliente
    password_hash = Column(String(255), nullable=True)  # Senha hash para acesso (opcional)
    expires_at = Column(DateTime, nullable=True)  # Data de expiração
    last_accessed_at = Column(DateTime, nullable=True)  # Último acesso
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True, index=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<Dossier {self.case_number} - {self.title}>"


class DossierFile(Base):
    """
    Arquivos anexados ao dossiê (PDFs, imagens, vídeos, etc)
    """
    __tablename__ = "dossier_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Informações do arquivo
    file_name = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)  # Tamanho em bytes
    file_url = Column(Text, nullable=False)  # URL pública
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<DossierFile {self.file_name}>"


class DossierNote(Base):
    """
    Anotações no dossiê
    Podem ser internas (apenas para equipe) ou públicas (visíveis para cliente)
    """
    __tablename__ = "dossier_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conteúdo
    content = Column(Text, nullable=False)
    
    # Controle
    is_pinned = Column(Boolean, default=False, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<DossierNote {self.id}>"


class DossierAccessLog(Base):
    """
    Log de acessos ao dossiê
    Registra quando e quem acessou o dossiê
    """
    __tablename__ = "dossier_access_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Informações de acesso
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Se for usuário autenticado
    access_token = Column(String(255), nullable=True)  # Se for acesso via token (cliente)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Tipo de acesso
    action = Column(String(50), nullable=False)  # view, download, edit, etc
    resource = Column(String(255), nullable=True)  # Recurso acessado
    
    # Timestamp
    accessed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<DossierAccessLog {self.action} at {self.accessed_at}>"


class DossierIAChat(Base):
    """
    Chat da IA especificamente para o dossiê
    Assistente de IA contextualizado para o caso
    """
    __tablename__ = "dossier_ia_chats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Mensagem
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Usuário (pode ser null para cliente)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    
    # Contexto
    context = Column(JSONB, nullable=True)  # Contexto usado pela IA
    sources = Column(JSONB, nullable=True)  # Fontes citadas pela IA
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self):
        return f"<DossierIAChat {self.role} at {self.created_at}>"
