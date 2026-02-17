"""
Router principal API v1
"""
from fastapi import APIRouter
from app.api.v1.endpoints import patients

api_router = APIRouter()

# Incluir routers de cada módulo
api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"]
)
