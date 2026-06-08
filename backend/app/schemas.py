from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CustomerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    created_at: datetime


class AnalyticsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    sentiment: Optional[str] = None
    satisfaction_score: Optional[int] = None
    complaint_category: Optional[str] = None
    escalation_required: Optional[bool] = None
    summary: Optional[str] = None
    created_at: datetime


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    token: str
    company_name: str
    purpose: Optional[str] = "feedback"
    status: str
    expires_at: datetime
    joined_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None
    transcript: Optional[str] = None
    recording_url: Optional[str] = None
    created_at: datetime
    customer: Optional[CustomerRead] = None
    analytics: Optional[AnalyticsRead] = None


class SendSessionLinkRequest(BaseModel):
    customer_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=5)
    company_name: str = Field(..., min_length=1)
    purpose: str = Field(default="feedback", description="e.g. feedback, sales, bill_payment, autopay_reminder, bill_due")


class SendSessionLinkResponse(BaseModel):
    session_id: int
    token: str
    status: str
    session_url: str
    expires_at: datetime


class SessionJoinResponse(BaseModel):
    session_id: int
    status: str
    expires_at: datetime


class SessionCompleteRequest(BaseModel):
    transcript: str = Field(..., min_length=1)
    duration: Optional[int] = None
    recording_url: Optional[str] = None


class SessionCompleteResponse(BaseModel):
    session_id: int
    status: str


# =========================
# Conversation Schemas
# =========================

class ConversationRequest(BaseModel):
    session_token: str
    message: str


class ConversationResponse(BaseModel):
    reply: str
    audio: Optional[str] = None
    end_call: bool = False


class TTSRequest(BaseModel):
    text: str


class TTSResponse(BaseModel):
    audio: Optional[str] = None

class ConversationMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    role: str
    message: str
    created_at: datetime