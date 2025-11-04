from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from app.database import Base


class Event(Base):
    """Base Event model for communication events with customers."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # Discriminator column for inheritance
    timestamp = Column(DateTime, nullable=False, default=datetime.now, index=True)
    participants = Column(Text)  # Store as comma-separated or JSON string for simplicity
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    __mapper_args__ = {
        "polymorphic_on": event_type,
        "polymorphic_identity": "event",
    }


class Meeting(Event):
    """Meeting event subclass with meeting-specific fields."""

    __tablename__ = "meetings"

    id = Column(Integer, ForeignKey("events.id"), primary_key=True)
    transcript = Column(Text)  # Full transcript of the meeting
    location = Column(String(255))  # Meeting location (physical or virtual)

    __mapper_args__ = {
        "polymorphic_identity": "meeting",
    }
