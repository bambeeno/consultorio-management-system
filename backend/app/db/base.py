"""
Import all models here to ensure they are registered with SQLAlchemy
"""
from app.db.session import Base
from app.models.consultorio import Consultorio
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment

# Export Base for Alembic
__all__ = ["Base"]
