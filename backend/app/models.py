from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "technician", name="user_roles"), default="technician")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    machine_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    location = Column(String(120), nullable=True)
    machine_type = Column(String(100), nullable=True)
    status = Column(Enum("Running", "Down", "Maintenance", name="machine_status"), default="Running")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tickets = relationship("MaintenanceTicket", back_populates="machine")


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=True)
    phone = Column(String(50), nullable=True)
    skill_area = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tickets = relationship("MaintenanceTicket", back_populates="technician")


class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_no = Column(String(50), unique=True, index=True, nullable=False)

    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("technicians.id"), nullable=True)

    issue_title = Column(String(180), nullable=False)
    issue_description = Column(Text, nullable=False)
    issue_category = Column(String(100), nullable=True)

    priority = Column(Enum("Low", "Medium", "High", "Critical", name="ticket_priority"), default="Medium")
    status = Column(Enum("Open", "In Progress", "Completed", "Cancelled", name="ticket_status"), default="Open")

    ai_suggested_priority = Column(String(50), nullable=True)
    ai_possible_root_cause = Column(Text, nullable=True)
    ai_recommended_action = Column(Text, nullable=True)
    estimated_repair_hours = Column(Float, nullable=True)

    downtime_start = Column(DateTime(timezone=True), nullable=True)
    downtime_end = Column(DateTime(timezone=True), nullable=True)

    root_cause = Column(Text, nullable=True)
    action_taken = Column(Text, nullable=True)
    spare_parts_used = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    machine = relationship("Machine", back_populates="tickets")
    technician = relationship("Technician", back_populates="tickets")