"""
Modelo User
Usuarios del sistema con roles y permisos
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class RoleType(str, enum.Enum):
    """Tipos de roles"""
    SUPER_ADMIN = "super_admin"  # Administrador del SaaS (tú)
    ADMIN = "admin"  # Dueño del consultorio
    DOCTOR = "doctor"  # Profesional médico
    SECRETARIA = "secretaria"  # Recepción/administración
    CONTADOR = "contador"  # Solo reportes financieros


class User(Base):
    """Modelo de Usuario"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    consultorio_id = Column(Integer, ForeignKey("consultorios.id"), nullable=False)
    
    # Datos personales
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Autenticación
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Rol
    role = Column(SQLEnum(RoleType), default=RoleType.SECRETARIA, nullable=False)
    
    # Metadata
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    consultorio = relationship("Consultorio", back_populates="users")
