---
tipo: bug
data: 2026-07-15
severidade: Média
status: Resolvido
---

# Health check documentado nunca existiu (`/api/v1/health` retornava 403)

## Sintoma
Endpoint de health check documentado (`/api/v1/health`) sempre retornava 403 — descoberto só numa auditoria de produção, não por monitoramento ativo.

## Causa raiz
O endpoint documentado simplesmente nunca foi implementado. O que existia era o `/actuator/health` padrão do Spring Boot Actuator, mas ele estava atrás da mesma regra de segurança dos endpoints autenticados.

## Solução
Exposto `/actuator/health` (retornando só status, sem detalhes internos) e liberado explicitamente no `SecurityConfiguration` como rota pública.

## Ligado a
- [[webhook-500-stacktrace-sem-body]]
