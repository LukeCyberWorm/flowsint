"""
Dossier API Routes
Rotas para gerenciamento de dossiês de casos
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from typing import List, Optional
from uuid import UUID
import uuid
import os
import secrets
import hashlib
from datetime import datetime
from pathlib import Path

from app.api.schemas.dossier import (
    DossierCreate, DossierUpdate, DossierResponse, DossierWithDetails, DossierListResponse,
    DossierFileCreate, DossierFileUpdate, DossierFileResponse,
    DossierNoteCreate, DossierNoteUpdate, DossierNoteResponse,
    DossierIAChatCreate, DossierIAChatResponse,
    DossierClientAccessRequest, DossierClientView,
    DossierAccessLogCreate, DossierAccessLogResponse,
    DossierSearchParams, DossierStatus, DossierFileType
)
from app.models.dossier import (
    Dossier, DossierFile, DossierNote, DossierIAChat, DossierAccessLog
)
from flowsint_core.core.postgre_db import get_db
from flowsint_core.core.auth import get_current_user
from flowsint_core.core.models import Profile

router = APIRouter()

# Diretório para armazenar arquivos dos dossiês
DOSSIER_STORAGE_PATH = os.getenv("DOSSIER_STORAGE_PATH", "./storage/dossiers")
Path(DOSSIER_STORAGE_PATH).mkdir(parents=True, exist_ok=True)


# ========== Helper Functions ==========

def generate_access_token() -> str:
    """Gera token único de acesso para cliente"""
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    """Hash simples de senha para acesso do cliente"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_access_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica senha de acesso do cliente"""
    return hash_password(plain_password) == hashed_password


