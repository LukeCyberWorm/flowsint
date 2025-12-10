"""
Scarlet-IA API routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
from datetime import datetime

from app.api.deps import get_db, get_current_user, get_admin_user
from app.models.scarlet_ia import ScarletIAMessage, ScarletIANote, ScarletIAChatSession
from app.services.scarlet_ia_service import scarlet_ia_service
from flowsint_core.core.models import Profile
from pydantic import BaseModel

router = APIRouter()


# Pydantic schemas
class MessagePart(BaseModel):
    type: str
    text: Optional[str] = None
    state: Optional[str] = None


class ChatMessage(BaseModel):
    id: str
    role: str
    parts: List[MessagePart]
    sources: Optional[List[Dict[str, str]]] = None


class ChatRequest(BaseModel):
    id: str  # chat_id
    messages: List[ChatMessage]
    trigger: str
    investigation_id: Optional[str] = None


class NoteCreate(BaseModel):
    content: str
    investigation_id: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteUpdate(BaseModel):
    content: str
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    id: str
    content: str
    investigation_id: Optional[str]
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ToolExecuteRequest(BaseModel):
    tool_id: str
    params: Dict[str, Any]
    investigation_id: Optional[str] = None


@router.post("/chat")
async def chat_stream(
    request: ChatRequest,
    current_user: Profile = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Stream chat responses using Server-Sent Events
    """
    user_id = current_user.id
    
    # Convert Pydantic messages to dict
    messages = []
    for msg in request.messages:
        messages.append({
            "id": msg.id,
            "role": msg.role,
            "parts": [p.model_dump() for p in msg.parts],
            "sources": msg.sources
        })
    
    # Save user message to database
    last_user_message = None
    for msg in reversed(request.messages):
        if msg.role == "user":
            last_user_message = msg
            break
    
    if last_user_message:
        # Extract text content
        text_content = " ".join([p.text for p in last_user_message.parts if p.text])
        
        db_message = ScarletIAMessage(
            id=uuid.uuid4(),
            investigation_id=UUID(request.investigation_id) if request.investigation_id else None,
            user_id=user_id,
            chat_id=request.id,
            message_id=last_user_message.id,
            role="user",
            content=text_content,
            parts=[p.model_dump() for p in last_user_message.parts],
            created_at=datetime.utcnow()
        )
        db.add(db_message)
        db.commit()
    
    # Update or create chat session
    chat_session = db.query(ScarletIAChatSession).filter(
        ScarletIAChatSession.chat_id == request.id,
        ScarletIAChatSession.user_id == user_id
    ).first()
    
    if not chat_session:
        chat_session = ScarletIAChatSession(
            id=uuid.uuid4(),
            chat_id=request.id,
            user_id=user_id,
            investigation_id=UUID(request.investigation_id) if request.investigation_id else None,
            message_count=1,
            title=text_content[:100] if last_user_message else None
        )
        db.add(chat_session)
    else:
        chat_session.message_count += 1
        chat_session.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Stream response
    return StreamingResponse(
        scarlet_ia_service.process_message_stream(
            messages=messages,
            user_id=user_id,
            investigation_id=request.investigation_id
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/history")
async def get_chat_history(
    chat_id: Optional[str] = None,
    investigation_id: Optional[str] = None,
    limit: int = 50,
    current_user: Profile = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get chat history"""
    user_id = current_user.id
    
    query = db.query(ScarletIAMessage).filter(ScarletIAMessage.user_id == user_id)
    
    if chat_id:
        query = query.filter(ScarletIAMessage.chat_id == chat_id)
    
    if investigation_id:
        query = query.filter(ScarletIAMessage.investigation_id == UUID(investigation_id))
    
    messages = query.order_by(ScarletIAMessage.created_at.desc()).limit(limit).all()
    
    return {
        "messages": [
            {
                "id": str(msg.id),
                "message_id": msg.message_id,
                "chat_id": msg.chat_id,
                "role": msg.role,
                "content": msg.content,
                "parts": msg.parts,
                "sources": msg.sources,
                "tools_used": msg.tools_used,
                "created_at": msg.created_at.isoformat()
            }
            for msg in reversed(messages)
        ]
    }


@router.post("/notes", response_model=NoteResponse)
async def create_note(
    note: NoteCreate,
    current_user: Profile = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new note"""
    user_id = current_user.id
    
    db_note = ScarletIANote(
        id=uuid.uuid4(),
        user_id=user_id,
        investigation_id=UUID(note.investigation_id) if note.investigation_id else None,
        content=note.content,
        tags=note.tags
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return NoteResponse(
        id=str(db_note.id),
        content=db_note.content,
        investigation_id=str(db_note.investigation_id) if db_note.investigation_id else None,
        tags=db_note.tags,
        created_at=db_note.created_at,
        updated_at=db_note.updated_at
    )


@router.get("/notes", response_model=List[NoteResponse])
async def get_notes(
    investigation_id: Optional[str] = None,
    current_user: Profile = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all notes"""
    user_id = current_user.id
    
    query = db.query(ScarletIANote).filter(ScarletIANote.user_id == user_id)
    
    if investigation_id:
        query = query.filter(ScarletIANote.investigation_id == UUID(investigation_id))
    
    notes = query.order_by(ScarletIANote.created_at.desc()).all()
    
    return [
        NoteResponse(
            id=str(note.id),
            content=note.content,
            investigation_id=str(note.investigation_id) if note.investigation_id else None,
            tags=note.tags,
            created_at=note.created_at,
            updated_at=note.updated_at
        )
        for note in notes
    ]


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: Profile = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a note"""
    user_id = current_user.id
    
    note = db.query(ScarletIANote).filter(
        ScarletIANote.id == UUID(note_id),
        ScarletIANote.user_id == user_id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    return {"success": True}


@router.post("/execute-tool")
async def execute_tool(
    request: ToolExecuteRequest,
    current_user: Profile = Depends(get_admin_user)
):
    """Execute a tool"""
    user_id = current_user.id
    
    result = await scarlet_ia_service.execute_tool(
        tool_name=request.tool_id,
        params=request.params,
        user_id=user_id
    )
    
    return result


@router.get("/tools")
async def get_tools(current_user: Profile = Depends(get_admin_user)):
    """Get available tools"""
    tools = await scarlet_ia_service.get_available_tools()
    return {"tools": tools}


@router.get("/kali-tools")
async def get_kali_tools(current_user: Profile = Depends(get_admin_user)):
    """Get Kali Linux tools"""
    all_tools = await scarlet_ia_service.get_available_tools()
    kali_tools = [t for t in all_tools if t["category"] == "kali"]
    return {"tools": kali_tools}
