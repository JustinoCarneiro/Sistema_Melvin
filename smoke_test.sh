#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# smoke_test.sh — Teste de Fumaça Local (Fase 5 — Metodologia Onda-Dev)
# Executa validação completa antes do deploy para produção.
# ═══════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0

log_step() {
    echo -e "\n${CYAN}━━━ $1 ━━━${NC}"
}

log_pass() {
    echo -e "  ${GREEN}✅ $1${NC}"
    PASS=$((PASS + 1))
}

log_fail() {
    echo -e "  ${RED}❌ $1${NC}"
    FAIL=$((FAIL + 1))
}

log_warn() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║  🔥 SMOKE TEST — Sistema Melvin (Onda-Dev)      ║"
echo "║  Fase 5: Homologação Pré-Deploy                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. VERIFICAÇÃO DE AMBIENTE ───
log_step "1/5 — Verificação de Ambiente"

if [ -f ".env" ]; then
    log_pass "Arquivo .env encontrado"
else
    log_fail "Arquivo .env NÃO encontrado"
fi

if command -v docker &> /dev/null; then
    log_pass "Docker instalado ($(docker --version | cut -d' ' -f3 | tr -d ','))"
else
    log_fail "Docker NÃO instalado"
    exit 1
fi

if [ -f "CLAUDE.md" ]; then
    log_pass "CLAUDE.md (Spec Viva) presente"
else
    log_fail "CLAUDE.md ausente — Fase 1 incompleta"
fi

if [ -f "ROADMAP.md" ]; then
    log_pass "ROADMAP.md (Blueprint) presente"
else
    log_fail "ROADMAP.md ausente — Fase 3 incompleta"
fi

# ─── 2. TESTES BACKEND (JUnit 5 + Mockito) ───
log_step "2/5 — Testes Backend (JUnit 5)"

if [ -f "sistema/mvnw" ]; then
    cd sistema
    if ./mvnw test --batch-mode --no-transfer-progress -q 2>&1 | tail -5; then
        log_pass "Testes backend passaram"
    else
        log_fail "Testes backend FALHARAM"
    fi
    cd ..
else
    log_warn "mvnw não encontrado — pulando testes backend"
fi

# ─── 3. BUILD DO FRONTEND ───
log_step "3/5 — Build Frontend (Vite)"

if [ -f "frontend/package.json" ]; then
    cd frontend
    if npm run build --silent 2>&1 | tail -3; then
        log_pass "Build do frontend bem-sucedido"
    else
        log_fail "Build do frontend FALHOU"
    fi
    cd ..
else
    log_warn "package.json do frontend não encontrado"
fi

# ─── 4. VALIDAÇÃO DO DOCKER COMPOSE ───
log_step "4/5 — Validação Docker Compose"

if docker compose config -q 2>/dev/null; then
    log_pass "docker-compose.yml é válido"
else
    log_fail "docker-compose.yml contém erros de sintaxe"
fi

# ─── 5. VERIFICAÇÃO DE SEGURANÇA ───
log_step "5/5 — Verificação de Segurança"

if [ -f ".env" ]; then
    # Verifica se chaves de teste não estão em produção
    if grep -q "sk_test_" .env 2>/dev/null; then
        log_warn "Chave Stripe de TESTE detectada no .env (aceitável em dev)"
    fi

    if grep -q "JWT_SECRET" .env 2>/dev/null; then
        log_pass "JWT_SECRET configurada"
    else
        log_fail "JWT_SECRET não encontrada no .env"
    fi

    if grep -q "STRIPE_WEBHOOK_SECRET" .env 2>/dev/null; then
        log_pass "STRIPE_WEBHOOK_SECRET configurada"
    else
        log_fail "STRIPE_WEBHOOK_SECRET não encontrada no .env"
    fi
fi

# Verifica se segredos não estão hardcoded no código
HARDCODED=$(grep -r "sk_live_\|sk_test_\|whsec_" sistema/src/ 2>/dev/null | grep -v "target/" | grep -v ".class" || true)
if [ -z "$HARDCODED" ]; then
    log_pass "Nenhum segredo hardcoded no código backend"
else
    log_fail "Segredos potencialmente hardcoded detectados!"
    echo "$HARDCODED"
fi

# ─── RESULTADO FINAL ───
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  RESULTADO: ${GREEN}${PASS} passaram${NC}  |  ${RED}${FAIL} falharam${NC}             ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

if [ $FAIL -gt 0 ]; then
    echo -e "\n${RED}⛔ Smoke test FALHOU. Corrija os problemas antes do deploy.${NC}"
    exit 1
else
    echo -e "\n${GREEN}🚀 Smoke test APROVADO. Sistema pronto para deploy.${NC}"
    exit 0
fi
