"""
Pydantic schemas for Dossier API
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class DossierStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
    CLOSED = "closed"


class DossierFileType(str, Enum):
    DOCUMENT = "document"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    OTHER = "other"


# ========== Dossier Schemas ==========

class DossierBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    client_name: Optional[str] = Field(None, max_length=255)
    client_email: Optional[str] = Field(None, max_length=255)
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DossierCreate(DossierBase):
    investigation_id: UUID
    case_number: str = Field(..., min_length=1, max_length=50)
    is_public: bool = False
    access_password: Optional[str] = None  # Senha em texto plano (será hasheada)


class DossierUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[DossierStatus] = None
    client_name: Optional[str] = Field(None, max_length=255)
    client_email: Optional[str] = Field(None, max_length=255)
    assigned_to: Optional[UUID] = None
    is_public: Optional[bool] = None
    access_password: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DossierResponse(DossierBase):
    id: UUID
    investigation_id: UUID
    case_number: str
    status: DossierStatus
    assigned_to: Optional[UUID]
    is_public: bool
    access_token: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    updated_by: Optional[UUID]
    
    class Config:
        from_attributes = True


class DossierWithDetails(DossierResponse):
    """Dossiê com arquivos, notas e estatísticas"""
    file_count: int = 0
    note_count: int = 0
    total_size: int = 0


# ========== Dossier File Schemas ==========

class DossierFileBase(BaseModel):
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_visible_to_client: bool = True
    order: int = 0


class DossierFileCreate(DossierFileBase):
    filename: str
    file_type: DossierFileType
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    file_path: str
    file_url: Optional[str] = None


class DossierFileUpdate(BaseModel):
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_visible_to_client: Optional[bool] = None
    order: Optional[int] = None


class DossierFileResponse(BaseModel):
    id: UUID
    dossier_id: UUID
    file_name: str
    file_type: Optional[str]
    file_size: Optional[int]
    file_url: str
    uploaded_at: Optional[datetime]
    uploaded_by: Optional[UUID]
    
    class Config:
        from_attributes = True


# ========== Dossier Note Schemas ==========

class DossierNoteBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: str
    note_type: str = "general"
    is_internal: bool = False
    is_pinned: bool = False
    order: int = 0
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DossierNoteCreate(DossierNoteBase):
    pass


class DossierNoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    note_type: Optional[str] = None
    is_internal: Optional[bool] = None
    is_pinned: Optional[bool] = None
    order: Optional[int] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DossierNoteResponse(BaseModel):
    id: UUID
    dossier_id: UUID
    content: str
    is_pinned: Optional[bool]
    created_at: Optional[datetime]
    created_by: Optional[UUID]
    
    class Config:
        from_attributes = True


# ========== Dossier IA Chat Schemas ==========

class DossierIAChatCreate(BaseModel):
    content: str
    context: Optional[Dict[str, Any]] = None


class DossierIAChatResponse(BaseModel):
    id: UUID
    dossier_id: UUID
    user_id: Optional[UUID]
    role: str
    content: str
    context: Optional[Dict[str, Any]]
    sources: Optional[List[Dict[str, Any]]]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ========== Client Access Schemas ==========

class DossierClientAccessRequest(BaseModel):
    """Request para cliente acessar dossiê"""
    access_token: str
    password: Optional[str] = None


class DossierClientView(BaseModel):
    """View do dossiê para o cliente (sem informações sensíveis)"""
    id: UUID
    case_number: str
    title: str
    description: Optional[str] = None
    status: Optional[str] = "active"
    client_name: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ========== Access Log Schemas ==========

class DossierAccessLogCreate(BaseModel):
    action: str
    resource: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class DossierAccessLogResponse(BaseModel):
    id: UUID
    dossier_id: UUID
    user_id: Optional[UUID]
    access_token: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    action: str
    resource: Optional[str]
    accessed_at: datetime
    
    class Config:
        from_attributes = True


# ========== Search and Filter Schemas ==========

class DossierSearchParams(BaseModel):
    """Parâmetros de busca de dossiês"""
    q: Optional[str] = None  # Query de busca
    status: Optional[DossierStatus] = None
    assigned_to: Optional[UUID] = None
    case_number: Optional[str] = None
    tags: Optional[List[str]] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)


class DossierListResponse(BaseModel):
    """Lista paginada de dossiês"""
    items: List[DossierWithDetails]
    total: int
    skip: int
    limit: int
