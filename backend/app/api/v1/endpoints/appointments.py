"""
Endpoints para gestión de turnos/citas
"""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies.auth import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.appointment import AppointmentStatus
from app.repositories.appointment_repository import AppointmentRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.user_repository import UserRepository
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentStatusUpdate,
    AppointmentResponse,
    AppointmentListResponse
)


router = APIRouter()


def format_appointment_response(appointment) -> AppointmentResponse:
    """Formatear respuesta con datos del paciente y doctor"""
    return AppointmentResponse(
        id=appointment.id,
        consultorio_id=appointment.consultorio_id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        reason=appointment.reason,
        notes=appointment.notes,
        status=appointment.status,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
        patient_name=f"{appointment.patient.first_name} {appointment.patient.last_name}" if appointment.patient else None,
        patient_phone=appointment.patient.phone if appointment.patient else None,
        doctor_name=f"{appointment.doctor.first_name} {appointment.doctor.last_name}" if appointment.doctor else None
    )


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crear un nuevo turno"""
    repo = AppointmentRepository(db)
    patient_repo = PatientRepository(db)
    user_repo = UserRepository(db)
    
    # Validar paciente
    patient = patient_repo.get_by_id(appointment.patient_id, current_user.consultorio_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    # Validar doctor
    doctor = user_repo.get_by_id(appointment.doctor_id)
    if not doctor or doctor.consultorio_id != current_user.consultorio_id:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")
    
    # Verificar disponibilidad
    is_available = repo.check_availability(
        doctor_id=appointment.doctor_id,
        consultorio_id=current_user.consultorio_id,
        start_time=appointment.start_time,
        end_time=appointment.end_time
    )
    
    if not is_available:
        raise HTTPException(
            status_code=409,
            detail="El doctor ya tiene un turno agendado en ese horario"
        )
    
    new_appointment = repo.create(appointment, current_user.consultorio_id)
    return format_appointment_response(new_appointment)


@router.get("/", response_model=AppointmentListResponse)
def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    doctor_id: Optional[int] = Query(None),
    patient_id: Optional[int] = Query(None),
    status: Optional[AppointmentStatus] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar turnos con filtros"""
    repo = AppointmentRepository(db)
    
    appointments = repo.get_all(
        consultorio_id=current_user.consultorio_id,
        skip=skip,
        limit=limit,
        doctor_id=doctor_id,
        patient_id=patient_id,
        status=status,
        start_date=start_date,
        end_date=end_date
    )
    
    total = repo.get_count(
        consultorio_id=current_user.consultorio_id,
        doctor_id=doctor_id,
        patient_id=patient_id,
        status=status,
        start_date=start_date,
        end_date=end_date
    )
    
    return AppointmentListResponse(
        appointments=[format_appointment_response(apt) for apt in appointments],
        total=total
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener un turno por ID"""
    repo = AppointmentRepository(db)
    appointment = repo.get_by_id(appointment_id, current_user.consultorio_id)
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    return format_appointment_response(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar un turno"""
    repo = AppointmentRepository(db)
    
    existing = repo.get_by_id(appointment_id, current_user.consultorio_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    # Verificar disponibilidad si cambia horario
    if appointment_data.start_time or appointment_data.end_time or appointment_data.doctor_id:
        new_start = appointment_data.start_time or existing.start_time
        new_end = appointment_data.end_time or existing.end_time
        new_doctor_id = appointment_data.doctor_id or existing.doctor_id
        
        is_available = repo.check_availability(
            doctor_id=new_doctor_id,
            consultorio_id=current_user.consultorio_id,
            start_time=new_start,
            end_time=new_end,
            exclude_appointment_id=appointment_id
        )
        
        if not is_available:
            raise HTTPException(
                status_code=409,
                detail="El doctor ya tiene un turno agendado en ese horario"
            )
    
    updated = repo.update(appointment_id, current_user.consultorio_id, appointment_data)
    return format_appointment_response(updated)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_data: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar estado de un turno"""
    repo = AppointmentRepository(db)
    
    appointment_data = AppointmentUpdate(status=status_data.status)
    updated = repo.update(appointment_id, current_user.consultorio_id, appointment_data)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    return format_appointment_response(updated)


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Eliminar un turno"""
    repo = AppointmentRepository(db)
    deleted = repo.delete(appointment_id, current_user.consultorio_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    return None
