#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  verify_setup.sh — Verificação de ambiente para Stripe + DB    ║
# ║  Uso: ./sistema/scripts/verify_setup.sh                        ║
# ╚══════════════════════════════════════════════════════════════════╝

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check() {
    local label="$1"
    local result="$2"
    if [ "$result" -eq 0 ]; then
        echo -e "  ${GREEN}✔${NC} $label"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}✘${NC} $label"
        FAIL=$((FAIL + 1))
    fi
}

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Sistema Melvin — Verificação de Setup (Stripe + DB)     ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Variáveis de Ambiente ─────────────────────────────────────
echo -e "${YELLOW}[1/3] Variáveis de Ambiente${NC}"

# Tenta carregar .env se existir (para quem roda fora do Docker)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env" 2>/dev/null || true
    set +a
fi

if [ -n "${STRIPE_API_KEY:-}" ]; then
    # Valida que começa com sk_test_ ou sk_live_
    if echo "$STRIPE_API_KEY" | grep -qE '^sk_(test|live)_'; then
        check "STRIPE_API_KEY exportada e com prefixo válido (${STRIPE_API_KEY:0:12}...)" 0
    else
        check "STRIPE_API_KEY exportada mas com prefixo INVÁLIDO (esperado: sk_test_* ou sk_live_*)" 1
    fi
else
    check "STRIPE_API_KEY não encontrada no ambiente nem no .env" 1
fi

if [ -n "${STRIPE_WEBHOOK_SECRET:-}" ]; then
    if echo "$STRIPE_WEBHOOK_SECRET" | grep -qE '^whsec_'; then
        check "STRIPE_WEBHOOK_SECRET exportada e com prefixo válido (${STRIPE_WEBHOOK_SECRET:0:10}...)" 0
    else
        check "STRIPE_WEBHOOK_SECRET exportada mas com prefixo INVÁLIDO (esperado: whsec_*)" 1
    fi
else
    check "STRIPE_WEBHOOK_SECRET não encontrada no ambiente nem no .env" 1
fi

# Verificações adicionais opcionais
if [ -n "${STRIPE_PRICE_ID:-}" ]; then
    check "STRIPE_PRICE_ID configurado ($STRIPE_PRICE_ID)" 0
else
    echo -e "  ${YELLOW}⚠${NC}  STRIPE_PRICE_ID não configurado (será usado valor dummy: price_dummy)"
fi

echo ""

# ─── 2. Conectividade com PostgreSQL ─────────────────────────────
echo -e "${YELLOW}[2/3] Conectividade com PostgreSQL${NC}"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if command -v nc &>/dev/null; then
    if nc -zv "$DB_HOST" "$DB_PORT" 2>&1 | grep -qiE "(succeeded|open|connected)"; then
        check "PostgreSQL acessível em $DB_HOST:$DB_PORT" 0
    else
        check "PostgreSQL INACESSÍVEL em $DB_HOST:$DB_PORT (verifique se o container está rodando)" 1
    fi
elif command -v pg_isready &>/dev/null; then
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" &>/dev/null; then
        check "PostgreSQL acessível em $DB_HOST:$DB_PORT (via pg_isready)" 0
    else
        check "PostgreSQL INACESSÍVEL em $DB_HOST:$DB_PORT" 1
    fi
else
    echo -e "  ${YELLOW}⚠${NC}  Nem 'nc' nem 'pg_isready' encontrados. Instale com: sudo apt install netcat-openbsd"
    FAIL=$((FAIL + 1))
fi

echo ""

# ─── 3. Stripe CLI ───────────────────────────────────────────────
echo -e "${YELLOW}[3/3] Stripe CLI${NC}"

BACKEND_PORT="${BACKEND_PORT:-8443}"
WEBHOOK_ENDPOINT="http://localhost:${BACKEND_PORT}/api/v1/webhooks/payments"

if command -v stripe &>/dev/null; then
    STRIPE_VERSION=$(stripe version 2>/dev/null || echo "desconhecida")
    check "Stripe CLI instalado (versão: $STRIPE_VERSION)" 0
else
    check "Stripe CLI NÃO encontrado. Instale em: https://stripe.com/docs/stripe-cli" 1
fi

echo ""
echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}  Comando para iniciar escuta de Webhooks:${NC}"
echo ""
echo -e "  ${GREEN}stripe listen --forward-to ${WEBHOOK_ENDPOINT}${NC}"
echo ""
echo -e "${CYAN}  Para simular um pagamento aprovado:${NC}"
echo ""
echo -e "  ${GREEN}stripe trigger invoice.paid${NC}"
echo ""
echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"

# ─── Resultado Final ─────────────────────────────────────────────
echo ""
TOTAL=$((PASS + FAIL))
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}  ✅ RESULTADO: $PASS/$TOTAL verificações passaram. Ambiente PRONTO.${NC}"
else
    echo -e "${RED}  ❌ RESULTADO: $PASS/$TOTAL verificações passaram. $FAIL falha(s) detectada(s).${NC}"
fi
echo ""

exit "$FAIL"
