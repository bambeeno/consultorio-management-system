#!/bin/bash
# Script de inicio para producción

echo "===== Ejecutando migraciones ====="
cd /opt/render/project/src/backend
alembic upgrade head

echo "===== Iniciando servidor ====="
cd /opt/render/project/src
gunicorn backend.app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
