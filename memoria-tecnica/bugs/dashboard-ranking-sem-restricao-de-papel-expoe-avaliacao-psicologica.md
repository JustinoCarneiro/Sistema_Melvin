---
tipo: bug
data: 2026-09-13
severidade: Média
status: Corrigido e publicado em produção em 08/10/2026; regra revisada e publicada em produção em 10/10/2026
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

**Revisão da decisão de acesso (10/10/2026):** o dono do projeto pediu que o "Destaques" volte
a ser visto pelos cargos de docência, deixando a nota psicológica só para `PSICO` e `COOR`.
Implementado assim:

- `GET /dashboard/ranking` passa a aceitar quem tem `VISUALIZAR_RELATORIOS` (permissão dinâmica,
  ajustável em Permissões) ou é `PSICO`/`COOR`, que não dependem dela. Antes só `PSICO` e `COOR`.
- Quem não é `PSICO` nem `COOR` não recebe a nota psicológica: `sortBy=psicologico` dá 403, na regra
  de segurança (qualquer repetição ou caixa do parâmetro também) e de novo no serviço, e a média
  padrão é calculada só com as quatro notas pedagógicas. Para eles o frontend chama a média de
  "Média Pedagógica", porque o número difere da "Média Geral" de `PSICO`/`COOR` (cinco notas).
- Regra única de quem vê a nota psicológica em `NotaPsicologicaAcesso`, usada pela segurança e
  pelo controller.
- O frontend deixou de buscar o ranking na carga inicial: busca quando o painel e as permissões
  terminam de carregar, porque o cargo habilitado só é conhecido depois delas.

**Validação da revisão (10/10/2026):** backend 149/149 (inclui `DashboardRankingSecurityTest` com 15
casos e `DashboardServiceTest` com 9), lint e build do frontend limpos, Playwright 64/64 (10 no
painel, inclusive permissões que chegam depois do painel). Conferido também numa stack local
isolada (H2, sem produção) com login real de cinco cargos: Professor e Administração recebem a média
de quatro notas (8,0 e 7,0 para os alunos sintéticos) e 403 em `sortBy=psicologico`, inclusive com
parâmetro repetido ou em maiúsculas; Psicologia e Coordenação recebem a média de cinco notas (7,6 e
6,8) e a ordenação psicológica; Cozinha e sem login recebem 403; a interface mostra as opções certas
para cada cargo.

**Publicação da revisão (10/10/2026, 08:18 BRT):** pelo `deploy.sh remote` a partir de um worktree
limpo no commit `02860ff`. O smoke fechou 12/12 (backend, lint, build, Playwright 64/64, Compose,
varredura de segredos), o backup cifrado e a cópia off-site terminaram antes da recriação e o dry-run
não apontou exclusões. Conferido no servidor: os arquivos de segurança, serviço, controller e
frontend batem com o commit, Flyway validou 18 migrações sem nada a aplicar, o backend subiu em
20,6 s com 0 erros e sem reinício, API e site respondem 200, o ranking sem login responde 403 (com
e sem `sortBy=psicologico`), o bundle publicado contém "Média Pedagógica" e as portas 3000 e 8443
seguem fechadas por fora. **Não verificado em produção:** o comportamento por cargo com login real
(Professor, Psicólogo, Coordenação); isso foi conferido só na stack local. Falta a validação humana.

**Correção posterior (10/10/2026):** no deploy do lote de embaixadores o smoke acusou o teste de
login do ADM intermitente (3 falhas em 25 repetições). Causa: depois desta revisão o ADM também
consulta o ranking, e o `auth.spec.js` usa o `test` puro do Playwright, sem as fixtures; ali o
servidor estático responde 200 com o `index.html` a rotas desconhecidas. O hook guardava essa
resposta como estava, o `.map` quebrava na renderização e o painel inteiro sumia logo depois de
aparecer. Corrigido com guarda de tipo (`Array.isArray`) no hook, como nas demais listagens, e teste
de regressão no `dashboard.spec.js`; o teste de login do ADM passou 25/25. O smoke barrou o deploy
antes de qualquer ação remota, como deve.

**Ainda em aberto, fora do escopo desta revisão:**

- A mesma nota psicológica continua visível a cargos como `PROF` em Rendimento
  (`GET /discente/matricula/{matricula}`), na tabela de Relatórios (`GET /discente`) e na
  exportação para Excel. O Manual documenta isso como leitura permitida, então pode ser intencional;
  decidir com o Instituto antes de ocultar.
- O card "Atenção Necessária" não mostra os alunos que precisam de atenção: reordena em ordem
  crescente os mesmos cinco melhores devolvidos por `/dashboard/ranking`. Corrigir exige um
  parâmetro de ordem no endpoint.

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
