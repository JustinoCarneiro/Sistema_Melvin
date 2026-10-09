---
tipo: bug
data: 2026-09-13
severidade: Média
status: Corrigido (código) — deploy em produção pendente de confirmação
---

# Painel `/dashboard` sem restrição de papel expõe avaliação psicológica de aluno a qualquer cargo autenticado

## Sintoma
Achado em auditoria de código durante o port deste sistema para o Edu+ (SaaS multi-tenant
derivado do Sistema Melvin, em `~/Applications/edu-plus`), ao revisar `DashboardService`/
`DashboardController` antes de decidir o que seria reaproveitado. Não é um sintoma observado em
produção — é um achado de leitura de código, ainda não verificado com um teste de exploração
real nem confirmado com a direção do Instituto.

`SecurityConfiguration.java` libera todo `/dashboard/**` só com `.authenticated()`:

```java
.requestMatchers(HttpMethod.GET, "/dashboard/**").authenticated()
```

Sem `hasAnyRole(...)`. Isso inclui `GET /dashboard/ranking?sortBy=psicologico`, que devolve os
5 alunos com maior `avaliacaoPsicologico` (nome + matrícula + nota) — e os demais `sortBy`
(`comportamento`, `participacao`, etc.). Qualquer um dos 11 papéis do sistema — inclusive
`COZI` (cozinha), `ZELA` (zeladoria) e `MARK` (marketing), que não têm nenhuma função
pedagógica ou clínica — consegue chamar esse endpoint como qualquer usuário autenticado normal.

## Causa raiz
O endpoint nasceu como um dashboard interno de uso geral (presença, ranking, avisos) e nunca
recebeu uma regra de autorização própria — ficou implicitamente coberto pela regra genérica
`/dashboard/**` = qualquer autenticado, sem revisão específica de quais campos ele expõe.
`docs/SEGURANCA_E_LGPD.md` já promete RBAC granular ("Professores podem ver chamadas, mas não
podem visualizar dados médicos de alunos") — o `/dashboard/ranking` quebra essa promessa para
avaliação psicológica/comportamental, que é dado sensível por natureza (LGPD art. 5º, II).

## Solução

**Corrigido em `SecurityConfiguration.java` (2026-09-15):** `GET /dashboard/ranking`
agora exige a permissão `VISUALIZAR_RELATORIOS` (`PROF,ADM,TECH,DIRE,COOR,ASSIST,PSICO`
— a mesma regra de relatório já seedada e usada em outras rotas deste arquivo), via
`permissaoService.hasPermission(...)`, adicionada **antes** do `.authenticated()`
genérico de `/dashboard/**` (Spring Security usa a primeira regra que casar). `COZI`,
`ZELA`, `MARK` e `AUX` deixam de conseguir chamar o endpoint.

**Validação inicial (15/09/2026):** `mvn compile` limpo; a suíte completa não pôde
ser executada naquela sessão por restrição do sandbox.

**Validação do candidato de release (08/10/2026):** o novo
`DashboardRankingSecurityTest` usa MockMvc e confirma 403 sem a permissão
`VISUALIZAR_RELATORIOS`, 200 com a permissão e acesso preservado a
`/dashboard/presentes`. A suíte backend completa passou: 109 testes, sem falhas.
Ainda falta a validação humana com contas de teste de perfis sem/com permissão
antes da publicação em produção; nenhuma credencial ou dado real deve entrar
nos testes ou neste registro.

Itens do caminho sugerido original, ainda em aberto (não fechados por este fix):

- Restringir `GET /dashboard/ranking` a papéis com função pedagógica/clínica/direção (ex.:
  `PSICO`, `COOR`, `DIRE`, `ADM`), no mesmo padrão já usado para `/ocorrencias-tecnicas/**`
  (`hasRole("TECH")`).
- Avaliar se `sortBy=psicologico` e `sortBy=comportamento` merecem trava adicional (só
  `PSICO`/`COOR`) mesmo dentro de quem já acessa o ranking, já que nem toda direção pedagógica
  precisa ver a nota psicológica individual de um aluno.
- `/dashboard/presentes` e `/dashboard/avisos` parecem de sensibilidade menor (contagem
  agregada e avisos já públicos) — não é óbvio que precisem da mesma restrição, mas vale
  confirmar com a direção do Instituto antes de decidir, em vez de presumir.

## Ligado a
- Achado durante o port para o Edu+ (`~/Applications/edu-plus`), que copiou este código e tem
  o mesmo `DashboardService` (renomeado para `Aluno` em vez de `Discente`) com uma variante
  agravada deste problema: lá `findAll()` também ignora `organizacao_id`, vazando dado entre
  organizações diferentes (multi-tenancy), não só entre papéis. A correção no Edu+ está sendo
  tratada separadamente, registrada no `ROADMAP.md` daquele repositório — este projeto (Melvin)
  é single-tenant, então só a parte de restrição de papel se aplica aqui.
