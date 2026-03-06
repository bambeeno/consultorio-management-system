"""
Modelo Consultorio (Tenant)
Cada consultorio es un tenant independiente
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class PlanType(str, enum.Enum):
    """Tipos de plan de suscripción"""
    STARTER = "starter"
    PRO = "pro"
    CLINICA = "clinica"
    IA = "ia"


class Consultorio(Base):
    """Modelo de Consultorio (Tenant)"""
    __tablename__ = "consultorios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    ruc = Column(String(50), unique=True, nullable=True)
    direccion = Column(String(500))
    telefono = Column(String(50))
    email = Column(String(255))
    
    # Plan y suscripción
    plan = Column(SQLEnum(PlanType), default=PlanType.STARTER, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    fecha_suscripcion = Column(DateTime, default=datetime.utcnow)
    fecha_vencimiento = Column(DateTime, nullable=True)
    
    # Trial
    trial = Column(Boolean, default=True, nullable=False)
    trial_ends = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    users = relationship("User", back_populates="consultorio", cascade="all, delete-orphan")
    patients = relationship("Patient", back_populates="consultorio", cascade="all, delete-orphan")
