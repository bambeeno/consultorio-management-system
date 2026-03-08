"""
Endpoints de autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.repositories.user_repository import UserRepository
from app.repositories.consultorio_repository import ConsultorioRepository
from app.core.security.password import verify_password
from app.core.security.jwt import create_access_token, create_refresh_token, verify_token
from app.models.user import RoleType
# Import necesario al inicio del archivo
from app.core.dependencies.auth import get_current_user
from app.models.user import User


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo consultorio + primer usuario (Admin)
    
    ¿Qué hace?
    1. Verifica que el email no exista
    2. Crea el consultorio con trial de 30 días
    3. Crea el primer usuario como ADMIN del consultorio
    4. Retorna el usuario creado
    
    Ejemplo de uso:
    POST /auth/register
    {
    "consultorio_nombre": "Clínica Dental López",
    "consultorio_email": "contacto@dentallopez.com",
    "consultorio_telefono": "+595981234567",
    "first_name": "Juan",
    "last_name": "López",
    "email": "juan@dentallopez.com",
    "password": "MiPassword123!"
    }
    """
    user_repo = UserRepository(db)
    consultorio_repo = ConsultorioRepository(db)
    
    # 1. Verificar que el email no exista
    existing_user = user_repo.get_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 2. Crear el consultorio
    consultorio = consultorio_repo.create({
        "nombre": user_data.consultorio_nombre,
        "email": user_data.consultorio_email,
        "telefono": user_data.consultorio_telefono,
    })
    
    # 3. Crear el primer usuario como ADMIN
    user = user_repo.create(
        user_data={
            "consultorio_id": consultorio.id,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "role": RoleType.ADMIN,  # Primer usuario siempre es admin
            "is_active": True,
            "is_verified": True,  # Auto-verificado por ahora
        },
        password=user_data.password
    )
    
    return user


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login de usuario
    
    ¿Qué hace?
    1. Busca el usuario por email
    2. Verifica el password
    3. Verifica que el consultorio esté activo
    4. Genera tokens JWT (access + refresh)
    5. Actualiza last_login
    6. Retorna los tokens
    
    Ejemplo de uso:
    POST /auth/login
    {
    "email": "juan@dentallopez.com",
    "password": "MiPassword123!"
    }
    
    Respuesta:
    {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer"
    }
    """
    user_repo = UserRepository(db)
    consultorio_repo = ConsultorioRepository(db)
    
    # 1. Buscar usuario por email
    user = user_repo.get_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # 2. Verificar password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # 3. Verificar que el usuario esté activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # 4. Verificar que el consultorio esté activo
    if not consultorio_repo.is_active(user.consultorio_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subscription expired or inactive"
        )
    
    # 5. Generar tokens
    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "consultorio_id": user.consultorio_id,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # 6. Actualizar last_login
    user_repo.update_last_login(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Obtener nuevo access token usando refresh token
    
    ¿Qué hace?
    1. Verifica el refresh token
    2. Extrae los datos del usuario
    3. Genera un nuevo access token
    4. Retorna el nuevo access token (mismo refresh token)
    
    Uso: Cuando el access token expira (15 min), usar este endpoint
    para obtener uno nuevo sin pedir password de nuevo.
    """
    # 1. Verificar refresh token
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # 2. Extraer datos
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # 3. Verificar que el usuario aún exista y esté activo
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # 4. Generar nuevo access token
    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "consultorio_id": user.consultorio_id,
        "role": user.role.value
    }
    
    new_access_token = create_access_token(token_data)
    
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,  # Mismo refresh token
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Obtener información del usuario actual
    
    ¿Qué hace?
    - Retorna los datos del usuario autenticado
    
    Uso: El frontend llama a este endpoint para saber quién está logueado
    
    Ejemplo:
    GET /auth/me
    Headers: Authorization: Bearer eyJhbGc...
    
    Respuesta:
    {
    "id": 1,
    "consultorio_id": 1,
    "first_name": "Juan",
    "last_name": "López",
    "email": "juan@dentallopez.com",
    "role": "admin",
    "is_active": true
    }
    """
    return current_user


