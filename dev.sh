#!/bin/bash
# --- script de desenvolvimento com HMR (Hot Module Replacement) ---

echo "🚀 Iniciando ambiente de DESENVOLVIMENTO (Frontend com Auto-Update)..."

# Tenta parar o postgres local para não dar conflito de porta
if command -v service &> /dev/null; then
    sudo service postgresql stop 2>/dev/null || true
fi

# Sobe os containers com HMR (Frontend mapeia a pasta src)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build --force-recreate --remove-orphans

echo "✅ Ambiente de desenvolvimento pronto!"
echo "📺 Frontend (HMR): http://localhost:3001"
echo "⚙️ Backend API: http://localhost:8443"
echo "📝 As alterações no código do frontend serão aplicadas AUTOMATICAMENTE no navegador."
