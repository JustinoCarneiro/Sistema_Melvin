# TASK_ATUAL - PASSO 13.1: CORREÇÃO DE INFRAESTRUTURA DE LOGS

## OBJETIVO
Garantir a pré-existência dos diretórios e arquivos de log no ambiente Linux para evitar falhas de leitura no terminal (`tail -f`).

## ESCOPO DA ETAPA
1. **Refatoração de Script**: Atualizar o arquivo `sistema/scripts/watch_logs.sh` (ou criá-lo, caso não exista) para incluir comandos de segurança que geram a pasta e o arquivo vazios antes de tentar escutá-los.

## CRITÉRIOS DE ACEITE
- O script deve utilizar o comando `mkdir -p` para criar o diretório sem falhar se ele já existir.
- O comando `touch` deve ser usado para garantir que o arquivo `payments.log` exista antes do `tail -f`.
- O script deve manter a permissão de execução nativa do Linux (`chmod +x`).