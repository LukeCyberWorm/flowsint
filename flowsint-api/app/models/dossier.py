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
    investigation_id = Column(UUID(as_uuid=True), nullable=False, index=True, unique=True)  # Link para investigation
    case_number = Column(String(50), nullable=False, unique=True, index=True)  # Número do caso
    title = Column(String(255), nullable=False)  # Título do caso
    description = Column(Text, nullable=True)  # Descrição do caso
    status = Column(SQLEnum(DossierStatus), default=DossierStatus.DRAFT, nullable=False, index=True)
    
    # Metadados
    client_name = Column(String(255), nullable=True)  # Nome do cliente
    client_email = Column(String(255), nullable=True)  # Email do cliente
    assigned_to = Column(UUID(as_uuid=True), nullable=True, index=True)  # Responsável pelo caso
    
    # Configurações de acesso
    is_public = Column(Boolean, default=False, nullable=False)  # Se é público para o cliente
    access_token = Column(String(255), nullable=True, unique=True, index=True)  # Token para acesso do cliente
    access_password = Column(String(255), nullable=True)  # Senha hash para acesso (opcional)
    
    # Dados adicionais
    extra_data = Column(JSONB, nullable=True)  # Metadados adicionais em JSON (renomeado de metadata)
    tags = Column(JSONB, nullable=True)  # Tags do dossiê
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False, index=True)  # Usuário que criou
    updated_by = Column(UUID(as_uuid=True), nullable=True)  # Último usuário que atualizou

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
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(SQLEnum(DossierFileType), nullable=False)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)  # Tamanho em bytes
    file_path = Column(String(500), nullable=False)  # Caminho no storage
    file_url = Column(String(500), nullable=True)  # URL pública (se aplicável)
    
    # Metadados
    description = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)
    extra_data = Column(JSONB, nullable=True)  # Metadados adicionais (renomeado de metadata)
    
    # Controle
    is_visible_to_client = Column(Boolean, default=True, nullable=False)  # Visível para cliente
    order = Column(Integer, default=0, nullable=False)  # Ordem de exibição
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)

    def __repr__(self):
        return f"<DossierFile {self.filename}>"


class DossierNote(Base):
    """
    Anotações no dossiê
    Podem ser internas (apenas para equipe) ou públicas (visíveis para cliente)
    """
    __tablename__ = "dossier_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Conteúdo
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    note_type = Column(String(50), default="general", nullable=False)  # general, timeline, evidence, etc
    
    # Controle
    is_internal = Column(Boolean, default=False, nullable=False)  # Se é nota interna (não visível para cliente)
    is_pinned = Column(Boolean, default=False, nullable=False)  # Se está fixada no topo
    order = Column(Integer, default=0, nullable=False)
    
    # Metadados
    tags = Column(JSONB, nullable=True)
    extra_data = Column(JSONB, nullable=True)  # Dados adicionais (renomeado de metadata)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    updated_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<DossierNote {self.title or self.id}>"


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
