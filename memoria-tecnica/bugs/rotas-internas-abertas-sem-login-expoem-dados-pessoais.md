---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção (1º a 3º lotes em 10/10/2026; 4º lote em 12/10/2026)
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

## 3º lote: auditoria do sistema inteiro (10/10/2026)
A revisão das demais rotas e o limite de tentativas foram feitos na auditoria de 10/10/2026, publicada no mesmo dia
às 19:17 (BRT). Cada achado tem nota própria: [[spring-data-rest-publicava-repositorios-para-qualquer-logado]],
[[regra-de-seguranca-com-caminho-errado-abria-rota-para-qualquer-logado]],
[[cadastros-publicos-confiavam-no-corpo-da-requisicao]], [[login-sem-limite-de-tentativas-e-verificacao-de-senha-sem-teto]],
[[upload-aceitava-qualquer-arquivo-servido-pelo-mesmo-dominio]] e [[dependencias-spring-boot-3-5-e-versoes-fixadas]].

## 4º lote: consultas que respondiam além do necessário (12/10/2026)
Quatro consultas devolviam mais do que a tela que as usa precisava, ou a mais gente do que devia:

- **Voluntário por matrícula:** qualquer cargo logado lia a ficha completa de qualquer voluntário
  (contato, RG, endereço). Todos os chamadores no frontend são consultas do próprio usuário (Configurações,
  Frequência, Alunos) ou o formulário de edição de voluntário. Agora só a própria matrícula, ou quem tem
  `GERENCIAR_VOLUNTARIOS` (`VoluntarioConsultaAcesso`).
- **Alunos por sala:** qualquer cargo logado, devolvendo os mesmos dados da lista de alunos, que exige
  `VISUALIZAR_ALUNOS`. Um cargo sem essa permissão contornava a lista por aqui. Agora exige a mesma
  permissão. Nenhuma tela chama essa rota.
- **Lista de avisos:** pública, e devolvia também os avisos inativos e vencidos. O site nunca a usou; só a
  tela de avisos, para quem gerencia avisos (`GERENCIAR_AVISOS`).
- **Consultas de imagem (`/imagens/captura` e `/imagens/lista`):** a captura era pública e a lista
  era de qualquer logado; ambas devolviam o caminho do arquivo no servidor. O site mostra a foto do
  embaixador aprovado pela lista pública (`fotoPath`) e pelo caminho estático, nunca por essas rotas. Agora
  exigem `GERENCIAR_EMBAIXADORES` ou `GERENCIAR_AVISOS`.

Continuam públicos de propósito: nomes e funções de voluntários (seção de equipe do site), lista de
embaixadores aprovados e os caminhos estáticos das fotos de embaixador e de aviso.

**As duas listas mudaram juntas, de novo.** `/aviso` e `/imagens/captura` saíram também do
`PUBLIC_ENDPOINTS_BY_METHOD` do `SecurityFilter`; sem isso o administrador levaria 403, porque o
filtro não leria o token.

Contrato que mudou de propósito: dois testes antigos registravam o comportamento anterior (um cargo
sem permissão lendo a ficha de outra pessoa; a lista de avisos pública) e foram corrigidos junto. Um
terceiro, do tratador de erros, usava a captura pública de imagem como exemplo de rota anônima com UUID
no caminho; passou a usar uma rota exclusiva do cargo TECH, que não depende de regra semeada no banco
de teste.

- Validação: backend 312/312 (eram 308), com 4 testes novos em `RotasInternasSecurityTest` (token real),
  2 testes de `ControleDeAcessoPorCargoTest` reescritos para as imagens e os avisos e a
  `MatrizDeAcessoTest` reclassificando 5 rotas (a tabela falha o build se uma rota ficar mais aberta
  do que ela diz). Smoke pré-deploy 12/12 (inclui Playwright; o frontend não mudou).
- Publicado em 12/10/2026 às 17:50 (BRT) pelo `deploy.sh remote` a partir do commit `ba833e1`, com
  backup cifrado e cópia off-site às 17:49. No servidor, os arquivos alterados batem com o commit, os
  containers subiram sem reinício e sem erro no log, o Flyway segue na V17 e, pela URL pública, a lista
  de avisos passou de 200 para 403 e as demais rotas públicas seguem em 200.
- **Não verificado em produção:** o comportamento logado por cargo (sem credenciais); está coberto só
  pelos testes com token real. Falta a validação humana: ADM abre Avisos e o formulário de embaixador
  com foto; PROF abre Frequência e Configurações.

## Ainda em aberto
- Reduzir o que as consultas da área logada devolvem e a quem. Depende de definir com o Instituto
  quais cargos usam cada tela; os detalhes ficam fora do repositório até a correção.

## Ligado a
- [[dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica]]: mesmo tipo de achado, na mesma auditoria.
- [[rate-limit-apenas-solicitacao-cesta]]: o gap de limite de tentativas nos demais endpoints públicos.
