"""
Utilidades para generación y verificación de JWT tokens
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from app.core.config import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un JWT access token
    
    ¿Qué hace?
    - Recibe data (ej: {"sub": "user@email.com", "consultorio_id": 1, "role": "admin"})
    - Agrega expiración (15 minutos por defecto)
    - Firma el token con SECRET_KEY
    - Retorna el token firmado
    
    Ejemplo de token generado:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi..."
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    
    to_encode["exp"] = expire

    return jwt.encode(
+        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crea un JWT refresh token
    
    ¿Qué hace?
    - Similar al access token pero dura más (7 días)
    - Se usa para obtener nuevos access tokens sin pedir password
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)

    to_encode["exp"] = expire
    
    return jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica y decodifica un JWT token
    
    ¿Qué hace?
    - Recibe el token
    - Verifica la firma (que no fue modificado)
    - Verifica que no expiró
    - Retorna los datos del token o None si es inválido
    """
    try:
        return jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        return None
