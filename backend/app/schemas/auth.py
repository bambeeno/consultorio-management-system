"""
Schemas para autenticación
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import RoleType


class UserRegister(BaseModel):
    """Schema para registro de usuario"""
    # Datos del consultorio (si es el primero)
    consultorio_nombre: str
    consultorio_email: Optional[EmailStr] = None
    consultorio_telefono: Optional[str] = None
    
    # Datos del usuario
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    
    # El primer usuario siempre es ADMIN del consultorio
    # role se asigna automáticamente


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema de respuesta de token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Datos contenidos en el token"""
    email: Optional[str] = None
    consultorio_id: Optional[int] = None
    role: Optional[RoleType] = None


class UserResponse(BaseModel):
    """Respuesta de usuario"""
    id: int
    consultorio_id: int
    first_name: str
    last_name: str
    email: str
    role: RoleType
    is_active: bool
    
    class Config:
        from_attributes = True
