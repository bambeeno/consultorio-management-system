"""
Configuración de la aplicación
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Configuración general de la aplicación"""
    
    APP_NAME: str = "ClinicPro API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False  # False en producción
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Permitir frontend en producción
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        # Agregamos tu dominio de Vercel después del deploy
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
