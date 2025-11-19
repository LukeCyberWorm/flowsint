"""Chat service orchestrator"""
from typing import Optional, Type, Dict
from uuid import UUID
from sqlalchemy.orm import Session

from flowsint_core.core.vault import Vault
from .base import ChatProvider
from .mistral import MistralChatProvider


class ChatProviderNotConfiguredError(Exception):
    """Raised when a user hasn't configured the required API key"""
    pass


class UnsupportedProviderError(Exception):
    """Raised when an unsupported provider is requested"""
    pass


class ChatService:
    """
    Service to manage chat providers with vault-based API key retrieval.

    Follows the Single Responsibility Principle by focusing solely on
    provider instantiation and management.
    """

    # Registry of supported providers
    PROVIDERS: Dict[str, Type[ChatProvider]] = {
        "mistral": MistralChatProvider,
    }

    # Mapping of provider names to vault key names
    VAULT_KEY_MAPPING = {
        "mistral": "MISTRAL_API_KEY",
    }

    def __init__(self, db: Session, user_id: UUID):
        """
        Initialize the chat service.

        Args:
            db: Database session
            user_id: User ID to retrieve API keys from vault
        """
        self.db = db
        self.user_id = user_id
        self.vault = Vault(db=db, owner_id=user_id)

    def get_provider(
        self,
        provider_name: str = "mistral"
    ) -> ChatProvider:
        """
        Get an initialized chat provider for the user.

        Args:
            provider_name: Name of the provider (e.g., "mistral", "openai")

        Returns:
            ChatProvider: Initialized provider instance

        Raises:
            UnsupportedProviderError: If the provider is not supported
            ChatProviderNotConfiguredError: If the user hasn't configured the API key
        """
        # Check if provider is supported
        if provider_name not in self.PROVIDERS:
            supported = ", ".join(self.PROVIDERS.keys())
            raise UnsupportedProviderError(
                f"Provider '{provider_name}' is not supported. "
                f"Supported providers: {supported}"
            )

        # Get vault key name for this provider
        vault_key = self.VAULT_KEY_MAPPING.get(provider_name)
        if not vault_key:
            raise UnsupportedProviderError(
                f"No vault key mapping for provider '{provider_name}'"
            )

        # Retrieve API key from vault
        api_key = self.vault.get_secret(vault_key)
        if not api_key:
            raise ChatProviderNotConfiguredError(
                f"API key for '{provider_name}' not found in vault. "
                f"Please configure '{vault_key}' in your settings."
            )

        # Instantiate and return provider
        provider_class = self.PROVIDERS[provider_name]
        return provider_class(api_key=api_key)

    @classmethod
    def register_provider(
        cls,
        name: str,
        provider_class: Type[ChatProvider],
        vault_key: str
    ):
        """
        Register a new provider (useful for extensions).

        Args:
            name: Provider name
            provider_class: Provider class implementing ChatProvider
            vault_key: Vault key name for API key retrieval
        """
        cls.PROVIDERS[name] = provider_class
        cls.VAULT_KEY_MAPPING[name] = vault_key
