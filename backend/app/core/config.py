"""
Configuración de la aplicación usando pydantic-settings
"""
from typing import List, Union
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # App
    APP_NAME: str = "ClinicPro API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./consultorio.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = []
    
    @property
    def cors_origins(self) -> List[str]:
        """Convertir BACKEND_CORS_ORIGINS a lista si es string"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.strip("[]").replace('"', '').split(",")]
        return self.BACKEND_CORS_ORIGINS
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
