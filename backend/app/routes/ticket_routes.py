from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.priority_engine import predict_priority
from app.ai.root_cause_engine import suggest_root_cause_and_action
from app.database import get_db
from app.models import Machine, MaintenanceTicket, Technician
from app.schemas import (
    TicketAssignTechnician,
    TicketComplete,
    TicketCreate,
    TicketOut,
    TicketStatusUpdate,
)

router = APIRouter(prefix="/api/tickets", tags=["Maintenance Tickets"])


def generate_ticket_no(db: Session) -> str:
    count = db.query(MaintenanceTicket).count() + 1
    return f"MT-{datetime.now().year}-{count:05d}"


@router.post("/", response_model=TicketOut)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == payload.machine_id).first()

    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    if payload.technician_id:
        technician = (
            db.query(Technician)
            .filter(Technician.id == payload.technician_id)
            .first()
        )

        if not technician:
            raise HTTPException(status_code=404, detail="Technician not found")

    ai_priority = predict_priority(
        payload.issue_title,
        payload.issue_description,
        payload.issue_category,
    )

    ai_suggestion = suggest_root_cause_and_action(
        payload.issue_title,
        payload.issue_description,
        payload.issue_category,
    )

    ticket = MaintenanceTicket(
        ticket_no=generate_ticket_no(db),
        machine_id=payload.machine_id,
        technician_id=payload.technician_id,
        issue_title=payload.issue_title,
        issue_description=payload.issue_description,
        issue_category=payload.issue_category,
        priority=ai_priority,
        ai_suggested_priority=ai_priority,
        ai_possible_root_cause=ai_suggestion["root_cause"],
        ai_recommended_action=ai_suggestion["action"],
        estimated_repair_hours=ai_suggestion["estimated_hours"],
    )

    db.add(ticket)

    if ai_priority in ["High", "Critical"]:
        machine.status = "Down"

    db.commit()
    db.refresh(ticket)

    return ticket


@router.get("/", response_model=list[TicketOut])
def get_tickets(db: Session = Depends(get_db)):
    return db.query(MaintenanceTicket).order_by(MaintenanceTicket.id.desc()).all()


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketOut)
def update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = ["Open", "In Progress", "Completed", "Cancelled"]

    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid ticket status")

    ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status

    if payload.status == "In Progress" and not ticket.downtime_start:
        ticket.downtime_start = datetime.now()

    if payload.status == "Completed":
        ticket.completed_at = datetime.now()

    db.commit()
    db.refresh(ticket)

    return ticket


@router.patch("/{ticket_id}/assign", response_model=TicketOut)
def assign_technician(
    ticket_id: int,
    payload: TicketAssignTechnician,
    db: Session = Depends(get_db),
):
    ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.technician_id:
        technician = db.query(Technician).filter(Technician.id == payload.technician_id).first()

        if not technician:
            raise HTTPException(status_code=404, detail="Technician not found")

    ticket.technician_id = payload.technician_id

    db.commit()
    db.refresh(ticket)

    return ticket


@router.patch("/{ticket_id}/complete", response_model=TicketOut)
def complete_ticket(
    ticket_id: int,
    payload: TicketComplete,
    db: Session = Depends(get_db),
):
    ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.root_cause = payload.root_cause
    ticket.action_taken = payload.action_taken
    ticket.spare_parts_used = payload.spare_parts_used
    ticket.downtime_start = payload.downtime_start or ticket.downtime_start
    ticket.downtime_end = payload.downtime_end or datetime.now()
    ticket.status = "Completed"
    ticket.completed_at = datetime.now()

    machine = db.query(Machine).filter(Machine.id == ticket.machine_id).first()

    if machine:
        active_tickets = (
            db.query(MaintenanceTicket)
            .filter(
                MaintenanceTicket.machine_id == ticket.machine_id,
                MaintenanceTicket.status.in_(["Open", "In Progress"]),
                MaintenanceTicket.id != ticket.id,
            )
            .count()
        )

        if active_tickets == 0:
            machine.status = "Running"

    db.commit()
    db.refresh(ticket)

    return ticket