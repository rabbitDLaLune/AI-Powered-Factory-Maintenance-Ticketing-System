from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Machine, MaintenanceTicket

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Analytics"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_machines = db.query(Machine).count()
    machines_down = db.query(Machine).filter(Machine.status == "Down").count()
    machines_running = db.query(Machine).filter(Machine.status == "Running").count()
    machines_maintenance = (
        db.query(Machine).filter(Machine.status == "Maintenance").count()
    )

    total_tickets = db.query(MaintenanceTicket).count()
    open_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.status == "Open")
        .count()
    )
    in_progress_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.status == "In Progress")
        .count()
    )
    completed_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.status == "Completed")
        .count()
    )
    cancelled_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.status == "Cancelled")
        .count()
    )

    critical_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.priority == "Critical")
        .count()
    )
    high_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.priority == "High")
        .count()
    )
    medium_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.priority == "Medium")
        .count()
    )
    low_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.priority == "Low")
        .count()
    )

    avg_estimated_repair_hours = (
        db.query(func.avg(MaintenanceTicket.estimated_repair_hours)).scalar()
    )

    recent_critical_tickets = (
        db.query(MaintenanceTicket)
        .filter(MaintenanceTicket.priority == "Critical")
        .order_by(MaintenanceTicket.id.desc())
        .limit(5)
        .all()
    )

    return {
        "machine_summary": {
            "total": total_machines,
            "running": machines_running,
            "down": machines_down,
            "maintenance": machines_maintenance,
        },
        "ticket_summary": {
            "total": total_tickets,
            "open": open_tickets,
            "in_progress": in_progress_tickets,
            "completed": completed_tickets,
            "cancelled": cancelled_tickets,
        },
        "priority_summary": {
            "critical": critical_tickets,
            "high": high_tickets,
            "medium": medium_tickets,
            "low": low_tickets,
        },
        "performance_summary": {
            "average_estimated_repair_hours": round(avg_estimated_repair_hours or 0, 2),
        },
        "recent_critical_tickets": [
            {
                "id": ticket.id,
                "ticket_no": ticket.ticket_no,
                "issue_title": ticket.issue_title,
                "status": ticket.status,
                "priority": ticket.priority,
                "estimated_repair_hours": ticket.estimated_repair_hours,
                "created_at": ticket.created_at,
            }
            for ticket in recent_critical_tickets
        ],
    }