---
tipo: bug
data: 2026-09-13
severidade: Média
status: Corrigido e publicado em produção em 08/10/2026
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

**Primeira correção (15/09/2026):** `GET /dashboard/ranking` passou a exigir
`VISUALIZAR_RELATORIOS` antes da regra genérica de `/dashboard/**`. A revisão
de 08/10/2026 identificou que essa permissão também inclui `PROF` e `ASSIST`,
embora a média padrão do ranking incorpore a nota psicológica.

**Decisão de acesso (08/10/2026):** o dono do projeto confirmou apenas `PSICO`
e `COOR` para qualquer ordenação do ranking. O candidato passou a aplicar
`hasAnyRole("PSICO", "COOR")` no servidor; o frontend só consulta e exibe os
cards de ranking para esses perfis. Os demais cards do dashboard permanecem
disponíveis segundo suas regras próprias.

**Validação inicial (15/09/2026):** `mvn compile` limpo; a suíte completa não pôde
ser executada naquela sessão por restrição do sandbox.

**Validação do candidato de release (08/10/2026):** o novo
`DashboardRankingSecurityTest` usa MockMvc para verificar 403 em cargos sem
acesso, 200 para `PSICO` e `COOR`, e acesso preservado a `/dashboard/presentes`.
O Playwright confirma que `ADM` não consulta nem exibe o ranking e que `PSICO`
continua a usá-lo. Ainda falta a validação humana com contas de teste dos perfis
permitidos e negados. A publicação foi autorizada e concluída em 08/10/2026 às
23:53 BRT. No pós-deploy, o site e o health da API responderam 200, a rota sem
autenticação respondeu 403 e os containers permaneceram saudáveis. Nenhuma
credencial ou dado real entrou nos testes ou neste registro.

Itens do caminho sugerido original, ainda em aberto (não fechados por este fix):

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
