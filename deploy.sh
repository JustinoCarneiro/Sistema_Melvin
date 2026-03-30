#!/bin/bash
# --- script de deploy local/servidor ---

echo "🚀 Iniciando DEPLOY do Sistema Melvin..."

# Tenta parar o postgres local para não dar conflito de porta (apenas se rodando local)
if command -v service &> /dev/null; then
    sudo service postgresql stop 2>/dev/null || true
fi

# Constrói as imagens e sobe os containers
docker compose up -d --build --force-recreate --remove-orphans

echo "✅ Deploy finalizado com sucesso!"
echo "📺 Frontend: http://localhost:3000 (ou porta configurada)"
echo "⚙️ Backend API: http://localhost:8443 (ou porta configurada)"
