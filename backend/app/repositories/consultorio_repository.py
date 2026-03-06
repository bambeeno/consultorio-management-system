"""
Repository para operaciones de Consultorio
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.models.consultorio import Consultorio, PlanType


class ConsultorioRepository:
    """Repositorio de operaciones con Consultorio"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, consultorio_id: int) -> Optional[Consultorio]:
        """Obtener consultorio por ID"""
        return self.db.query(Consultorio).filter(
            Consultorio.id == consultorio_id
        ).first()
    
    def create(self, consultorio_data: dict) -> Consultorio:
        """
        Crear nuevo consultorio
        
        ¿Qué hace?
        - Crea el consultorio con plan STARTER
        - Activa trial de 30 días
        - Retorna el consultorio creado
        """
        # Trial de 30 días gratis
        trial_ends = datetime.utcnow() + timedelta(days=30)
        
        consultorio = Consultorio(
            **consultorio_data,
            plan=PlanType.STARTER,
            trial=True,
            trial_ends=trial_ends,
            activo=True
        )
        
        self.db.add(consultorio)
        self.db.commit()
        self.db.refresh(consultorio)
        return consultorio
    
    def is_active(self, consultorio_id: int) -> bool:
        """
        Verificar si el consultorio está activo
        
        ¿Qué verifica?
        - Si está marcado como activo
        - Si está en trial y no expiró
        - Si tiene suscripción vigente
        """
        consultorio = self.get_by_id(consultorio_id)
        if not consultorio or not consultorio.activo:
            return False
        
        # Si está en trial, verificar que no expiró
        if consultorio.trial:
            return consultorio.trial_ends > datetime.utcnow()
        
        # Si no está en trial, verificar fecha de vencimiento
        if consultorio.fecha_vencimiento:
            return consultorio.fecha_vencimiento > datetime.utcnow()
        
        return True
