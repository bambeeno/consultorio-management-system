"""
Modelo Patient (Paciente)
Actualizado con multi-tenancy y género
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.db.base import Base


class GenderType(str, enum.Enum):
    """Tipos de género/sexo"""
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"
    PREFIERE_NO_DECIR = "prefiere_no_decir"


class Patient(Base):
    """Modelo de Paciente"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)
    
    # Datos personales
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    ci = Column(String(20), index=True, nullable=False)
    
    # Datos demográficos
    gender = Column(SQLEnum(GenderType), nullable=True)  # Opcional pero recomendado
    birth_date = Column(Date, nullable=True)
    
    # Contacto
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Relaciones
    consultorio = relationship("Consultorio", back_populates="patients")
