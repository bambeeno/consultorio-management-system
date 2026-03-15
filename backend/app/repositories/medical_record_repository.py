"""
Repository para Medical Records
"""
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate


class MedicalRecordRepository:
    """Repository pattern para gestión de historias clínicas"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(
        self, 
        record_data: MedicalRecordCreate, 
        consultorio_id: int,
        doctor_id: int
    ) -> MedicalRecord:
        """Crear una nueva historia clínica"""
        record = MedicalRecord(
            **record_data.model_dump(),
            consultorio_id=consultorio_id,
            doctor_id=doctor_id
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def get_by_id(self, record_id: int, consultorio_id: int) -> Optional[MedicalRecord]:
        """Obtener historia clínica por ID (con multi-tenancy)"""
        return self.db.query(MedicalRecord).filter(
            and_(
                MedicalRecord.id == record_id,
                MedicalRecord.consultorio_id == consultorio_id
            )
        ).options(
            joinedload(MedicalRecord.patient),
            joinedload(MedicalRecord.doctor),
            joinedload(MedicalRecord.appointment)
        ).first()
    
    def get_all(
        self,
        consultorio_id: int,
        skip: int = 0,
        limit: int = 100,
        patient_id: Optional[int] = None,
        doctor_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> list[MedicalRecord]:
        """Obtener historias clínicas con filtros opcionales"""
        query = self.db.query(MedicalRecord).filter(
            MedicalRecord.consultorio_id == consultorio_id
        )
        
        # Filtros opcionales
        if patient_id:
            query = query.filter(MedicalRecord.patient_id == patient_id)
        
        if doctor_id:
            query = query.filter(MedicalRecord.doctor_id == doctor_id)
        
        if start_date:
            query = query.filter(MedicalRecord.consultation_date >= start_date)
        
        if end_date:
            query = query.filter(MedicalRecord.consultation_date < end_date)
        
        # Ordenar por fecha (más reciente primero)
        query = query.order_by(MedicalRecord.consultation_date.desc())
        
        # Eager load relaciones
        query = query.options(
            joinedload(MedicalRecord.patient),
            joinedload(MedicalRecord.doctor),
            joinedload(MedicalRecord.appointment)
        )
        
        return query.offset(skip).limit(limit).all()
    
    def get_by_patient(
        self,
        patient_id: int,
        consultorio_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[MedicalRecord]:
        """Obtener todas las historias clínicas de un paciente"""
        return self.get_all(
            consultorio_id=consultorio_id,
            patient_id=patient_id,
            skip=skip,
            limit=limit
        )
    
    def update(
        self,
        record_id: int,
        consultorio_id: int,
        record_data: MedicalRecordUpdate
    ) -> Optional[MedicalRecord]:
        """Actualizar una historia clínica"""
        record = self.get_by_id(record_id, consultorio_id)
        if not record:
            return None
        
        # Actualizar solo campos no nulos
        update_data = record_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(record, field, value)
        
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def delete(self, record_id: int, consultorio_id: int) -> bool:
        """Eliminar una historia clínica"""
        record = self.get_by_id(record_id, consultorio_id)
        if not record:
            return False
        
        self.db.delete(record)
        self.db.commit()
        return True
    
    def get_count(
        self,
        consultorio_id: int,
        patient_id: Optional[int] = None,
        doctor_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Contar historias clínicas con filtros"""
        query = self.db.query(MedicalRecord).filter(
            MedicalRecord.consultorio_id == consultorio_id
        )
        
        if patient_id:
            query = query.filter(MedicalRecord.patient_id == patient_id)
        if doctor_id:
            query = query.filter(MedicalRecord.doctor_id == doctor_id)
        if start_date:
            query = query.filter(MedicalRecord.consultation_date >= start_date)
        if end_date:
            query = query.filter(MedicalRecord.consultation_date < end_date)
        
        return query.count()
