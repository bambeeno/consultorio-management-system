"""
Repository para operaciones de base de datos de Pacientes
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientRepository:
    """
    Capa de acceso a datos para Pacientes
    Separa la lógica de BD del resto de la aplicación
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """Obtener todos los pacientes con paginación"""
        return self.db.query(Patient).offset(skip).limit(limit).all()
    
    def get_by_id(self, patient_id: int) -> Optional[Patient]:
        """Obtener paciente por ID"""
        return self.db.query(Patient).filter(Patient.id == patient_id).first()
    
    def get_by_dni(self, dni: str) -> Optional[Patient]:
        """Obtener paciente por DNI"""
        return self.db.query(Patient).filter(Patient.dni == dni).first()
    
    def get_by_email(self, email: str) -> Optional[Patient]:
        """Obtener paciente por email"""
        return self.db.query(Patient).filter(Patient.email == email).first()
    
    def create(self, patient_data: PatientCreate) -> Patient:
        """Crear nuevo paciente"""
        db_patient = Patient(**patient_data.model_dump())
        self.db.add(db_patient)
        self.db.commit()
        self.db.refresh(db_patient)
        return db_patient
    
    def update(self, patient_id: int, patient_data: PatientUpdate) -> Optional[Patient]:
        """Actualizar paciente existente"""
        db_patient = self.get_by_id(patient_id)
        if not db_patient:
            return None
        
        # Actualizar solo los campos que vienen en el request
        update_data = patient_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_patient, field, value)
        
        self.db.commit()
        self.db.refresh(db_patient)
        return db_patient
    
    def delete(self, patient_id: int) -> bool:
        """Eliminar paciente"""
        db_patient = self.get_by_id(patient_id)
        if not db_patient:
            return False
        
        self.db.delete(db_patient)
        self.db.commit()
        return True
    
    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[Patient]:
        """Buscar pacientes por nombre o DNI"""
        search_pattern = f"%{query}%"
        return (
            self.db.query(Patient)
            .filter(
                (Patient.first_name.ilike(search_pattern)) |
                (Patient.last_name.ilike(search_pattern)) |
                (Patient.dni.ilike(search_pattern))
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
