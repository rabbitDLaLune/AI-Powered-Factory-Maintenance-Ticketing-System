from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "technician"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class MachineCreate(BaseModel):
    machine_code: str
    name: str
    location: Optional[str] = None
    machine_type: Optional[str] = None
    status: str = "Running"


class MachineOut(BaseModel):
    id: int
    machine_code: str
    name: str
    location: Optional[str]
    machine_type: Optional[str]
    status: str

    class Config:
        from_attributes = True


class TechnicianCreate(BaseModel):
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    skill_area: Optional[str] = None


class TechnicianOut(BaseModel):
    id: int
    full_name: str
    email: Optional[EmailStr]
    phone: Optional[str]
    skill_area: Optional[str]

    class Config:
        from_attributes = True


class TicketCreate(BaseModel):
    machine_id: int
    technician_id: Optional[int] = None
    issue_title: str
    issue_description: str
    issue_category: Optional[str] = None

class TicketStatusUpdate(BaseModel):
    status: str

class TicketAssignTechnician(BaseModel):
    technician_id: Optional[int] = None


class TicketComplete(BaseModel):
    root_cause: str
    action_taken: str
    spare_parts_used: Optional[str] = None
    downtime_start: Optional[datetime] = None
    downtime_end: Optional[datetime] = None

class TicketOut(BaseModel):
    id: int
    ticket_no: str
    machine_id: int
    technician_id: Optional[int]
    issue_title: str
    issue_description: str
    issue_category: Optional[str]
    priority: str
    status: str

    ai_suggested_priority: Optional[str]
    ai_possible_root_cause: Optional[str]
    ai_recommended_action: Optional[str]
    estimated_repair_hours: Optional[float]

    downtime_start: Optional[datetime]
    downtime_end: Optional[datetime]
    root_cause: Optional[str]
    action_taken: Optional[str]
    spare_parts_used: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

    