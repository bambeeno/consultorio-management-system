#!/bin/bash
# Script de inicio para producción

echo "===== Ejecutando migraciones ====="
alembic upgrade head

echo "===== Iniciando servidor ====="
# Asegurarse de estar en el directorio correcto
cd backend 2>/dev/null || true
gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
