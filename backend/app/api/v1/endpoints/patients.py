"""
Endpoints REST para gestión de Pacientes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.repositories.patient_repository import PatientRepository
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter()


@router.get("/", response_model=List[PatientResponse])
def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Obtener lista de pacientes con paginación
    
    - **skip**: Número de registros a saltar (para paginación)
    - **limit**: Máximo número de registros a retornar
    """
    repo = PatientRepository(db)                    # Crear instancia del repositorio con la sesión de BD
    return repo.get_all(skip=skip, limit=limit)     # Llamar al repositorio para obtener los pacientes limitados por paginación



@router.get("/search", response_model=List[PatientResponse])
def search_patients(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Buscar pacientes por nombre o CI
    
    - **q**: Término de búsqueda
    """
    repo = PatientRepository(db)
    return repo.search(q, skip=skip, limit=limit)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener un paciente específico por ID
    """
    repo = PatientRepository(db)
    if patient := repo.get_by_id(patient_id):               # Si el paciente existe, lo retornamos
        return patient
    else:                                                   # Si no, lanzamos un error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,          # El código de estado HTTP para "No encontrado"
            detail=f"Paciente con ID {patient_id} no encontrado"
        )
    



@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):  # sourcery skip: inline-immediately-returned-variable, use-named-expression
    """
    Crear un nuevo paciente
    
    Valida que no exista otro paciente con el mismo CI o email
    """
    repo = PatientRepository(db)
    
    # Validar CI único
    existing_patient = repo.get_by_ci(patient.ci)
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un paciente con CI {patient.ci}"
        )
    
    # Validar email único (si se proporciona)
    if patient.email:
        existing_email = repo.get_by_email(patient.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un paciente con email {patient.email}"
            )
    
    new_patient = repo.create(patient)
    return new_patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db)
):  # sourcery skip: inline-immediately-returned-variable, use-named-expression
    """
    Actualizar un paciente existente
    
    Solo se actualizan los campos enviados en el request
    """
    repo = PatientRepository(db)
    
    # Verificar que existe
    existing_patient = repo.get_by_id(patient_id)
    if not existing_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paciente con ID {patient_id} no encontrado"
        )
    
    # Validar email único (si se está actualizando)
    if patient.email and patient.email != existing_patient.email:
        email_exists = repo.get_by_email(patient.email)
        if email_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un paciente con email {patient.email}"
            )
    
    updated_patient = repo.update(patient_id, patient)
    return updated_patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    # sourcery skip: reintroduce-else, swap-if-else-branches, use-named-expression
    """
    Eliminar un paciente
    """
    repo = PatientRepository(db)
    
    success = repo.delete(patient_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paciente con ID {patient_id} no encontrado"
        )
    
    return None
