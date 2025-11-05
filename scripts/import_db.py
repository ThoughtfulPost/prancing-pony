#!/usr/bin/env python3
"""
Import database from JSON file.
WARNING: This will delete all existing data in the database!

Usage:
    poetry run python scripts/import_db.py [input_file.json]
"""

import sys
import json
from datetime import datetime
from pathlib import Path

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal, engine
from app.models.customer import Customer
from app.models.event import Event, Meeting
from app.models.event_summary import EventSummary
from app.database import Base


def clear_database(db):
    """Delete all data from all tables."""
    print("🗑️  Clearing existing database data...")
    db.query(EventSummary).delete()
    db.query(Meeting).delete()
    db.query(Event).delete()
    db.query(Customer).delete()
    db.commit()
    print("✅ Database cleared")


def import_database(input_file: str = "db_export.json"):
    """Import database data from JSON file."""

    # Check if file exists
    if not Path(input_file).exists():
        print(f"❌ Error: File '{input_file}' not found")
        sys.exit(1)

    # Load JSON data
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"📁 Loading data from {input_file}")
    print(f"   Export date: {data.get('export_date', 'Unknown')}")

    db = SessionLocal()

    try:
        # Clear existing data
        clear_database(db)

        # Import customers
        print(f"\n📊 Importing {len(data['customers'])} customers...")
        for customer_data in data["customers"]:
            customer = Customer(
                id=customer_data["id"],
                organization_name=customer_data["organization_name"],
                industry=customer_data["industry"],
                website=customer_data["website"],
                primary_contact_name=customer_data["primary_contact_name"],
                primary_contact_email=customer_data["primary_contact_email"],
                primary_contact_phone=customer_data["primary_contact_phone"],
                address=customer_data["address"],
                notes=customer_data["notes"],
                created_at=datetime.fromisoformat(customer_data["created_at"]) if customer_data["created_at"] else None,
                updated_at=datetime.fromisoformat(customer_data["updated_at"]) if customer_data["updated_at"] else None,
            )
            db.add(customer)
        db.commit()
        print("✅ Customers imported")



        # Import events
        print(f"\n📊 Importing {len(data['events'])} events...")
        for event_data in data["events"]:
            # Check if this is a meeting (has transcript or location fields)
            if "transcript" in event_data or "location" in event_data:
                event = Meeting(
                    id=event_data["id"],
                    customer_id=event_data["customer_id"],
                    timestamp=datetime.fromisoformat(event_data["timestamp"]) if event_data["timestamp"] else None,
                    participants=event_data.get("participants"),
                    transcript=event_data.get("transcript"),
                    location=event_data.get("location"),
                    created_at=datetime.fromisoformat(event_data["created_at"]) if event_data["created_at"] else None,
                    updated_at=datetime.fromisoformat(event_data["updated_at"]) if event_data["updated_at"] else None,
                )
            else:
                event = Event(
                    id=event_data["id"],
                    customer_id=event_data["customer_id"],
                    event_type=event_data["event_type"],
                    timestamp=datetime.fromisoformat(event_data["timestamp"]) if event_data["timestamp"] else None,
                    participants=event_data.get("participants"),
                    created_at=datetime.fromisoformat(event_data["created_at"]) if event_data["created_at"] else None,
                    updated_at=datetime.fromisoformat(event_data["updated_at"]) if event_data["updated_at"] else None,
                )
            db.add(event)
        db.commit()
        print("✅ Events imported")

        # Import event summaries
        print(f"\n📊 Importing {len(data['event_summaries'])} event summaries...")
        for summary_data in data["event_summaries"]:
            summary = EventSummary(
                id=summary_data["id"],
                event_id=summary_data["event_id"],
                summary_json=summary_data["summary_json"],
                created_at=datetime.fromisoformat(summary_data["created_at"]) if summary_data["created_at"] else None,
                updated_at=datetime.fromisoformat(summary_data["updated_at"]) if summary_data["updated_at"] else None,
            )
            db.add(summary)
        db.commit()
        print("✅ Event summaries imported")

        print(f"\n✅ Database import completed successfully!")

    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "db_export.json"

    # Confirm before proceeding
    print("⚠️  WARNING: This will delete all existing data in the database!")
    response = input("Type 'yes' to continue: ")

    if response.lower() == "yes":
        import_database(input_file)
    else:
        print("❌ Import cancelled")
