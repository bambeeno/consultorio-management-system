"""
Repository para Appointments
"""
from datetime import datetime, date
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


class AppointmentRepository:
    """Repository pattern para gestión de turnos"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, appointment_data: AppointmentCreate, consultorio_id: int) -> Appointment:
        """Crear un nuevo turno"""
        appointment = Appointment(
            **appointment_data.model_dump(),
            consultorio_id=consultorio_id
        )
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def get_by_id(self, appointment_id: int, consultorio_id: int) -> Optional[Appointment]:
        """Obtener turno por ID (con multi-tenancy)"""
        return self.db.query(Appointment).filter(
            and_(
                Appointment.id == appointment_id,
                Appointment.consultorio_id == consultorio_id
            )
        ).options(
            joinedload(Appointment.patient),
            joinedload(Appointment.doctor)
        ).first()
    
    def get_all(
        self,
        consultorio_id: int,
        skip: int = 0,
        limit: int = 100,
        doctor_id: Optional[int] = None,
        patient_id: Optional[int] = None,
        status: Optional[AppointmentStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> list[Appointment]:
        """Obtener turnos con filtros opcionales"""
        query = self.db.query(Appointment).filter(
            Appointment.consultorio_id == consultorio_id
        )
        
        # Filtros opcionales
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        
        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)
        
        if status:
            query = query.filter(Appointment.status == status)
        
        if start_date:
            query = query.filter(Appointment.start_time >= start_date)
        
        if end_date:
            query = query.filter(Appointment.start_time < end_date)
        
        # Ordenar por fecha
        query = query.order_by(Appointment.start_time.asc())
        
        # Eager load relaciones
        query = query.options(
            joinedload(Appointment.patient),
            joinedload(Appointment.doctor)
        )
        
        return query.offset(skip).limit(limit).all()
    
    def update(
        self,
        appointment_id: int,
        consultorio_id: int,
        appointment_data: AppointmentUpdate
    ) -> Optional[Appointment]:
        """Actualizar un turno"""
        appointment = self.get_by_id(appointment_id, consultorio_id)
        if not appointment:
            return None
        
        # Actualizar solo campos no nulos
        update_data = appointment_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(appointment, field, value)
        
        self.db.commit()
        self.db.refresh(appointment)
        return appointment
    
    def delete(self, appointment_id: int, consultorio_id: int) -> bool:
        """Eliminar un turno"""
        appointment = self.get_by_id(appointment_id, consultorio_id)
        if not appointment:
            return False
        
        self.db.delete(appointment)
        self.db.commit()
        return True
    
    def check_availability(
        self,
        doctor_id: int,
        consultorio_id: int,
        start_time: datetime,
        end_time: datetime,
        exclude_appointment_id: Optional[int] = None
    ) -> bool:
        """
        Verificar si el doctor está disponible en ese horario
        Retorna True si está disponible, False si hay conflicto
        """
        query = self.db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.consultorio_id == consultorio_id,
                Appointment.status.in_([
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS
                ]),
                or_(
                    # El nuevo turno empieza durante un turno existente
                    and_(
                        Appointment.start_time <= start_time,
                        Appointment.end_time > start_time
                    ),
                    # El nuevo turno termina durante un turno existente
                    and_(
                        Appointment.start_time < end_time,
                        Appointment.end_time >= end_time
                    ),
                    # El nuevo turno engloba completamente a uno existente
                    and_(
                        Appointment.start_time >= start_time,
                        Appointment.end_time <= end_time
                    )
                )
            )
        )
        
        # Excluir el turno actual si estamos actualizando
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)
        
        conflicting_appointment = query.first()
        return conflicting_appointment is None
    
    def get_count(
        self,
        consultorio_id: int,
        doctor_id: Optional[int] = None,
        patient_id: Optional[int] = None,
        status: Optional[AppointmentStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Contar turnos con filtros"""
        query = self.db.query(Appointment).filter(
            Appointment.consultorio_id == consultorio_id
        )
        
        if doctor_id:
            query = query.filter(Appointment.doctor_id == doctor_id)
        if patient_id:
            query = query.filter(Appointment.patient_id == patient_id)
        if status:
            query = query.filter(Appointment.status == status)
        if start_date:
            query = query.filter(Appointment.start_time >= start_date)
        if end_date:
            query = query.filter(Appointment.start_time < end_date)
        
        return query.count()
