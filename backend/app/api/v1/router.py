"""
Router principal de la API v1
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, appointments, medical_records

api_router = APIRouter()

# Rutas de autenticación
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Rutas de pacientes
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])

# Rutas de turnos
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])

# Rutas de historias clínicas
api_router.include_router(medical_records.router, prefix="/medical-records", tags=["medical-records"])
