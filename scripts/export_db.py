#!/usr/bin/env python3
"""
Export database to JSON file.

Usage:
    poetry run python scripts/export_db.py [output_file.json]
"""

import sys
import json
from datetime import datetime
from pathlib import Path

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models.customer import Customer
from app.models.event import Event, Meeting
from app.models.event_summary import EventSummary


def export_database(output_file: str = "db_export.json"):
    """Export all database data to JSON file."""
    db = SessionLocal()

    try:
        # Export customers
        customers = db.query(Customer).all()
        customers_data = []
        for customer in customers:
            customers_data.append({
                "id": customer.id,
                "organization_name": customer.organization_name,
                "industry": customer.industry,
                "website": customer.website,
                "primary_contact_name": customer.primary_contact_name,
                "primary_contact_email": customer.primary_contact_email,
                "primary_contact_phone": customer.primary_contact_phone,
                "address": customer.address,
                "notes": customer.notes,
                "created_at": customer.created_at.isoformat() if customer.created_at else None,
                "updated_at": customer.updated_at.isoformat() if customer.updated_at else None,
            })



        # Export events (including meetings)
        events = db.query(Event).all()
        events_data = []
        for event in events:
            event_dict = {
                "id": event.id,
                "customer_id": event.customer_id,
                "event_type": event.event_type,
                "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                "participants": event.participants,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "updated_at": event.updated_at.isoformat() if event.updated_at else None,
            }

            # Add meeting-specific fields if it's a meeting
            if isinstance(event, Meeting):
                event_dict["transcript"] = event.transcript
                event_dict["location"] = event.location

            events_data.append(event_dict)

        # Export event summaries
        summaries = db.query(EventSummary).all()
        summaries_data = []
        for summary in summaries:
            summaries_data.append({
                "id": summary.id,
                "event_id": summary.event_id,
                "summary_json": summary.summary_json,
                "created_at": summary.created_at.isoformat() if summary.created_at else None,
                "updated_at": summary.updated_at.isoformat() if summary.updated_at else None,
            })

        # Combine all data
        export_data = {
            "export_date": datetime.now().isoformat(),
            "customers": customers_data,
            "events": events_data,
            "event_summaries": summaries_data,
        }

        # Write to file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Database exported successfully to {output_file}")
        print(f"   - Customers: {len(customers_data)}")
        print(f"   - Events: {len(events_data)}")
        print(f"   - Event Summaries: {len(summaries_data)}")

    finally:
        db.close()


if __name__ == "__main__":
    output_file = sys.argv[1] if len(sys.argv) > 1 else "db_export.json"
    export_database(output_file)
