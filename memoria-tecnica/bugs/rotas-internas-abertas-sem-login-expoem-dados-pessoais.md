---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção em 10/10/2026 (1º e 2º lotes)
---

# Rotas internas respondiam sem login e expunham dados pessoais

## Sintoma
Achado em leitura de código na auditoria de 08/10/2026, sem exploração observada. Rotas da área
logada respondiam a qualquer visitante, sem login:

- frequência de alunos (listagem, por data, alertas de faltas e exportação para Excel), com nome,
  matrícula, presença e justificativa de cada criança;
- consulta de voluntário por matrícula, com os dados cadastrais completos;
- ponto dos voluntários, aberto também para escrita (POST e PUT), então qualquer visitante podia
  registrar presença em nome de um voluntário;
- arquivos de diário pelo caminho estático `/app/docs/diarios/**`. Os nomes levam um UUID aleatório,
  o que dificultava adivinhar, mas o caminho ficava fora de qualquer controle de cargo.

As matrículas são sequenciais, portanto enumeráveis. Não foi verificado se alguém acessou essas
rotas sem login antes da correção.

## Causa raiz
Duas listas independentes liberavam esses caminhos, herdadas do início do projeto, sem inventário de
quais precisavam mesmo ser públicas:

1. `permitAll` em `SecurityConfiguration`;
2. `PUBLIC_ENDPOINTS_BY_METHOD` em `SecurityFilter`, que **pula a leitura do token** nesses caminhos.

Os controllers devolvem a entidade inteira. Nenhuma tela pública usava essas rotas: todas as
chamadas vinham de telas `/app/*`, já logadas (Dashboard, Relatórios, Rendimento, Alunos, Meu Perfil
e frequência de voluntários). A lista de nomes e funções de voluntários é a única do grupo que o
site público consome, e por isso continua aberta.

## Solução
- Frequência de alunos, ponto dos voluntários (GET, POST e PUT) e consulta de voluntário por
  matrícula passam a exigir login. Qualquer cargo logado continua passando, porque o painel carrega
  esses dados para todos os cargos.
- Arquivos de diário pelo caminho estático: só ADM, TECH, COOR e DIRE, os mesmos cargos de
  `/diarios`. O frontend baixa o diário por `/diarios/download/{matricula}`, nunca pelo caminho
  estático.
- **As duas listas precisam mudar juntas.** Mudar só `SecurityConfiguration` faria o usuário logado
  receber 403 nessas rotas, porque o filtro nem chegaria a ler o token. O teste que pega isso é o de
  token JWT real passando pelo `SecurityFilter` (`RotasInternasSecurityTest`); `@WithMockUser` não
  pega, porque injeta a autenticação sem passar pelo filtro. Com as entradas antigas de volta no
  filtro, esse teste falha.
- Continuam públicas, de propósito: lista de nomes e funções de voluntários, avisos e as demais rotas
  do site.

## Validação
- Backend 158/158, com 9 testes novos (`RotasInternasSecurityTest`): negação sem login e com token
  inválido, acesso mantido com token real, diários só para os cargos certos, rotas do site públicas.
- Smoke pré-deploy 12/12 (inclui Playwright 64/64).
- Stack local isolada (H2) com login real: sem login, as rotas internas dão 403 e as do site dão 200;
  com login de COZI e COOR, Dashboard, Meu Perfil e lista de alunos carregam, com todas as chamadas
  em 200 e levando o token.
- Publicado em 10/10/2026 às 08:47 (BRT) pelo `deploy.sh` a partir do commit `a4e9afb`, com backup
  cifrado e cópia off-site antes. No servidor, os arquivos batem com o commit, o backend subiu em 13 s
  sem erros nem reinício e, sem login, as rotas dão 403 tanto pelo servidor quanto pela URL pública.
- **Não verificado em produção:** as telas logadas por cargo (sem credenciais); isso foi conferido só
  na stack local. Falta a validação humana.

## 2º lote: lista pública de embaixadores (10/10/2026)
`GET /embaixador` era público e devolvia a entidade inteira: contato, e-mail e Instagram de todos os
cadastrados, inclusive os ainda não aprovados. O site usava só nome, descrição e a foto (ligada pelo
id) e filtrava os aprovados no navegador, então os dados de contato chegavam a qualquer visitante
sem aparecer na tela. A mesma lista de caminhos do `SecurityFilter` também estava envolvida.

- O site passa a usar `GET /embaixador/publicos`: só os aprovados e só `id`, `nome` e `descricao`.
  A consulta é uma projeção JPQL, então contato, e-mail e Instagram nem são carregados.
- `GET /embaixador` (lista completa) passa a exigir login e a permissão de gerenciar embaixadores
  (por padrão ADM, TECH e DIRE). A tela de administração segue funcionando para esses cargos.
- No `SecurityFilter`, o prefixo `/embaixador` foi trocado por `/embaixador/publicos`; sem isso o
  administrador levaria 403 na lista completa porque o filtro não leria o token. A mutação
  confirmou: com o prefixo antigo de volta, o teste do administrador falha.
- O cadastro pelo site (`POST /embaixador`) continua público.
- Validação: backend 167/167 (9 testes novos), Playwright 66/66, smoke 12/12 e stack local com login
  real (visitante vê só o aprovado, ADM vê a lista completa, COZI recebe 403). Publicado em
  10/10/2026 às 14:10 (BRT). Em produção a tabela estava vazia (0 cadastros) no momento da
  publicação, então a lista pública vazia é o resultado correto e a filtragem de aprovados e
  pendentes foi conferida só na stack local.

## Ainda em aberto
- Qualquer cargo logado ainda lê a entidade inteira de aluno e de voluntário nessas rotas. Reduzir
  com DTO e permissão por cargo.
- Revisão das demais rotas públicas (módulo 18 do `ROADMAP.md`, próximo lote).
- Só o endpoint de solicitação de cesta tem limite de tentativas; os outros públicos seguem sem.

## Ligado a
- [[dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica]]: mesmo tipo de achado, na mesma auditoria.
- [[rate-limit-apenas-solicitacao-cesta]]: o gap de limite de tentativas nos demais endpoints públicos.
