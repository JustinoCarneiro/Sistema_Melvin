---
tipo: decisao
data: 2026-08-10
status: Ativa
---

# Rate limit só no link público de solicitação de cesta (não no sistema todo)

## Contexto
A US-7.4 introduziu `POST /cestas/solicitacao`, um endpoint `permitAll` que qualquer líder da
igreja acessa por link, sem cadastro prévio. Diferente dos demais endpoints públicos do sistema
(`/amigomelvin/**`, `/embaixador`, `/frequenciavoluntario`), este **dispara um fluxo de trabalho
interno**: cada submissão vira uma solicitação que a coordenação precisa avaliar e agendar.

Levantamento feito durante a especificação: **nenhum** endpoint público do sistema tinha qualquer
proteção antiabuso — sem rate limit, sem captcha, nenhuma dependência do tipo no `pom.xml`
(confirmado por grep de "RateLimit", "Captcha", "Bucket4j"). Ou seja, um bot poderia inundar a
fila de validação da coordenação desde o primeiro dia do link no ar.

Decisão levada ao usuário (Justino) em 10/08/2026, que optou por adicionar a proteção agora em vez
de lançar sem e revisitar depois.

## Decisão
Rate limit **escopo cirúrgico**: só `POST /cestas/solicitacao`, via
`CestasSolicitacaoRateLimitFilter` (Bucket4j 8.19.0, `bucket4j_jdk17-core`).

- **5 solicitações por hora por IP**, refill intervalado (não gota-a-gota) — o líder consegue
  corrigir um erro de digitação e reenviar algumas vezes, mas um bot trava rápido.
- Estado em memória (`ConcurrentHashMap` de buckets), **não** Redis: o backend roda em instância
  única (ver `docker-compose.yml`, sem réplicas). Se um dia houver escala horizontal, esse limite
  passa a ser por-instância e precisa migrar pra um backend distribuído.
- IP extraído de `X-Forwarded-For` (primeiro valor) com fallback pra `getRemoteAddr()` — o nginx
  está na frente, então `getRemoteAddr()` sozinho veria sempre o IP do proxy e limitaria o mundo
  todo junto.
- Resposta `429` com corpo JSON, sem vazar quanto falta pra liberar.

**Não** foi estendido aos demais endpoints públicos nesta entrega. Motivo: mudar o comportamento
do fluxo de doação (Amigos do Melvin), que já está em produção e já teve incidente de cobrança
duplicada, é risco desproporcional pra uma US que não pediu isso. O gap segue documentado.

## Consequências
- **Os outros endpoints públicos continuam sem proteção** — `/amigomelvin/subscribe`,
  `/amigomelvin/one-time`, `/amigomelvin/items`, `/embaixador`, `/frequenciavoluntario`. Se for
  fechar esse gap depois, o filtro atual é o ponto de partida natural (generalizar o path em vez
  de criar outro filtro).
- **Ordem de registro do filtro importa e já quebrou uma vez.** Registrar com
  `.addFilterBefore(cestasRateLimitFilter, SecurityFilter.class)` **antes** de o próprio
  `SecurityFilter` estar registrado na cadeia faz o contexto Spring falhar inteiro na subida com
  `"The Filter class SecurityFilter does not have a registered order"` — pegou o
  `SistemaApplicationTests.contextLoads`. O `.addFilterBefore` do `SecurityFilter` tem que vir
  primeiro no builder. Não reordenar essas duas linhas sem rodar a suíte.
- O limite é por IP: várias pessoas atrás do mesmo IP (rede da igreja, operadora móvel com CGNAT)
  compartilham a cota. 5/hora foi calibrado pensando nisso, mas se a coordenação relatar líder
  legítimo bloqueado, é esse o motivo — subir o valor é a correção, não remover o filtro.
- Bucket4j entrou no projeto só por isso. É leve e sem infra extra, mas é dependência nova a
  manter atualizada.

## Ligado a
- [[cobranca-em-dobro-corrida-timeout-stripe]]
- [[idempotencia-dedup-pagamentos-stripe]]
