"""
Schemas de Pydantic para Paciente
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date, datetime


class PatientBase(BaseModel):
    """Schema base de Paciente"""
    first_name: str
    last_name: str
    dni: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None


class PatientCreate(PatientBase):
    """Schema para crear Paciente"""
    pass


class PatientUpdate(BaseModel):
    """Schema para actualizar Paciente"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None


class PatientResponse(PatientBase):
    """Schema de respuesta de Paciente"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
