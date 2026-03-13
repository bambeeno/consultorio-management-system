"""
Modelo de Consultorio
"""
import enum
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.session import Base


class PlanType(str, enum.Enum):
    """Tipos de plan de suscripcion"""
    STARTER = "starter"
    PRO = "pro"
    CLINICA = "clinica"
    IA = "ia"


class Consultorio(Base):
    """Modelo de Consultorio (Tenant)"""
    __tablename__ = "consultorios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    ruc = Column(String(50), nullable=True, unique=True)
    direccion = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    
    plan = Column(SQLEnum(PlanType), default=PlanType.STARTER, nullable=False)
    activo = Column(Boolean, default=True)
    
    fecha_suscripcion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    fecha_vencimiento = Column(DateTime(timezone=True), nullable=True)
    
    trial = Column(Boolean, default=True)
    trial_ends = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(days=30))
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    users = relationship("User", back_populates="consultorio")
    patients = relationship("Patient", back_populates="consultorio")
    appointments = relationship("Appointment", back_populates="consultorio")
