"""
Modelo de Historia Clínica
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.session import Base


class MedicalRecord(Base):                       # Modelo de Historia Clínica / Ficha Médica
    """
    Modelo de Historia Clínica / Ficha Médica
    
    Relaciones:
    - Pertenece a un Consultorio (multi-tenancy)
    - Asociado a un Paciente
    - Opcionalmente asociado a un Turno
    - Creado por un Doctor (User)
    """
    __tablename__ = "medical_records"           # Nombre de la tabla en la base de datos

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys (multi-tenancy)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)  # Opcional
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Fecha de la consulta
    consultation_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Datos de la consulta
    chief_complaint = Column(String(500), nullable=True)  # Motivo de consulta
    symptoms = Column(Text, nullable=True)                 # Síntomas
    diagnosis = Column(Text, nullable=False)               # Diagnóstico
    treatment = Column(Text, nullable=True)                # Tratamiento prescrito
    notes = Column(Text, nullable=True)                    # Observaciones adicionales
    
    # Signos vitales
    blood_pressure = Column(String(20), nullable=True)     # Ej: "120/80"
    heart_rate = Column(Integer, nullable=True)            # Pulsaciones por minuto
    temperature = Column(Float, nullable=True)             # Temperatura en °C
    weight = Column(Float, nullable=True)                  # Peso en kg
    height = Column(Float, nullable=True)                  # Altura en cm
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relaciones
    consultorio = relationship("Consultorio", back_populates="medical_records")         
    patient = relationship("Patient", back_populates="medical_records")                
    appointment = relationship("Appointment", back_populates="medical_records")       
    doctor = relationship("User", back_populates="medical_records")
