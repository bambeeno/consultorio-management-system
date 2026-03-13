"""
Schemas para Appointments (Turnos)
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.models.appointment import AppointmentStatus


# ============= BASE SCHEMAS =============

class AppointmentBase(BaseModel):
    """Schema base para appointments"""
    patient_id: int
    doctor_id: int
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.SCHEDULED


# ============= REQUEST SCHEMAS =============

class AppointmentCreate(AppointmentBase):
    """Schema para crear un turno"""
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v, info):
        """Validar que end_time sea después de start_time"""
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time debe ser posterior a start_time')
        return v


class AppointmentUpdate(BaseModel):
    """Schema para actualizar un turno"""
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None


class AppointmentStatusUpdate(BaseModel):
    """Schema para actualizar solo el estado"""
    status: AppointmentStatus


# ============= RESPONSE SCHEMAS =============

class AppointmentResponse(AppointmentBase):
    """Schema de respuesta con datos completos"""
    id: int
    consultorio_id: int
    created_at: datetime
    updated_at: datetime
    
    # Datos del paciente (nested)
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    
    # Datos del doctor (nested)
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    """Schema para lista de turnos"""
    appointments: list[AppointmentResponse]
    total: int
