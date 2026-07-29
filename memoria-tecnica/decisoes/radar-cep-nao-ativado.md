---
tipo: decisao
data: 2026-07-15
status: Ativa
---

# Regra de Radar (antifraude) por CEP não ativada no Stripe

## Contexto
Configuração operacional do Stripe Radar durante o checklist de deploy — regra de bloqueio por falha de verificação de CEP (Postal Code) estava disponível pra ativar.

## Decisão
Não ativada. O formulário de doação usa `hidePostalCode: true` no Stripe Elements ([`CadastroAmigo/index.jsx`](../../frontend/src/app/site/pages/CadastroAmigo/index.jsx)) e nunca coleta o campo — a regra ficaria sempre inerte (nunca dispara).

## Consequências
Só faz sentido reavaliar essa regra **se o formulário passar a coletar CEP**. Até lá, não reativar/investigar essa configuração achando que está faltando algo — é intencional.
