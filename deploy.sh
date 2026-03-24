#!/bin/bash

# --- script de deploy otimizado via docker ---

echo "🚀 Iniciando Deploy via Docker (Build Interno)..."

docker compose up -d --build --force-recreate --remove-orphans

echo "✅ Deploy finalizado com sucesso em $(date)"
