---
tipo: bug
data: 2026-08-05
severidade: Alta
status: Resolvido
---

# Logout automático ao navegar — PrivateRoute apagava a sessão inteira em qualquer falha

## Sintoma
Usuária (Yasmin, matrícula 2026008, role PROF) relatou ter sido deslogada automaticamente ao clicar em "Alunos", mesmo estando com sessão ativa segundos antes.

## Causa raiz
`PrivateRoute.jsx` revalida a role do usuário via `GET /auth/role_{matricula}` a cada montagem de rota — ou seja, em toda navegação dentro do app, não só em Alunos. Qualquer falha nessa chamada (token expirado/inválido, role sem permissão pra aquela rota específica, ou até um erro transitório de rede) caía exatamente no mesmo tratamento: apagar TODOS os cookies de autenticação (`token`, `login`, `role`) e forçar redirect pra `/login`. Não havia distinção entre "sessão de fato inválida" (correto deslogar) e "sessão válida mas sem permissão nesta tela" ou "falha passageira de rede" (não deveria deslogar em nenhum dos dois casos).

Três agravantes específicos encontrados durante a investigação:

1. **`auth.js` (`receberRole`) nunca rejeitava a Promise** — capturava o erro internamente (`try/catch`) e retornava um objeto sentinela (`{error: true, message}`) sem o status HTTP. Isso significava que o `catch` do `PrivateRoute` nunca executava na prática; toda falha (incluindo sessão genuinamente expirada) caía no branch de "sem permissão", sem status pra diferenciar os casos.
2. **`TokenService.genExpirationDate()` tinha bug de fuso horário**: `LocalDateTime.now()` (relógio de parede da JVM, que roda em UTC dentro do container — confirmado via `docker exec backend-melvin date`) era reinterpretado como se já estivesse em `-03:00` ao converter pra `Instant` via `.toInstant(ZoneOffset.of("-03:00"))`, somando +3h indevidas. Na prática o token durava ~5h em vez das 2h documentadas/pretendidas.
3. **Cookies de sessão (`token`, `login`, `role`) eram criados sem `expires`** — cookie de sessão pura, mais vulnerável a ser descartado cedo pelo próprio navegador (especialmente Safari/iOS, o dispositivo da Yasmin) sem gerar nenhum request de rede — o que explica por que uma falha real pode não deixar nenhum rastro em log de servidor.

Confirmado via logs de produção (VPS, nginx + `docker logs backend-melvin`) que o mecanismo acontece de fato: em outra conta (matrícula 20247001, não a da Yasmin), `GET /api/auth/role_20247001` retornou 403 e, 7 segundos depois, um novo login manual — assinatura exata de "sistema me deslogou do nada".

## Solução
- **`PrivateRoute.jsx`**: passou a diferenciar 3 casos a partir do `status` retornado pela checagem de role — `401`/`403` (sessão de fato inválida → apaga cookies e vai pro `/login`); `200` com role incompatível (sessão válida, só sem permissão nesta rota → **não** apaga cookies, redireciona pro dashboard do próprio cargo em `/app/{role}`); qualquer outro erro (falha transitória de rede/servidor → não mexe na sessão).
- **`auth.js` (`receberRole`)**: passou a incluir `status` no objeto retornado em caso de erro, pra `PrivateRoute` conseguir diferenciar os casos acima.
- **`TokenService.genExpirationDate()`**: trocado por `Instant.now().plus(2, ChronoUnit.HOURS)` — sem conversão de fuso, já que `Instant` é um valor absoluto (epoch), não precisa reinterpretar em nenhum offset.
- **Cookies de `token`/`login`/`role`** (em `authService.js` e `Login.jsx`) passaram a ter `expires` explícito de 2h, acompanhando a validade real do token — reduz a chance do navegador descartar o cookie antes da hora.

## Ligado a
- [[login-500-em-vez-de-401]] — mesma vizinhança de código (fluxo de autenticação), outro caso de contrato de erro mal tratado (ali era `UserDetailsService` retornando `null` em vez de lançar exceção; aqui era um "sem permissão" e "sessão inválida" sendo tratados como a mesma coisa).