def log_access(db: Session, dossier_id: UUID, action: str, user_id: Optional[UUID] = None, 
               access_token: Optional[str] = None, request: Optional[Request] = None):
    """Registra acesso ao dossiê"""
    log = DossierAccessLog(
        dossier_id=dossier_id,
        user_id=user_id,
        access_token=access_token,
        action=action,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    db.add(log)
    db.commit()


def get_file_type(mime_type: str) -> DossierFileType:
    """Determina tipo de arquivo baseado no MIME type"""
    if mime_type.startswith("image/"):
        return DossierFileType.IMAGE
    elif mime_type.startswith("video/"):
        return DossierFileType.VIDEO
    elif mime_type.startswith("audio/"):
        return DossierFileType.AUDIO
    elif mime_type in ["application/pdf", "application/msword", 
                       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        return DossierFileType.DOCUMENT
    else:
        return DossierFileType.OTHER


# ========== Dossier CRUD ==========

@router.post("/", response_model=DossierResponse, status_code=201)
def create_dossier(
    dossier: DossierCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Cria um novo dossiê"""
    # Verifica se já existe dossiê para essa investigation
    existing = db.query(Dossier).filter(Dossier.investigation_id == dossier.investigation_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Dossiê já existe para esta investigação")
    
    # Verifica se case_number já existe
    existing_case = db.query(Dossier).filter(Dossier.case_number == dossier.case_number).first()
    if existing_case:
        raise HTTPException(status_code=400, detail="Número de caso já existe")
    
    # Cria dossiê
    db_dossier = Dossier(
        **dossier.model_dump(exclude={"access_password"}),
        access_token=generate_access_token(),
        access_password=hash_password(dossier.access_password) if dossier.access_password else None,
        created_by=current_user.id,
        status=DossierStatus.DRAFT
    )
    
    db.add(db_dossier)
    db.commit()
    db.refresh(db_dossier)
    
    return db_dossier


@router.get("/", response_model=DossierListResponse)
def list_dossiers(
    q: Optional[str] = Query(None, description="Busca por título, case_number ou descrição"),
    status: Optional[DossierStatus] = None,
    assigned_to: Optional[UUID] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista dossiês com filtros e busca"""
    query = db.query(Dossier)
    
    # Filtros
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Dossier.title.ilike(search),
                Dossier.case_number.ilike(search),
                Dossier.description.ilike(search)
            )
        )
    
    if status:
        query = query.filter(Dossier.status == status)
    
    if assigned_to:
        query = query.filter(Dossier.assigned_to == assigned_to)
    
    # Total
    total = query.count()
    
    # Paginação
    dossiers = query.order_by(Dossier.created_at.desc()).offset(skip).limit(limit).all()
    
    # Adiciona estatísticas
    items = []
    for dossier in dossiers:
        file_stats = db.query(
            func.count(DossierFile.id).label("count"),
            func.sum(DossierFile.file_size).label("total_size")
        ).filter(DossierFile.dossier_id == dossier.id).first()
        
        note_count = db.query(func.count(DossierNote.id)).filter(
            DossierNote.dossier_id == dossier.id
        ).scalar()
        
        items.append(DossierWithDetails(
            **dossier.__dict__,
            file_count=file_stats.count or 0,
            note_count=note_count or 0,
            total_size=file_stats.total_size or 0
        ))
    
    return DossierListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{dossier_id}", response_model=DossierWithDetails)
def get_dossier(
    dossier_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
    request: Request = None
):
    """Obtém um dossiê específico"""
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    # Log de acesso
    log_access(db, dossier_id, "view", user_id=current_user.id, request=request)
    
    # Estatísticas
    file_stats = db.query(
        func.count(DossierFile.id).label("count"),
        func.sum(DossierFile.file_size).label("total_size")
    ).filter(DossierFile.dossier_id == dossier_id).first()
    
    note_count = db.query(func.count(DossierNote.id)).filter(
        DossierNote.dossier_id == dossier_id
    ).scalar()
    
    return DossierWithDetails(
        **dossier.__dict__,
        file_count=file_stats.count or 0,
        note_count=note_count or 0,
        total_size=file_stats.total_size or 0
    )


@router.put("/{dossier_id}", response_model=DossierResponse)
def update_dossier(
    dossier_id: UUID,
    dossier_update: DossierUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Atualiza um dossiê"""
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    # Atualiza campos
    update_data = dossier_update.model_dump(exclude_unset=True, exclude={"access_password"})
    for key, value in update_data.items():
        setattr(dossier, key, value)
    
    # Atualiza senha se fornecida
    if dossier_update.access_password:
        dossier.access_password = hash_password(dossier_update.access_password)
    
    dossier.updated_by = current_user.id
    dossier.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(dossier)
    
    return dossier


@router.delete("/{dossier_id}", status_code=204)
def delete_dossier(
    dossier_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Deleta um dossiê"""
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    # TODO: Deletar arquivos físicos do storage
    
    db.delete(dossier)
    db.commit()
    
    return None


# ========== Dossier Files ==========

@router.post("/{dossier_id}/files", response_model=DossierFileResponse, status_code=201)
async def upload_file(
    dossier_id: UUID,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),  # JSON string
    is_visible_to_client: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Upload de arquivo para o dossiê"""
    # Verifica se dossiê existe
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    # Gera nome único para o arquivo
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Cria diretório do dossiê
    dossier_dir = Path(DOSSIER_STORAGE_PATH) / str(dossier_id)
    dossier_dir.mkdir(parents=True, exist_ok=True)
    
    # Salva arquivo
    file_path = dossier_dir / unique_filename
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Determina tipo de arquivo
    file_type = get_file_type(file.content_type or "application/octet-stream")
    
    # Cria registro no banco
    import json
    db_file = DossierFile(
        dossier_id=dossier_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_type=file_type,
        mime_type=file.content_type,
        file_size=len(content),
        file_path=str(file_path),
        description=description,
        tags=json.loads(tags) if tags else None,
        is_visible_to_client=is_visible_to_client,
        created_by=current_user.id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file


@router.get("/{dossier_id}/files", response_model=List[DossierFileResponse])
def list_files(
    dossier_id: UUID,
    file_type: Optional[DossierFileType] = None,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista arquivos do dossiê"""
    query = db.query(DossierFile).filter(DossierFile.dossier_id == dossier_id)
    
    if file_type:
        query = query.filter(DossierFile.file_type == file_type)
    
    files = query.order_by(DossierFile.order, DossierFile.created_at).all()
    return files


@router.get("/{dossier_id}/files/{file_id}/download")
async def download_file(
    dossier_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
    request: Request = None
):
    """Download de arquivo"""
    db_file = db.query(DossierFile).filter(
        DossierFile.id == file_id,
        DossierFile.dossier_id == dossier_id
    ).first()
    
    if not db_file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Log de acesso
    log_access(db, dossier_id, "download", user_id=current_user.id, 
               resource=db_file.filename, request=request)
    
    return FileResponse(
        db_file.file_path,
        filename=db_file.original_filename,
        media_type=db_file.mime_type
    )


@router.delete("/{dossier_id}/files/{file_id}", status_code=204)
def delete_file(
    dossier_id: UUID,
    file_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Deleta arquivo do dossiê"""
    db_file = db.query(DossierFile).filter(
        DossierFile.id == file_id,
        DossierFile.dossier_id == dossier_id
    ).first()
    
    if not db_file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Deleta arquivo físico
    try:
        os.remove(db_file.file_path)
    except:
        pass
    
    db.delete(db_file)
    db.commit()
    
    return None


# ========== Dossier Notes ==========

@router.post("/{dossier_id}/notes", response_model=DossierNoteResponse, status_code=201)
def create_note(
    dossier_id: UUID,
    note: DossierNoteCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Cria anotação no dossiê"""
    # Verifica se dossiê existe
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    db_note = DossierNote(
        **note.model_dump(),
        dossier_id=dossier_id,
        created_by=current_user.id
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note


@router.get("/{dossier_id}/notes", response_model=List[DossierNoteResponse])
def list_notes(
    dossier_id: UUID,
    include_internal: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista anotações do dossiê"""
    query = db.query(DossierNote).filter(DossierNote.dossier_id == dossier_id)
    
    if not include_internal:
        query = query.filter(DossierNote.is_internal == False)
    
    notes = query.order_by(
        DossierNote.is_pinned.desc(),
        DossierNote.order,
        DossierNote.created_at.desc()
    ).all()
    
    return notes


@router.put("/{dossier_id}/notes/{note_id}", response_model=DossierNoteResponse)
def update_note(
    dossier_id: UUID,
    note_id: UUID,
    note_update: DossierNoteUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Atualiza anotação"""
    db_note = db.query(DossierNote).filter(
        DossierNote.id == note_id,
        DossierNote.dossier_id == dossier_id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Anotação não encontrada")
    
    update_data = note_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db_note.updated_by = current_user.id
    db_note.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_note)
    
    return db_note


@router.delete("/{dossier_id}/notes/{note_id}", status_code=204)
def delete_note(
    dossier_id: UUID,
    note_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Deleta anotação"""
    db_note = db.query(DossierNote).filter(
        DossierNote.id == note_id,
        DossierNote.dossier_id == dossier_id
    ).first()
    
    if not db_note:
        raise HTTPException(status_code=404, detail="Anotação não encontrada")
    
    db.delete(db_note)
    db.commit()
    
    return None


# ========== Dossier IA Chat ==========

@router.post("/{dossier_id}/chat", response_model=DossierIAChatResponse)
async def chat_with_ia(
    dossier_id: UUID,
    chat_request: DossierIAChatCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Chat com IA sobre o dossiê"""
    # Verifica se dossiê existe
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    # Salva mensagem do usuário
    user_message = DossierIAChat(
        dossier_id=dossier_id,
        user_id=current_user.id,
        role="user",
        content=chat_request.content,
        context=chat_request.context
    )
    db.add(user_message)
    db.commit()
    
    # TODO: Integrar com Scarlet IA para gerar resposta contextualizada
    # Por enquanto, resposta placeholder
    assistant_content = f"Analisando informações do caso {dossier.case_number}. Esta é uma resposta placeholder que será substituída pela integração com Scarlet IA."
    
    assistant_message = DossierIAChat(
        dossier_id=dossier_id,
        user_id=None,
        role="assistant",
        content=assistant_content,
        context={"dossier_case": dossier.case_number},
        sources=[]
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)
    
    return assistant_message


@router.get("/{dossier_id}/chat", response_model=List[DossierIAChatResponse])
def get_chat_history(
    dossier_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Obtém histórico de chat"""
    messages = db.query(DossierIAChat).filter(
        DossierIAChat.dossier_id == dossier_id
    ).order_by(DossierIAChat.created_at.desc()).limit(limit).all()
    
    return list(reversed(messages))


# ========== Client Access (Acesso público para clientes) ==========

@router.post("/client/access", response_model=DossierClientView)
def client_access_dossier(
    access_request: DossierClientAccessRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Acesso do cliente ao dossiê via token"""
    dossier = db.query(Dossier).filter(
        Dossier.access_token == access_request.access_token,
        Dossier.is_public == True
    ).first()
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado ou não disponível")
    
    # Verifica senha se configurada
    if dossier.access_password:
        if not access_request.password:
            raise HTTPException(status_code=401, detail="Senha requerida")
        if not verify_access_password(access_request.password, dossier.access_password):
            raise HTTPException(status_code=401, detail="Senha incorreta")
    
    # Log de acesso
    log_access(db, dossier.id, "client_view", access_token=access_request.access_token, request=request)
    
    return DossierClientView(**dossier.__dict__)


@router.get("/client/{access_token}/files", response_model=List[DossierFileResponse])
def client_list_files(
    access_token: str,
    db: Session = Depends(get_db)
):
    """Cliente lista arquivos do dossiê"""
    dossier = db.query(Dossier).filter(
        Dossier.access_token == access_token,
        Dossier.is_public == True
    ).first()
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    files = db.query(DossierFile).filter(
        DossierFile.dossier_id == dossier.id,
        DossierFile.is_visible_to_client == True
    ).order_by(DossierFile.order, DossierFile.created_at).all()
    
    return files


@router.get("/client/{access_token}/notes", response_model=List[DossierNoteResponse])
def client_list_notes(
    access_token: str,
    db: Session = Depends(get_db)
):
    """Cliente lista anotações públicas do dossiê"""
    dossier = db.query(Dossier).filter(
        Dossier.access_token == access_token,
        Dossier.is_public == True
    ).first()
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossiê não encontrado")
    
    notes = db.query(DossierNote).filter(
        DossierNote.dossier_id == dossier.id,
        DossierNote.is_internal == False
    ).order_by(
        DossierNote.is_pinned.desc(),
        DossierNote.order,
        DossierNote.created_at.desc()
    ).all()
    
    return notes


# ========== Access Logs ==========

@router.get("/{dossier_id}/access-logs", response_model=List[DossierAccessLogResponse])
def get_access_logs(
    dossier_id: UUID,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Obtém logs de acesso ao dossiê"""
    logs = db.query(DossierAccessLog).filter(
        DossierAccessLog.dossier_id == dossier_id
    ).order_by(DossierAccessLog.accessed_at.desc()).limit(limit).all()
    
    return logs
