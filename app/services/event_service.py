import logging
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.event import Event, Meeting
from app.models.event_summary import EventSummary
from app.services.schemas import MeetingCreate, MeetingUpdate
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


def get_event(db: Session, event_id: int) -> Optional[Event]:
    """Get an event by ID."""
    return db.query(Event).filter(Event.id == event_id).first()


def get_event_summary(db: Session, event_id: int) -> Optional[EventSummary]:
    """Get the summary for an event."""
    return db.query(EventSummary).filter(EventSummary.event_id == event_id).first()


def get_events_by_customer(
    db: Session, customer_id: int, skip: int = 0, limit: int = 100
) -> List[Event]:
    """Get all events for a customer, ordered by timestamp descending."""
    return (
        db.query(Event)
        .filter(Event.customer_id == customer_id)
        .order_by(Event.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_meeting(db: Session, meeting: MeetingCreate) -> Meeting:
    """Create a new meeting event and generate summary."""
    # Extract participants from transcript if available
    participants = meeting.participants
    if meeting.transcript and not participants:
        try:
            participants = llm_service.extract_participants(meeting.transcript)
        except Exception as e:
            logger.error(f"Error extracting participants: {e}", exc_info=True)
            participants = None

    # Create meeting with extracted or provided participants
    meeting_data = meeting.model_dump()
    meeting_data['participants'] = participants
    db_meeting = Meeting(**meeting_data)
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    # Generate summary if transcript exists
    if db_meeting.transcript:
        try:
            summary_data = llm_service.summarize_meeting(
                db_meeting.transcript, meeting_id=db_meeting.id
            )

            # Save summary to database
            db_summary = EventSummary(
                event_id=db_meeting.id, summary_json=summary_data
            )
            db.add(db_summary)
            db.commit()
        except Exception as e:
            logger.error(f"Error generating summary: {e}", exc_info=True)

    return db_meeting


def update_meeting(
    db: Session, meeting_id: int, meeting: MeetingUpdate
) -> Optional[Meeting]:
    """Update a meeting."""
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if db_meeting is None:
        return None

    update_data = meeting.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_meeting, key, value)

    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def delete_event(db: Session, event_id: int) -> bool:
    """Delete an event."""
    db_event = get_event(db, event_id)
    if db_event is None:
        return False

    db.delete(db_event)
    db.commit()
    return True


def regenerate_event_summary(db: Session, event_id: int) -> Optional[dict]:
    """Regenerate the summary for an event."""
    db_event = get_event(db, event_id)
    if db_event is None:
        return None

    # Check if event has a transcript (only meetings have transcripts)
    if not hasattr(db_event, 'transcript') or not db_event.transcript:
        return None

    try:
        # Generate new summary
        summary_data = llm_service.summarize_meeting(
            db_event.transcript, meeting_id=db_event.id
        )

        # Check if summary already exists
        existing_summary = get_event_summary(db, event_id)
        if existing_summary:
            # Update existing summary
            existing_summary.summary_json = summary_data
            db.commit()
            db.refresh(existing_summary)
        else:
            # Create new summary
            db_summary = EventSummary(
                event_id=db_event.id, summary_json=summary_data
            )
            db.add(db_summary)
            db.commit()

        return summary_data
    except Exception as e:
        logger.error(f"Error regenerating summary: {e}", exc_info=True)
        raise
