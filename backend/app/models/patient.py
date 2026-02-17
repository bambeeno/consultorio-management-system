"""
Modelo de Paciente
"""
from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Patient(Base):
    """
    Modelo de datos para Paciente
    """
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Datos personales
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, index=True, nullable=False)
    
    # Contacto
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Info adicional
    birth_date = Column(Date, nullable=True)
    address = Column(String(255), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Patient {self.first_name} {self.last_name} - DNI: {self.dni}>"
