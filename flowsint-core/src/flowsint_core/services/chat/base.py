"""
Base abstraction for chat providers.
Follows SOLID principles for extensibility.
"""
from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Dict, Optional
from enum import Enum


class MessageRole(str, Enum):
    """Message role types"""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage:
    """Standardized chat message format"""
    def __init__(self, role: MessageRole, content: str):
        self.role = role
        self.content = content

    def to_dict(self) -> Dict:
        return {
            "role": self.role.value,
            "content": self.content
        }


class ChatProvider(ABC):
    """
    Abstract base class for chat providers.

    Each provider implementation (Mistral, OpenAI, etc.) must implement
    the stream method to provide streaming chat responses.
    """

    def __init__(self, api_key: str):
        """
        Initialize the provider with an API key.

        Args:
            api_key: The API key for authentication
        """
        if not api_key:
            raise ValueError(f"API key is required for {self.__class__.__name__}")
        self.api_key = api_key

    @abstractmethod
    async def stream(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream chat completions from the provider.

        Args:
            messages: List of chat messages in the conversation
            model: Optional model name to use (provider-specific)

        Yields:
            str: Content chunks as they are received from the provider
        """
        pass

    @abstractmethod
    def get_default_model(self) -> str:
        """
        Get the default model name for this provider.

        Returns:
            str: The default model name
        """
        pass
