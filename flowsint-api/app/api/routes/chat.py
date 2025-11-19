from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from flowsint_core.core.postgre_db import get_db
from flowsint_core.core.models import Chat, ChatMessage, Profile
from flowsint_core.services.chat import ChatService, ChatMessage as ChatMsg, MessageRole
from flowsint_core.services.chat.service import ChatProviderNotConfiguredError, UnsupportedProviderError
from app.api.deps import get_current_user
from app.api.schemas.chat import ChatCreate, ChatRead

router = APIRouter()


def clean_context(context: List[Dict]) -> List[Dict]:
    print(context)
    """Remove unnecessary keys from context data."""
    cleaned = []
    for item in context:
        if isinstance(item, dict):
            # Create a copy and remove unwanted keys
            cleaned_item = item["data"].copy()
            # Remove top-level keys
            cleaned_item.pop("id", None)
            cleaned_item.pop("sketch_id", None)
            # Remove from data if it exists
            if "data" in cleaned_item and isinstance(cleaned_item["data"], dict):
                cleaned_item["data"].pop("sketch_id", None)
            # Remove measured/dimensions
            cleaned_item.pop("measured", None)
            cleaned.append(cleaned_item)
    return cleaned


class ChatRequest(BaseModel):
    prompt: str
    context: Optional[List[Dict]] = None


# Get all chats
@router.get("/", response_model=List[ChatRead])
def get_chats(
    db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)
):
    chats = db.query(Chat).filter(Chat.owner_id == current_user.id).all()

    # Sort messages for each chat by created_at in ascending order
    for chat in chats:
        chat.messages.sort(key=lambda x: x.created_at)

    return chats

# Get analyses by investigation ID
@router.get("/investigation/{investigation_id}", response_model=List[ChatRead])
def get_chats_by_investigation(
    investigation_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    chats = (
        db.query(Chat)
        .filter(
            Chat.investigation_id == investigation_id, Chat.owner_id == current_user.id
        )
        .order_by(Chat.created_at.asc())
        .all()
    )
    # Sort messages for each chat by created_at in ascending order
    for chat in chats:
        chat.messages.sort(key=lambda x: x.created_at)

    return chats


@router.post("/stream/{chat_id}")
async def stream_chat(
    chat_id: UUID,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
    provider_name: str = "mistral",  # Can be made configurable
):
    # Check if Chat exists
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Validate provider and API key BEFORE saving message
    try:
        chat_service = ChatService(db=db, user_id=current_user.id)
        provider = chat_service.get_provider(provider_name)
    except ChatProviderNotConfiguredError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except UnsupportedProviderError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    # Only create and save user message if provider is valid
    user_message = ChatMessage(
        id=uuid4(),
        content=payload.prompt,
        context=payload.context,
        chat_id=chat_id,
        is_bot=False,
        created_at=datetime.utcnow(),
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Update chat's last_updated_at after validation
    chat.last_updated_at = datetime.utcnow()
    db.commit()

    try:
        accumulated_content = []

        # Build messages list
        messages = [
            ChatMsg(
                role=MessageRole.SYSTEM,
                content="You are a CTI/OSINT investigator and you are trying to investigate on a variety of real life cases. Use your knowledge and analytics capabilities to analyse the context and answer the question the best you can. If you need to reference some items (an IP, a domain or something particular) please use the code brackets, like : `12.23.34.54` to reference it."
            )
        ]

        # Add context as system message if provided
        if payload.context:
            try:
                cleaned_context = clean_context(payload.context)
                if cleaned_context:
                    context_str = json.dumps(cleaned_context, indent=2, default=str)
                    context_message = f"Context: {context_str}"
                    # Limit context message length to avoid token limits
                    if len(context_message) > 2000:
                        context_message = context_message[:2000] + "..."
                    messages.append(
                        ChatMsg(role=MessageRole.SYSTEM, content=context_message)
                    )
            except Exception as e:
                print(f"Context processing error: {e}")

        # Add recent conversation history
        sorted_messages = sorted(chat.messages, key=lambda x: x.created_at)
        recent_messages = (
            sorted_messages[-5:] if len(sorted_messages) > 5 else sorted_messages
        )
        for message in recent_messages:
            role = MessageRole.ASSISTANT if message.is_bot else MessageRole.USER
            content = json.dumps(message.content, default=str)
            messages.append(ChatMsg(role=role, content=content))

        # Add current user message
        messages.append(ChatMsg(role=MessageRole.USER, content=payload.prompt))

        async def generate():
            try:
                # Stream from provider
                async for content_chunk in provider.stream(messages):
                    accumulated_content.append(content_chunk)
                    yield f"data: {json.dumps({'content': content_chunk})}\n\n"

                # Save bot response to database
                bot_message = ChatMessage(
                    id=uuid4(),
                    content="".join(accumulated_content),
                    chat_id=chat_id,
                    is_bot=True,
                    created_at=datetime.utcnow(),
                )
                db.add(bot_message)
                db.commit()
                db.refresh(bot_message)

                yield "data: [DONE]\n\n"
            except Exception as stream_error:
                # Rollback: Delete user message if streaming fails
                try:
                    db.delete(user_message)
                    db.commit()
                except Exception as rollback_error:
                    print(f"Failed to rollback user message: {rollback_error}")

                # Handle streaming errors
                error_message = str(stream_error)

                # Parse Mistral SDK errors
                if "SDKError" in str(type(stream_error)):
                    # Extract error message from SDK error
                    if "429" in error_message or "rate" in error_message.lower():
                        error_message = "Rate limit exceeded. Please wait a moment before trying again."
                    elif "service_tier_capacity_exceeded" in error_message:
                        error_message = "Service capacity exceeded. Please try again later or use a different model."
                    elif "401" in error_message or "unauthorized" in error_message.lower():
                        error_message = "Invalid API key. Please check your configuration."
                    else:
                        # Try to extract the message from the error body
                        import re
                        match = re.search(r'"message":"([^"]+)"', error_message)
                        if match:
                            error_message = match.group(1)

                # Send error to client via SSE
                yield f"data: {json.dumps({'error': error_message})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        # Handle errors before streaming starts
        error_detail = str(e)

        # Parse Mistral SDK errors
        if "SDKError" in str(type(e)):
            if "429" in error_detail or "rate" in error_detail.lower():
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please wait a moment before trying again."
                )
            elif "service_tier_capacity_exceeded" in error_detail:
                raise HTTPException(
                    status_code=429,
                    detail="Service capacity exceeded. Please try again later or use a different model."
                )
            elif "401" in error_detail or "unauthorized" in error_detail.lower():
                raise HTTPException(
                    status_code=401,
                    detail="Invalid API key. Please check your configuration."
                )

        raise HTTPException(status_code=500, detail=error_detail)


# Create a new chat
@router.post("/create", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    new_chat = Chat(
        id=uuid4(),
        title=payload.title,
        description=payload.description,
        owner_id=current_user.id,
        investigation_id=payload.investigation_id,
        created_at=datetime.utcnow(),
        last_updated_at=datetime.utcnow(),
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat


# Get a chat by ID
@router.get("/{chat_id}", response_model=ChatRead)
def get_chat_by_id(
    chat_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Sort messages by created_at in ascending order
    chat.messages.sort(key=lambda x: x.created_at)

    return chat


# Delete an chat by ID
@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: UUID,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    chat = (
        db.query(Chat)
        .filter(Chat.id == chat_id, Chat.owner_id == current_user.id)
        .first()
    )
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return None
