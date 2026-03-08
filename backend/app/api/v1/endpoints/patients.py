"""
Endpoints de Pacientes
Actualizado con autenticación y multi-tenancy
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.repositories.patient_repository import PatientRepository
from app.core.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[PatientResponse])
def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar pacientes del consultorio
    
    ¿Qué cambió?
    - Ahora requiere autenticación (current_user)
    - Solo retorna pacientes del consultorio del usuario
    - Secretaria, Doctor y Admin ven los mismos pacientes de su consultorio
    """
    repo = PatientRepository(db)
    return repo.get_all(
        consultorio_id=current_user.consultorio_id,
        skip=skip,
        limit=limit
    )


@router.get("/search", response_model=List[PatientResponse])
def search_patients(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Buscar pacientes por nombre o CI
    
    ¿Qué cambió?
    - Requiere autenticación
    - Solo busca en el consultorio del usuario
    """
    repo = PatientRepository(db)
    return repo.search(
        query=q,
        consultorio_id=current_user.consultorio_id,
        skip=skip,
        limit=limit
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener un paciente por ID
    
    ¿Qué cambió?
    - Requiere autenticación
    - Verifica que el paciente pertenezca al consultorio del usuario
    - Si pides un paciente de otro consultorio → 404
    """
    repo = PatientRepository(db)
    patient = repo.get_by_id(
        patient_id=patient_id,
        consultorio_id=current_user.consultorio_id
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo paciente
    
    ¿Qué cambió?
    - Requiere autenticación
    - Automáticamente asigna el consultorio del usuario
    - Verifica CI único dentro del consultorio
    """
    repo = PatientRepository(db)
    
    # Verificar CI único en el consultorio
    existing_patient = repo.get_by_ci(
        ci=patient.ci,
        consultorio_id=current_user.consultorio_id
    )
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A patient with this CI already exists in your consultorio"
        )
    
    # Verificar email único en el consultorio (si se proporciona)
    if patient.email:
        existing_email = repo.get_by_email(
            email=patient.email,
            consultorio_id=current_user.consultorio_id
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A patient with this email already exists in your consultorio"
            )
    
    # Crear paciente con consultorio_id automático
    return repo.create(
        patient_data=patient,
        consultorio_id=current_user.consultorio_id
    )


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar un paciente
    
    ¿Qué cambió?
    - Requiere autenticación
    - Solo puede actualizar pacientes de su consultorio
    """
    repo = PatientRepository(db)
    
    # Verificar email único si se está actualizando
    if patient_data.email:
        existing_email = repo.get_by_email(
            email=patient_data.email,
            consultorio_id=current_user.consultorio_id
        )
        if existing_email and existing_email.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A patient with this email already exists in your consultorio"
            )
    
    patient = repo.update(
        patient_id=patient_id,
        patient_data=patient_data,
        consultorio_id=current_user.consultorio_id
    )
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un paciente
    
    ¿Qué cambió?
    - Requiere autenticación
    - Solo puede eliminar pacientes de su consultorio
    """
    repo = PatientRepository(db)
    
    deleted = repo.delete(
        patient_id=patient_id,
        consultorio_id=current_user.consultorio_id
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return None
