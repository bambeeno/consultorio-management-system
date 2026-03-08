"""
Dependencies para autenticación
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.security.jwt import verify_token
from app.repositories.user_repository import UserRepository
from app.models.user import User, RoleType


# Security scheme para Swagger
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtener el usuario actual desde el JWT token
    
    ¿Qué hace?
    1. Extrae el token del header Authorization
    2. Verifica y decodifica el token
    3. Busca el usuario en la BD
    4. Retorna el usuario
    
    Uso en endpoints:
    
    @router.get("/me")
    def get_me(current_user: User = Depends(get_current_user)):
        return current_user
    """
    

    

    # 1. Extraer token del header
    token = credentials.credentials
    
    # 2. Verificar token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Extraer email del token
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 4. Buscar usuario en BD
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verificar que el usuario esté activo
    (Aunque get_current_user ya lo verifica, esto es por si acaso queremos usarlo en otro contexto sin esa verificación)
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(required_role: RoleType):
    """
    Dependency para verificar que el usuario tenga un rol específico
    
    #Uso:
    @router.get("/admin-only")
    def admin_endpoint(user: User = Depends(require_role(RoleType.ADMIN))):
        return {"message": "Solo admins ven esto"}
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role.value} role"
            )
        return current_user
    
    return role_checker


def require_any_role(*roles: RoleType):
    """

    Dependency para verificar que el usuario tenga uno de varios roles
    
    @router.get("/staff-only")
    def staff_endpoint(
        user: User = Depends(require_any_role(RoleType.ADMIN, RoleType.DOCTOR))
    ):
        return {"message": "Admins y doctores ven esto"}
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {[r.value for r in roles]}"
            )
        return current_user
    
    return role_checker
