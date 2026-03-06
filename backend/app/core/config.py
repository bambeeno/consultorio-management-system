"""
Configuración de la aplicación
"""
from tkinter import E

from pydantic_settings import BaseSettings
from typing import List, Union
import json


class Settings(BaseSettings):
    """Configuración general de la aplicación"""
    
    APP_NAME: str = "ClinicPro API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Puede ser string o lista
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "[]"
    
    @property
    def cors_origins(self) -> List[str]:
        """Convierte BACKEND_CORS_ORIGINS a lista si es string"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                return json.loads(self.BACKEND_CORS_ORIGINS)
            except Exception:
                return [self.BACKEND_CORS_ORIGINS]
        return self.BACKEND_CORS_ORIGINS
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
