from pydantic import Field, EmailStr, model_validator
from typing import Any, Self, Optional, List, Dict
from .flowsint_base import FlowsintType


class Email(FlowsintType):
    """Represents an email address."""

    email: EmailStr = Field(..., description="Email address", title="Email Address")
    breaches: Optional[List[Dict[str, Any]]] = Field(None, description="Data breaches where email was found", title="Breaches")
    breach_count: Optional[int] = Field(None, description="Number of breaches", title="Breach Count")

    @model_validator(mode='after')
    def compute_label(self) -> Self:
        self.label = self.email
        return self
