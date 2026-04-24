#!/bin/bash
# --- script de deploy para Produção ---

# Se passar o argumento 'remote', faz a transferência e executa no servidor
if [ "$1" == "remote" ]; then
    SERVER_IP="157.173.212.76"
    SERVER_USER="root"
    SERVER_PATH="~/sistema/sistema_melvin/"

    echo "📡 Transferindo arquivos para o servidor ($SERVER_IP)..."
    rsync -avz --delete --exclude 'node_modules' --exclude 'target' --exclude 'dist' --exclude '.git' --exclude 'backups' \
    ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH

    if [ $? -ne 0 ]; then
        echo "❌ Erro na transferência via RSYNC!"
        exit 1
    fi

    echo "🚀 Rodando o script de deploy no servidor remoto..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && chmod +x deploy.sh && ./deploy.sh"
    echo "✨ Processo remoto concluído com sucesso!"
    exit 0
fi

echo "🚀 Iniciando DEPLOY local de PRODUÇÃO..."

# Tenta parar o postgres local para não dar conflito de porta
if command -v service &> /dev/null; then
    sudo service postgresql stop 2>/dev/null || true
fi

# Constrói as imagens e sobe os containers em modo detach
docker compose up -d --build --force-recreate --remove-orphans

echo "✅ Deploy finalizado com sucesso!"
echo "📺 Frontend: http://localhost:3000"
echo "⚙️ Backend API: http://localhost:8443"
