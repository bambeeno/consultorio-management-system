"""
Utilidades para hash y verificación de passwords
"""
from passlib.context import CryptContext

# Contexto para hash de passwords con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash de password usando bcrypt
    
    IMPORTANTE: Bcrypt tiene límite de 72 bytes.
    Truncamos a 72 caracteres para evitar errores.
    """
    # Truncar a 72 caracteres (límite de bcrypt)
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si un password plano coincide con el hash
    """
    # Truncar a 72 caracteres (debe coincidir con hash_password)
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)
