"""
Utilidades para hash y verificación de passwords
"""
import bcrypt


def hash_password(password: str) -> str:
    """
    Hash de password usando bcrypt directamente
    """
    # Truncar a 72 caracteres (límite de bcrypt)
    password_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si un password plano coincide con el hash
    """
    # Truncar a 72 caracteres
    password_bytes = plain_password[:72].encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
