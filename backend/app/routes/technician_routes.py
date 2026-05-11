from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Technician
from app.schemas import TechnicianCreate, TechnicianOut

router = APIRouter(prefix="/api/technicians", tags=["Technicians"])


@router.post("/", response_model=TechnicianOut)
def create_technician(payload: TechnicianCreate, db: Session = Depends(get_db)):
    technician = Technician(**payload.model_dump())

    db.add(technician)
    db.commit()
    db.refresh(technician)

    return technician


@router.get("/", response_model=list[TechnicianOut])
def get_technicians(db: Session = Depends(get_db)):
    return db.query(Technician).order_by(Technician.id.desc()).all()