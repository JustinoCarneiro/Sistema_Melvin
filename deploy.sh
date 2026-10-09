#!/bin/bash
# --- script de deploy para Produção ---
set -euo pipefail

# Se passar o argumento 'remote', faz a transferência e executa no servidor
if [ "${1:-}" == "remote" ]; then
    SERVER_IP="157.173.212.76"
    SERVER_USER="root"
    SERVER_PATH="~/sistema/sistema_melvin/"

    echo "🔍 Rodando smoke test antes de qualquer alteração remota..."
    ./smoke_test.sh

    echo "📡 Executando backup remoto antes do deploy..."
    ssh $SERVER_USER@$SERVER_IP "/root/scripts/backup_postgres.sh"

    echo "📡 Verificando exclusões via dry-run..."
    if ! DRY_RUN_OUTPUT=$(rsync -avz --checksum --dry-run --delete \
        --exclude 'sistema/logs' \
        --exclude '.env*' \
        --exclude 'keystore.p12' \
        --exclude 'node_modules' \
        --exclude 'target' \
        --exclude 'dist' \
        --exclude '.git' \
        --exclude 'backups' \
        --exclude 'scripts/trello_sync.py' \
        --exclude '.agents/rules/' \
        --exclude '.claude/settings.local.json' \
        --exclude '.obsidian/' \
        --exclude 'frontend/test-results/' \
        --exclude 'frontend/playwright-report/' \
        --exclude 'frontend/playwright/.cache/' \
        --exclude '__pycache__/' \
        --exclude '*.pyc' \
        ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH); then
        echo "❌ Falha no dry-run do RSYNC. Abortando deploy."
        exit 1
    fi
    DELETION_COUNT=$(printf '%s\n' "$DRY_RUN_OUTPUT" | grep -c '^deleting ' || true)

    if [ "$DELETION_COUNT" -gt 0 ]; then
        echo "⚠️  $DELETION_COUNT exclusão(ões) inesperada(s) detectada(s)."
        echo "Abortando deploy. Se as exclusões forem esperadas, ajuste o script."
        exit 1
    fi

    echo "📡 Transferindo arquivos para o servidor ($SERVER_IP)..."
    if ! rsync -avz --checksum --delete \
        --exclude 'sistema/logs' \
        --exclude '.env*' \
        --exclude 'keystore.p12' \
        --exclude 'node_modules' \
        --exclude 'target' \
        --exclude 'dist' \
        --exclude '.git' \
        --exclude 'backups' \
        --exclude 'scripts/trello_sync.py' \
        --exclude '.agents/rules/' \
        --exclude '.claude/settings.local.json' \
        --exclude '.obsidian/' \
        --exclude 'frontend/test-results/' \
        --exclude 'frontend/playwright-report/' \
        --exclude 'frontend/playwright/.cache/' \
        --exclude '__pycache__/' \
        --exclude '*.pyc' \
        ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH; then
        echo "❌ Erro na transferência via RSYNC!"
        exit 1
    fi

    echo "🚀 Rodando o script de deploy no servidor remoto..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && chmod +x deploy.sh && ./deploy.sh"
    echo "✨ Processo remoto concluído com sucesso!"
    exit 0
fi

echo "🚀 Iniciando DEPLOY local de PRODUÇÃO..."

# Constrói as imagens e sobe os containers em modo detach
docker compose up -d --build backend frontend

echo "✅ Deploy finalizado com sucesso!"
echo "📺 Frontend: http://localhost:3000"
echo "⚙️ Backend API: http://localhost:8443"
