from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Machine
from app.schemas import MachineCreate, MachineOut

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.post("/", response_model=MachineOut)
def create_machine(payload: MachineCreate, db: Session = Depends(get_db)):
    existing = db.query(Machine).filter(Machine.machine_code == payload.machine_code).first()

    if existing:
        raise HTTPException(status_code=400, detail="Machine code already exists")

    machine = Machine(**payload.model_dump())

    db.add(machine)
    db.commit()
    db.refresh(machine)

    return machine


@router.get("/", response_model=list[MachineOut])
def get_machines(db: Session = Depends(get_db)):
    return db.query(Machine).order_by(Machine.id.desc()).all()