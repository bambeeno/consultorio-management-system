"""
Repository para operaciones de User
"""
from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security.password import hash_password


class UserRepository:
    """Repositorio de operaciones con User"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Obtener usuario por email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Obtener usuario por ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, user_data: dict, password: str) -> User:
        """
        Crear nuevo usuario
        
        ¿Qué hace?
        - Hashea el password
        - Crea el usuario en la BD
        - Retorna el usuario creado
        """
        user = User(
            **user_data,
            password_hash=hash_password(password)
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_last_login(self, user_id: int):
        """Actualizar fecha de último login"""
        from datetime import datetime
        user = self.get_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            self.db.commit()
