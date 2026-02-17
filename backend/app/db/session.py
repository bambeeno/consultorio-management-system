"""
Dependency para obtener sesión de BD
"""
from typing import Generator
from app.db.base import SessionLocal


def get_db() -> Generator:
    """
    Dependency que provee una sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
