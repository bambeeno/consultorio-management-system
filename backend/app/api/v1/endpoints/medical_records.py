"""
Endpoints para gestión de historias clínicas
"""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies.auth import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.medical_record_repository import MedicalRecordRepository
from app.repositories.patient_repository import PatientRepository
from app.repositories.appointment_repository import AppointmentRepository
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    MedicalRecordResponse,
    MedicalRecordListResponse
)


router = APIRouter()


def format_medical_record_response(record) -> MedicalRecordResponse:
    """Formatear respuesta con datos del paciente y doctor"""
    return MedicalRecordResponse(
        id=record.id,
        consultorio_id=record.consultorio_id,
        patient_id=record.patient_id,
        appointment_id=record.appointment_id,
        doctor_id=record.doctor_id,
        consultation_date=record.consultation_date,
        chief_complaint=record.chief_complaint,
        symptoms=record.symptoms,
        diagnosis=record.diagnosis,
        treatment=record.treatment,
        notes=record.notes,
        blood_pressure=record.blood_pressure,
        heart_rate=record.heart_rate,
        temperature=record.temperature,
        weight=record.weight,
        height=record.height,
        created_at=record.created_at,
        updated_at=record.updated_at,
        patient_name=f"{record.patient.first_name} {record.patient.last_name}" if record.patient else None,
        doctor_name=f"{record.doctor.first_name} {record.doctor.last_name}" if record.doctor else None
    )


@router.post("/", response_model=MedicalRecordResponse, status_code=201)
def create_medical_record(
    record: MedicalRecordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Crear una nueva historia clínica
    
    Validaciones:
    - El paciente debe existir y pertenecer al consultorio
    - Si se asocia a un turno, debe existir y pertenecer al consultorio
    """
    repo = MedicalRecordRepository(db)
    patient_repo = PatientRepository(db)
    
    # Validar que el paciente existe y pertenece al consultorio
    patient = patient_repo.get_by_id(record.patient_id, current_user.consultorio_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    # Si se asocia a un turno, validar que existe
    if record.appointment_id:
        appointment_repo = AppointmentRepository(db)
        appointment = appointment_repo.get_by_id(record.appointment_id, current_user.consultorio_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
    
    # Crear la historia clínica
    new_record = repo.create(
        record, 
        current_user.consultorio_id,
        current_user.id  # doctor_id es el usuario actual
    )
    
    return format_medical_record_response(new_record)


@router.get("/", response_model=MedicalRecordListResponse)
def list_medical_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar historias clínicas con filtros opcionales
    
    Filtros disponibles:
    - patient_id: Historias de un paciente específico
    - doctor_id: Historias creadas por un doctor específico
    - start_date: Desde esta fecha
    - end_date: Hasta esta fecha
    """
    repo = MedicalRecordRepository(db)
    
    records = repo.get_all(
        consultorio_id=current_user.consultorio_id,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        doctor_id=doctor_id,
        start_date=start_date,
        end_date=end_date
    )
    
    total = repo.get_count(
        consultorio_id=current_user.consultorio_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        start_date=start_date,
        end_date=end_date
    )
    
    return MedicalRecordListResponse(
        medical_records=[format_medical_record_response(rec) for rec in records],
        total=total
    )


@router.get("/patient/{patient_id}", response_model=MedicalRecordListResponse)
def get_patient_medical_history(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener el historial médico completo de un paciente
    Ordenado por fecha (más reciente primero)
    """
    repo = MedicalRecordRepository(db)
    patient_repo = PatientRepository(db)
    
    # Validar que el paciente existe y pertenece al consultorio
    patient = patient_repo.get_by_id(patient_id, current_user.consultorio_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    records = repo.get_by_patient(
        patient_id=patient_id,
        consultorio_id=current_user.consultorio_id,
        skip=skip,
        limit=limit
    )
    
    total = repo.get_count(
        consultorio_id=current_user.consultorio_id,
        patient_id=patient_id
    )
    
    return MedicalRecordListResponse(
        medical_records=[format_medical_record_response(rec) for rec in records],
        total=total
    )


@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener una historia clínica por ID"""
    repo = MedicalRecordRepository(db)
    record = repo.get_by_id(record_id, current_user.consultorio_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    
    return format_medical_record_response(record)


@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    record_id: int,
    record_data: MedicalRecordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar una historia clínica"""
    repo = MedicalRecordRepository(db)
    
    # Verificar que la historia existe
    existing = repo.get_by_id(record_id, current_user.consultorio_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    
    updated = repo.update(record_id, current_user.consultorio_id, record_data)
    return format_medical_record_response(updated)


@router.delete("/{record_id}", status_code=204)
def delete_medical_record(
    record_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Eliminar una historia clínica"""
    repo = MedicalRecordRepository(db)
    deleted = repo.delete(record_id, current_user.consultorio_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Historia clínica no encontrada")
    
    return None
