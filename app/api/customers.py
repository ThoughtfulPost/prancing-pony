from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services import customer_service
from app.services.schemas import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter()


@router.get("/", response_model=List[CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all customers."""
    customers = customer_service.get_customers(db, skip=skip, limit=limit)
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a specific customer by ID."""
    customer = customer_service.get_customer(db, customer_id=customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    return customer_service.create_customer(db=db, customer=customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)
):
    """Update a customer."""
    updated_customer = customer_service.update_customer(
        db=db, customer_id=customer_id, customer=customer
    )
    if updated_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    success = customer_service.delete_customer(db=db, customer_id=customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return None
