"""Mistral AI chat provider implementation"""
from typing import AsyncIterator, List, Optional
from mistralai import Mistral
from mistralai.models import UserMessage, AssistantMessage, SystemMessage

from .base import ChatProvider, ChatMessage, MessageRole


class MistralChatProvider(ChatProvider):
    """
    Mistral AI implementation of ChatProvider.
    Supports streaming responses from Mistral models.
    """

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.client = Mistral(api_key=api_key)

    def get_default_model(self) -> str:
        """Return the default Mistral model"""
        return "mistral-small-latest"

    def _convert_message(self, message: ChatMessage):
        """Convert standardized ChatMessage to Mistral format"""
        if message.role == MessageRole.SYSTEM:
            return SystemMessage(content=message.content)
        elif message.role == MessageRole.USER:
            return UserMessage(content=message.content)
        elif message.role == MessageRole.ASSISTANT:
            return AssistantMessage(content=message.content)
        else:
            raise ValueError(f"Unknown message role: {message.role}")

    async def stream(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream chat completions from Mistral.

        Args:
            messages: List of chat messages
            model: Optional model name (defaults to mistral-small-latest)

        Yields:
            str: Content chunks from the stream
        """
        if not model:
            model = self.get_default_model()

        # Convert messages to Mistral format
        mistral_messages = [self._convert_message(msg) for msg in messages]

        # Stream response
        response = await self.client.chat.stream_async(
            model=model,
            messages=mistral_messages
        )

        async for chunk in response:
            if chunk.data.choices[0].delta.content is not None:
                yield chunk.data.choices[0].delta.content
