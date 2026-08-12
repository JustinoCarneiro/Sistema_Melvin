---
tipo: indice
---

# Memória Técnica — Sistema Melvin

Base de conhecimento viva do projeto: bugs cabeludos já resolvidos (com causa raiz) e decisões técnicas tomadas fora da spec original do [`CLAUDE.md`](../CLAUDE.md). Não documenta conceitos genéricos — só o que é específico deste projeto e não seria óbvio olhando só o código.

Piloto do padrão "memória técnica por projeto" da metodologia Onda-Dev (avaliado a partir do vídeo da Carol Tequita sobre Obsidian, jul/2026).

## Como usar
- **Antes de investigar um bug**, procurar em `bugs/` se algo parecido já foi resolvido.
- **Antes de tomar uma decisão de arquitetura**, procurar em `decisoes/` se já existe uma decisão relacionada (evita reabrir debate já resolvido ou contradizer uma decisão ativa).
- **Ao resolver um bug não-trivial** (que exigiu investigação real, causa raiz não óbvia a partir do código) ou **tomar uma decisão técnica fora da spec**, criar uma nota nova usando `templates/bug.md` ou `templates/decisao.md`, e linkar às notas relacionadas com a notação `[[nome-da-nota]]`.

## Bugs
- [[logout-automatico-privateroute-qualquer-falha]]
- [[webhook-stripe-404-prefixo-api-nginx]]
- [[cobranca-em-dobro-corrida-timeout-stripe]]
- [[heap-exhaustion-504-cronico]]
- [[health-check-403-endpoint-inexistente]]
- [[webhook-500-stacktrace-sem-body]]
- [[login-500-em-vez-de-401]]
- [[campo-novo-opcional-nao-persiste-nem-aceita-null]]
- [[rate-limit-burlavel-por-x-forwarded-for-forjado]]

## Decisões
- [[idempotencia-dedup-pagamentos-stripe]]
- [[cpf-obrigatorio-cifrado-blind-index]]
- [[radar-cep-nao-ativado]]
- [[backup-melvin-diario-criptografado]]
- [[rate-limit-apenas-solicitacao-cesta]]
- [[qr-code-removido-confirmacao-manual]]
