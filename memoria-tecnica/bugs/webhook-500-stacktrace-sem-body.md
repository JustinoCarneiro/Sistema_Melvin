---
tipo: bug
data: 2026-07-15
severidade: Média
status: Resolvido
---

# Webhook de pagamentos vazava 500 com stack trace quando request chegava sem corpo

## Sintoma
`PaymentWebhookController` retornava 500 (com stack trace exposto) em vez de um 400 controlado quando a requisição chegava sem `@RequestBody`.

## Causa raiz
`@RequestBody` era obrigatório na assinatura do método — qualquer chamada sem corpo (ex.: healthcheck externo, requisição malformada) quebrava antes de chegar no tratamento de erro já existente.

## Solução
`@RequestBody` tornado opcional; requisições sem corpo agora caem no tratamento 400 que já existia pra outros casos inválidos.

## Ligado a
- [[health-check-403-endpoint-inexistente]]
- [[login-500-em-vez-de-401]]
