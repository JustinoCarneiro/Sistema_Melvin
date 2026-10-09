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

    if ! git diff --quiet HEAD --; then
        echo "❌ Há alterações em arquivos versionados. Faça commit antes do deploy."
        exit 1
    fi
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo "❌ Há arquivos locais não versionados. Revise o checkout antes do deploy."
        exit 1
    fi
    MANIFEST=$(mktemp)
    trap 'rm -f "$MANIFEST"' EXIT
    git ls-files -z > "$MANIFEST"
    if [ ! -s "$MANIFEST" ]; then
        echo "❌ Manifesto Git vazio. Abortando deploy."
        exit 1
    fi
    echo "📦 Revisão do commit $(git rev-parse --short HEAD): somente arquivos versionados serão enviados."

    echo "📡 Executando backup remoto antes do deploy..."
    ssh $SERVER_USER@$SERVER_IP "/root/scripts/backup_postgres.sh"

    RSYNC_OPTIONS=(-avz --checksum --no-times --no-perms --no-owner --no-group
        --exclude 'sistema/logs'
        --exclude '.env*'
        --exclude 'keystore.p12'
        --exclude 'node_modules'
        --exclude 'target'
        --exclude 'dist'
        --exclude '.git'
        --exclude 'backups'
        --exclude 'scripts/trello_sync.py'
        --exclude '.agents/rules/'
        --exclude '.claude/settings.local.json'
        --exclude '.obsidian/'
        --exclude 'frontend/test-results/'
        --exclude 'frontend/playwright-report/'
        --exclude 'frontend/playwright/.cache/'
        --exclude '__pycache__/'
        --exclude '*.pyc')
    TARGET="$SERVER_USER@$SERVER_IP:$SERVER_PATH"

    echo "📡 Verificando arquivos remotos obsoletos via dry-run..."
    if ! DELETE_SCAN=$(rsync "${RSYNC_OPTIONS[@]}" --dry-run --delete ./ "$TARGET"); then
        echo "❌ Falha na verificação de exclusões do RSYNC. Abortando deploy."
        exit 1
    fi
    DELETION_COUNT=$(printf '%s\n' "$DELETE_SCAN" | grep -c '^deleting ' || true)

    if [ "$DELETION_COUNT" -gt 0 ]; then
        echo "⚠️  $DELETION_COUNT exclusão(ões) inesperada(s) detectada(s)."
        echo "Abortando deploy. Se as exclusões forem esperadas, ajuste o script."
        exit 1
    fi

    echo "📡 Conferindo conteúdo versionado via dry-run..."
    if ! DRY_RUN_OUTPUT=$(rsync "${RSYNC_OPTIONS[@]}" --from0 --files-from="$MANIFEST" --dry-run ./ "$TARGET"); then
        echo "❌ Falha no dry-run do RSYNC. Abortando deploy."
        exit 1
    fi
    printf '%s\n' "$DRY_RUN_OUTPUT"
    if ! git diff --quiet HEAD --; then
        echo "❌ Arquivos versionados mudaram após o dry-run. Abortando deploy."
        exit 1
    fi

    echo "📡 Transferindo arquivos para o servidor ($SERVER_IP)..."
    if ! rsync "${RSYNC_OPTIONS[@]}" --from0 --files-from="$MANIFEST" ./ "$TARGET"; then
        echo "❌ Erro na transferência via RSYNC!"
        exit 1
    fi

    echo "🚀 Rodando o script de deploy no servidor remoto..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && chmod +x deploy.sh && ./deploy.sh"
    echo "✨ Processo remoto concluído com sucesso!"
    exit 0
fi

echo "🚀 Iniciando DEPLOY local de PRODUÇÃO..."

# O banco precisa estar de pé; --no-deps impede sua recriação por dependência.
if [ "$(docker inspect --format '{{.State.Running}}' postgresdb 2>/dev/null)" != "true" ]; then
    echo "❌ PostgreSQL não está em execução. Abortando sem recriar o banco."
    exit 1
fi

docker compose up -d --no-deps --build backend frontend

READY=false
for ((attempt=1; attempt<=30; attempt++)); do
    if curl -fs -o /dev/null --max-time 3 http://127.0.0.1:8443/actuator/health && \
       curl -fs -o /dev/null --max-time 3 http://127.0.0.1:3000/; then
        READY=true
        break
    fi
    sleep 2
done
if [ "$READY" != true ]; then
    echo "❌ API ou frontend não respondeu após o deploy. Verifique os containers."
    exit 1
fi

echo "✅ Deploy finalizado com sucesso!"
echo "📺 Frontend: http://localhost:3000"
echo "⚙️ Backend API: http://localhost:8443"
