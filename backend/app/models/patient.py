"""
Modelo de Paciente
"""
import enum
from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base


class GenderType(str, enum.Enum):
    """Tipos de genero"""
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"
    PREFIERE_NO_DECIR = "prefiere_no_decir"


class Patient(Base):
    """Modelo de Paciente"""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    ci = Column(String(20), nullable=False, index=True)
    gender = Column(SQLEnum(GenderType), nullable=True)
    birth_date = Column(Date, nullable=True)
    
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relaciones
    consultorio = relationship("Consultorio", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
