---
tipo: bug
data: 2026-06-06
severidade: Crítica
status: Resolvido
---

# Webhook Stripe bloqueado por divergência de prefixo `/api/` no nginx

## Sintoma
Painel do Stripe mostrava `Error rate 100%` no webhook de pagamentos. Todos os doadores ficavam presos em `PENDING` — nenhum pagamento confirmado avançava pra `ACTIVE`, mesmo cobrando normalmente no Stripe.

## Causa raiz
O controller estava mapeado em `@RequestMapping("/api/v1/webhooks/payments")`, mas o **nginx faz `proxy_pass` removendo o prefixo `/api/`** antes de repassar pro backend — convenção que vale pra todos os outros endpoints do sistema. Só o webhook quebrou porque era o único chamado por uma URL externa (Stripe) que não passa pelo mesmo client HTTP interno. Resultado: Spring Security bloqueava com 403 porque a rota recebida (`/v1/webhooks/payments`) não batia com a rota mapeada.

## Solução
Mapeamento do controller alterado para `/v1/webhooks/payments` (o caminho que chega *depois* do nginx remover `/api/`). A URL cadastrada no Stripe continua sendo a pública, com `/api/`.

**Regra geral daqui pra frente:** qualquer endpoint acessado por um serviço externo (não pelo frontend via `http.js`) precisa considerar que o nginx tira o prefixo `/api/` — mapear pensando na rota *pós-nginx*, não na rota pública.

## Ligado a
- [[cobranca-em-dobro-corrida-timeout-stripe]]
- [[idempotencia-dedup-pagamentos-stripe]]
- Relatório completo do incidente: `../../docs/incidente-amigos-melvin-2026-06-06.md`
