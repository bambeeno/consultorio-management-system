"""
Utilidades para hash y verificación de passwords
"""
from passlib.context import CryptContext

# Contexto para hash de passwords con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash de password usando bcrypt
    
    ¿Qué hace?
    - Convierte "mipassword123" en algo como:
      "$2b$12$KIXn6..."
    - Es irreversible (no se puede obtener el password original)
    - Cada hash es único (mismo password → diferentes hashes)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si un password plano coincide con el hash
    
    ¿Qué hace?
    - Compara "mipassword123" con el hash guardado
    - Retorna True si coinciden, False si no
    """
    return pwd_context.verify(plain_password, hashed_password)
