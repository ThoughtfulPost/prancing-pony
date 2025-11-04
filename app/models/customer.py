from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base


class Customer(Base):
    """Customer model for B2B organizations."""

    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String(255), nullable=False, index=True)  # Company/org name
    industry = Column(String(255))  # Industry sector
    website = Column(String(255))
    primary_contact_name = Column(String(255))  # Main contact person
    primary_contact_email = Column(String(255), index=True)
    primary_contact_phone = Column(String(50))
    address = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
