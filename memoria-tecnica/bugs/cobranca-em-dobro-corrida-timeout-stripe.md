---
tipo: bug
data: 2026-06-06
severidade: Crítica
status: Resolvido
---

# Cobrança em dobro por timeout do nginx + falta de idempotência

## Sintoma
Doadora relatou erro genérico ao cadastrar cartão, mas o cadastro na verdade tinha sido concluído com sucesso no backend. Ela tentou de novo e acabou com dois cadastros + duas assinaturas ativas no Stripe (cobrada em dobro).

## Causa raiz
Cadeia de falhas, não um bug isolado:
1. Criação do cliente no Stripe demorou ~55s numa lentidão transitória.
2. O nginx não tinha `proxy_read_timeout` configurado → usou o default de 60s → devolveu 504 ao navegador antes do backend terminar.
3. O frontend mostrou erro, mas o backend concluiu e salvou o registro normalmente.
4. A doadora, vendo "erro", tentou de novo → segundo cadastro.
5. Nada impedia a duplicidade: sem idempotência no Stripe, sem checagem de duplicidade, sem constraint no banco.

## Solução
- `proxy_read_timeout 120s` no nginx.
- Chave de idempotência nas chamadas `createCustomer`/`createSubscription` do Stripe.
- Timeouts explícitos no SDK Stripe (connect 10s / read 20s) — falha rápido em vez de travar ~60s.
- Trava de duplo-submit no frontend (ignora cliques enquanto a 1ª requisição está em voo).
- Deduplicação por doador via blind index (ver [[idempotencia-dedup-pagamentos-stripe]]).

## Ligado a
- [[webhook-stripe-404-prefixo-api-nginx]]
- [[idempotencia-dedup-pagamentos-stripe]]
- Relatório completo do incidente: `../../docs/incidente-amigos-melvin-2026-06-06.md`
