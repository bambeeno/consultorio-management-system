"""
Repository para operaciones de Patient
Actualizado con multi-tenancy
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientRepository:
    """
    Repositorio de operaciones con Patient
    
    IMPORTANTE: Todos los métodos ahora requieren consultorio_id
    para asegurar la separación de datos entre consultorios
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, consultorio_id: int, skip: int = 0, limit: int = 100) -> List[Patient]:
        """
        Obtener todos los pacientes de un consultorio
        
        ¿Qué cambió?
        - Ahora filtra por consultorio_id automáticamente
        - Un consultorio solo ve sus propios pacientes
        """
        return self.db.query(Patient).filter(
            Patient.consultorio_id == consultorio_id
        ).offset(skip).limit(limit).all()
    
    def get_by_id(self, patient_id: int, consultorio_id: int) -> Optional[Patient]:
        """
        Obtener un paciente por ID
        
        ¿Qué cambió?
        - Verifica que el paciente pertenezca al consultorio
        - Seguridad: Consultorio A no puede ver pacientes de Consultorio B
        """
        return self.db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.consultorio_id == consultorio_id
        ).first()
    
    def get_by_ci(self, ci: str, consultorio_id: int) -> Optional[Patient]:
        """
        Obtener paciente por CI
        
        ¿Qué cambió?
        - CI es único por consultorio, no globalmente
        - Dos consultorios pueden tener pacientes con mismo CI
        """
        return self.db.query(Patient).filter(
            Patient.ci == ci,
            Patient.consultorio_id == consultorio_id
        ).first()
    
    def get_by_email(self, email: str, consultorio_id: int) -> Optional[Patient]:
        """Obtener paciente por email dentro de un consultorio"""
        return self.db.query(Patient).filter(
            Patient.email == email,
            Patient.consultorio_id == consultorio_id
        ).first()
    
    def create(self, patient_data: PatientCreate, consultorio_id: int) -> Patient:
        """
        Crear un paciente
        
        ¿Qué cambió?
        - Automáticamente asigna consultorio_id
        - Asegura que el paciente pertenezca al consultorio correcto
        """
        patient = Patient(
            **patient_data.model_dump(),
            consultorio_id=consultorio_id
        )
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient
    
    def update(self, patient_id: int, patient_data: PatientUpdate, consultorio_id: int) -> Optional[Patient]:
        """
        Actualizar un paciente
        
        ¿Qué cambió?
        - Verifica que el paciente pertenezca al consultorio
        - No permite actualizar pacientes de otros consultorios
        """
        patient = self.get_by_id(patient_id, consultorio_id)
        if not patient:
            return None
        
        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)
        
        self.db.commit()
        self.db.refresh(patient)
        return patient
    
    def delete(self, patient_id: int, consultorio_id: int) -> bool:
        """
        Eliminar un paciente
        
        ¿Qué cambió?
        - Verifica que el paciente pertenezca al consultorio
        - No permite eliminar pacientes de otros consultorios
        """
        patient = self.get_by_id(patient_id, consultorio_id)
        if not patient:
            return False
        
        self.db.delete(patient)
        self.db.commit()
        return True
    
    def search(self, query: str, consultorio_id: int, skip: int = 0, limit: int = 100) -> List[Patient]:
        """
        Buscar pacientes por nombre o CI
        
        ¿Qué cambió?
        - Solo busca dentro del consultorio
        """
        return self.db.query(Patient).filter(
            Patient.consultorio_id == consultorio_id
        ).filter(
            (Patient.first_name.ilike(f"%{query}%")) |
            (Patient.last_name.ilike(f"%{query}%")) |
            (Patient.ci.ilike(f"%{query}%"))
        ).offset(skip).limit(limit).all()
