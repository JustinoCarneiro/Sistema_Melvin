#!/bin/bash

# --- script de desenvolvimento com HMR (Hot Module Replacement) ---

echo "🚀 Iniciando ambiente de DESENVOLVIMENTO (Frontend com Auto-Update)..."

# Garante que o frontend-dev consiga encontrar o backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --force-recreate

echo "✅ Ambiente de desenvolvimento pronto!"
echo "📺 Frontend (HMR): http://localhost:3001"
echo "⚙️ Backend API: http://localhost:8443"
echo "📝 As alterações no código do frontend serão aplicadas AUTOMATICAMENTE no navegador."
