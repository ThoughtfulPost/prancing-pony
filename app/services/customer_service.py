from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.customer import Customer
from app.services.schemas import CustomerCreate, CustomerUpdate


def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    """Get a customer by ID."""
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    """Get all customers with pagination."""
    return db.query(Customer).offset(skip).limit(limit).all()


def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    """Create a new customer."""
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def update_customer(
    db: Session, customer_id: int, customer: CustomerUpdate
) -> Optional[Customer]:
    """Update a customer."""
    db_customer = get_customer(db, customer_id)
    if db_customer is None:
        return None

    update_data = customer.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int) -> bool:
    """Delete a customer."""
    db_customer = get_customer(db, customer_id)
    if db_customer is None:
        return False

    db.delete(db_customer)
    db.commit()
    return True
