from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


# Customer Schemas (B2B Organizations)
class CustomerBase(BaseModel):
    """Base customer schema for B2B organizations."""

    organization_name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    primary_contact_phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    """Schema for creating a customer organization."""

    pass


class CustomerUpdate(BaseModel):
    """Schema for updating a customer organization."""

    organization_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    primary_contact_phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerResponse(CustomerBase):
    """Schema for customer organization response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# Event Schemas
class EventBase(BaseModel):
    """Base event schema."""

    customer_id: int
    timestamp: datetime
    participants: Optional[str] = None  # Comma-separated list or JSON string


class EventCreate(EventBase):
    """Schema for creating an event."""

    pass


class EventUpdate(BaseModel):
    """Schema for updating an event."""

    timestamp: Optional[datetime] = None
    participants: Optional[str] = None


class EventResponse(EventBase):
    """Schema for event response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    transcript: Optional[str] = None  # For meetings
    location: Optional[str] = None  # For meetings
    created_at: datetime
    updated_at: datetime


# Meeting Schemas
class MeetingBase(EventBase):
    """Base meeting schema."""

    transcript: Optional[str] = None
    location: Optional[str] = None


class MeetingCreate(MeetingBase):
    """Schema for creating a meeting."""

    pass


class MeetingUpdate(BaseModel):
    """Schema for updating a meeting."""

    timestamp: Optional[datetime] = None
    participants: Optional[str] = None
    transcript: Optional[str] = None
    location: Optional[str] = None


class MeetingResponse(MeetingBase):
    """Schema for meeting response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    created_at: datetime
    updated_at: datetime
