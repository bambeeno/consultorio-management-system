"""
Router principal de la API v1
"""
from fastapi import APIRouter
from app.api.v1.endpoints import patients, auth

api_router = APIRouter()

# Incluir routers
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"]
)
