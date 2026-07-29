---
tipo: decisao
data: 2026-06-06
status: Ativa
---

# Idempotência + deduplicação como padrão em todo fluxo de pagamento

## Contexto
O incidente de [[cobranca-em-dobro-corrida-timeout-stripe]] mostrou que qualquer chamada ao Stripe sem proteção de reenvio pode duplicar cobrança quando o cliente (frontend ou usuário) tenta de novo após um timeout aparente.

## Decisão
Todo fluxo de criação de cobrança/assinatura no Stripe usa:
- Chave de idempotência nas chamadas `createCustomer`/`createSubscription`, mais timeouts explícitos no SDK (connect/read) — reenvio de rede nunca duplica a chamada nem trava esperando indefinidamente.
- Deduplicação do lado do sistema *antes* de chamar o Stripe (não depois) — a regra de negócio exata (quando bloqueia com 409 vs. quando atualiza) está em [[cpf-obrigatorio-cifrado-blind-index]], que também explica o mecanismo de blind index HMAC usado pra buscar um dado cifrado sem descriptografar.

## Consequências
Qualquer novo fluxo de cobrança criado no sistema precisa seguir o mesmo padrão (idempotência + blind index) antes de chamar a API do Stripe — não reintroduzir uma chamada "direta" sem essa camada.

## Ligado a
- [[webhook-stripe-404-prefixo-api-nginx]]
- [[cpf-obrigatorio-cifrado-blind-index]]
