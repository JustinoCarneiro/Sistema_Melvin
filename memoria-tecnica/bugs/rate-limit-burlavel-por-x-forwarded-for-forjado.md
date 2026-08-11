---
tipo: bug
data: 2026-08-11
severidade: Alta
status: Resolvido
---

# Rate limit burlável (e vazando memória) por confiar no início do X-Forwarded-For

## Sintoma
Nenhum — foi achado em auditoria pré-deploy, antes de ir para produção. O rate limit do
endpoint público `POST /cestas/solicitacao` (US-7.4) parecia funcionar: 5 requisições passavam,
a 6ª tomava 429. Mas isso só valia para um cliente que não tentasse burlar.

## Causa raiz
O filtro montava a chave do limite a partir do **primeiro** elemento de `X-Forwarded-For`:

```java
return forwarded.split(",")[0].trim();   // ERRADO
```

O nginx do projeto usa `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`, que
**anexa** o IP real ao final do que o cliente mandou. Ou seja, o header que chega ao backend é:

```
X-Forwarded-For: <o que o cliente escreveu>, <IP real da conexão>
```

Logo, o começo do header é justamente a parte que o **cliente controla**. Duas consequências:

1. **Bypass total do limite** — basta variar o header a cada requisição (`1.2.3.1`, `1.2.3.2`, …)
   e cada uma cai num bucket diferente. O limite nunca fecha.
2. **Vazamento de memória explorável** — cada valor forjado cria uma entrada nova no
   `ConcurrentHashMap`, que não expirava. Com heap limitado a 512m, e este projeto já tendo
   histórico de 504 por exaustão de heap ([[heap-exhaustion-504-cronico]]), isso é um vetor de
   DoS barato: um laço de requisições com header aleatório enche o mapa.

## Solução
- A chave passou a sair de **`X-Real-IP`**, que o nginx sobrescreve com `$remote_addr` (o IP da
  conexão TCP) e o cliente não consegue influenciar.
- No fallback para `X-Forwarded-For`, usar o **último** elemento — o que o nginx anexou —, nunca
  o primeiro.
- Teto de `10.000` IPs monitorados no mapa: ao encher, limpa. Preferível reabrir a janela de
  alguns IPs a arriscar a memória do processo.
- Coberto por teste que envia `X-Forwarded-For` forjado e exige o 429.

## Como não repetir
Ao usar IP de cliente como chave (rate limit, auditoria, bloqueio), lembrar que **todo header
HTTP é entrada do usuário**. Atrás de proxy, o único valor confiável é o que o próprio proxy
escreve — aqui, `X-Real-IP`. Se for usar `X-Forwarded-For`, saber de qual ponta ler: com
`$proxy_add_x_forwarded_for`, o IP confiável é o do fim, não o do começo.

## Ligado a
- [[rate-limit-apenas-solicitacao-cesta]] — a decisão de aplicar limite só neste endpoint.
- [[heap-exhaustion-504-cronico]] — por que crescimento de memória sem teto é risco real aqui.
