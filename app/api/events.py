from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services import event_service
from app.services.schemas import EventResponse, MeetingCreate, MeetingUpdate, MeetingResponse

router = APIRouter()


@router.get("/customer/{customer_id}", response_model=List[EventResponse])
def get_customer_events(
    customer_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get all events for a specific customer."""
    events = event_service.get_events_by_customer(
        db, customer_id=customer_id, skip=skip, limit=limit
    )
    return events


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID."""
    event = event_service.get_event(db, event_id=event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """Create a new meeting event."""
    return event_service.create_meeting(db=db, meeting=meeting)


@router.put("/meetings/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: int, meeting: MeetingUpdate, db: Session = Depends(get_db)
):
    """Update a meeting."""
    updated_meeting = event_service.update_meeting(
        db=db, meeting_id=meeting_id, meeting=meeting
    )
    if updated_meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return updated_meeting


@router.get("/{event_id}/summary")
def get_event_summary(event_id: int, db: Session = Depends(get_db)):
    """Get the summary for a specific event."""
    summary = event_service.get_event_summary(db, event_id=event_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary.summary_json


@router.post("/{event_id}/summary/regenerate")
def regenerate_event_summary(event_id: int, db: Session = Depends(get_db)):
    """Regenerate the summary for a specific event."""
    summary_data = event_service.regenerate_event_summary(db, event_id=event_id)
    if summary_data is None:
        raise HTTPException(status_code=404, detail="Event not found or has no transcript")
    return summary_data


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event."""
    success = event_service.delete_event(db=db, event_id=event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return None
