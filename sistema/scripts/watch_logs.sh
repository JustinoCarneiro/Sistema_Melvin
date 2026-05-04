#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  watch_logs.sh — Visualizador seguro de logs do motor financeiro ║
# ║  Uso (a partir da raiz do projeto):                              ║
# ║  ./sistema/scripts/watch_logs.sh                                 ║
# ╚══════════════════════════════════════════════════════════════════╝

CYAN='\033[0;36m'
NC='\033[0m'

# 1. Garante que o diretório exista sem falhar caso já exista
mkdir -p sistema/logs

# 2. Garante que o arquivo exista para que o tail não falhe
touch sistema/logs/payments.log

# 3. Exibe mensagem de inicialização colorida
echo -e "${CYAN}Iniciando streaming de logs financeiros...${NC}"

# 4. Inicia a escuta dos logs
tail -f sistema/logs/payments.log
