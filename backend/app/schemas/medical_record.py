"""
Schemas para Medical Records (Historias Clínicas)
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ============= BASE SCHEMAS =============

class MedicalRecordBase(BaseModel):
    """Schema base para medical records"""
    patient_id: int
    appointment_id: Optional[int] = None
    consultation_date: datetime
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: str
    treatment: Optional[str] = None
    notes: Optional[str] = None
    # Signos vitales
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None


# ============= REQUEST SCHEMAS =============

class MedicalRecordCreate(MedicalRecordBase):
    """Schema para crear una historia clínica"""
    pass


class MedicalRecordUpdate(BaseModel):
    """Schema para actualizar una historia clínica"""
    patient_id: Optional[int] = None
    appointment_id: Optional[int] = None
    consultation_date: Optional[datetime] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None


# ============= RESPONSE SCHEMAS =============

class MedicalRecordResponse(MedicalRecordBase):
    """Schema de respuesta con datos completos"""
    id: int
    consultorio_id: int
    doctor_id: int
    created_at: datetime
    updated_at: datetime
    
    # Datos relacionados (nested)
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True


class MedicalRecordListResponse(BaseModel):
    """Schema para lista de historias clínicas"""
    medical_records: list[MedicalRecordResponse]
    total: int
