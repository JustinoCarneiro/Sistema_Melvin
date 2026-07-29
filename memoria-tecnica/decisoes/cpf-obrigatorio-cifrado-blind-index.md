---
tipo: decisao
data: 2026-06-06
status: Ativa
---

# CPF obrigatório no cadastro de doador, cifrado com blind index para dedup

## Contexto
Pós-incidente de duplicidade de doadores ([[cobranca-em-dobro-corrida-timeout-stripe]]), a identidade do doador precisava de um identificador confiável para deduplicação — e-mail sozinho não bastava e não podia ficar em texto plano (LGPD).

## Decisão
CPF passou a ser obrigatório no cadastro (validado via `@CPF`), armazenado cifrado em repouso (AES-256-GCM) e normalizado no formato `xxx.xxx.xxx-xx`. Para permitir busca/deduplicação sem expor o dado, é mantido um **blind index HMAC** calculado sobre os dígitos (mesma técnica já usada pro e-mail).

## Consequências
- Deduplicação por CPF: mesmo CPF + mesmo valor de assinatura → bloqueia (409); mesmo CPF + valor diferente → atualiza a assinatura existente no Stripe em vez de criar nova.
- Qualquer novo campo que precise ser único-mas-cifrado (não só CPF/e-mail) deve seguir o mesmo padrão de blind index em vez de tentar índice direto no valor cifrado.

## Ligado a
- [[idempotencia-dedup-pagamentos-stripe]]
