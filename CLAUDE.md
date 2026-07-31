# 📘 CLAUDE.md — Especificação Viva do Sistema Melvin

> **Última atualização:** 15/07/2026
> **Fase atual:** Fase 5 (Produção)
> **Metodologia:** Onda-Dev (Playbook de Engenharia)

---

## DIRETIVA PRIMÁRIA

> "Leia o `CLAUDE.md` e o `ROADMAP.md`. A partir de agora, não altere a sintaxe do código que eu enviar ou que já existe. Este é o padrão a ser seguido adiante."

---

## 1. STACK TECNOLÓGICA

| Camada | Tecnologia |
|---|---|
| **Frontend** | React + Vite + TypeScript (SPA) |
| **Backend** | Java 21 + Spring Boot 3.3.4 (Maven) |
| **Banco de Dados** | PostgreSQL (Docker) |
| **Segurança** | Spring Security + JWT + Argon2 |
| **Pagamentos** | Stripe (SDK nativo + Webhooks) |
| **E-mail** | Spring Boot Starter Mail (SMTP, @Async) |
| **Infraestrutura** | Docker + Docker Compose + Nginx |
| **Testes Frontend** | Cypress (E2E — 19 suítes) |
| **Testes Backend** | JUnit 5 + Mockito (8 suítes) |
| **Migrations** | Flyway |

---

## 2. ARQUITETURA

```
Internet
   │
[Nginx - Proxy Reverso]  ← HTTPS (porta 443)
   │
   ├── /           → Frontend (React SPA - porta 3000)
   └── /api/v1/    → Backend (Spring Boot - porta 8443)
                         │
                   [Rede Docker Interna]
                         │
                   [PostgreSQL - porta 5432]
                   (não exposto externamente)
```

### Padrão de Código
- **Backend:** Controller → Service → Repository (DDD simplificado por domínio)
- **Frontend:** Componentes funcionais com Hooks. Estilização via CSS Modules (SASS/SCSS)
- **Integração:** Camada `services/` com `http.js` como base axios

### Padrão de Matrícula
- `[Ano][XXX]` — 7 dígitos (Ex: `2026001`). Sequência reiniciada anualmente.
- Matrículas legadas de 8 dígitos (Ex: `20247001`) são preservadas.

---

## 3. ÉPICOS E HISTÓRIAS DE USUÁRIO

---

### ÉPICO 1: AUTENTICAÇÃO E SESSÃO

**Escopo:** Login, registro, gestão de senhas e tokens JWT.

#### US-1.1: Login por Matrícula
**Como** voluntário/coordenador do instituto,
**eu quero** me autenticar utilizando minha matrícula e senha,
**para que** eu acesse o painel administrativo com minhas permissões.

**Critérios de Aceite:**
```gherkin
Dado que o usuário está na tela de login,
Quando ele insere matrícula e senha válidas,
Então o sistema retorna um token JWT e redireciona para o dashboard.

Dado que o usuário está na tela de login,
Quando ele insere uma matrícula inexistente ou senha incorreta,
Então o sistema exibe "Matrícula ou senha inválida" com status 401.
```

#### US-1.2: Registro de Usuário
**Como** administrador,
**eu quero** registrar novos usuários vinculados a voluntários existentes,
**para que** eles possam acessar o sistema com o cargo apropriado.

**Critérios de Aceite:**
```gherkin
Dado que a matrícula informada corresponde a um voluntário cadastrado,
Quando o administrador submete o registro,
Então o usuário é criado com senha criptografada em Argon2.

Dado que a matrícula informada NÃO corresponde a um voluntário,
Quando o administrador tenta registrar,
Então o sistema retorna 400 Bad Request.

Dado que a matrícula já possui um login registrado,
Quando o administrador tenta registrar novamente,
Então o sistema retorna 409 Conflict.
```

#### US-1.3: Alteração de Senha
**Como** administrador,
**eu quero** alterar a senha de um usuário existente,
**para que** ele possa recuperar o acesso caso esqueça suas credenciais.

**Critérios de Aceite:**
```gherkin
Dado que o usuário existe no sistema,
Quando o admin envia a nova senha,
Então a senha é atualizada com hash Argon2 e retorna 200 OK.
```

#### US-1.4: Alteração de Role
**Como** administrador,
**eu quero** alterar o cargo (role) de um usuário,
**para que** suas permissões reflitam a nova função no instituto.

**Critérios de Aceite:**
```gherkin
Dado que o cargo informado é válido (COOR, PROF, AUX, COZI, DIRE, ADM, MARK, ZELA, PSICO, ASSIST),
Quando o admin submete a alteração,
Então o role é atualizado e retorna 200 OK.

Dado que o cargo informado é inválido,
Quando o admin submete,
Então o sistema retorna 400 "Role inválida".
```

---

### ÉPICO 2: RBAC DINÂMICO (PERMISSÕES)

**Escopo:** Sistema de permissões configuráveis pelo administrador, com dupla validação (frontend + backend).

#### US-2.1: Configurar Permissões por Cargo
**Como** administrador,
**eu quero** definir via interface quais ações cada cargo pode executar,
**para que** o controle de acesso seja flexível sem necessidade de código.

**Critérios de Aceite:**
```gherkin
Dado que o admin está na tela /app/config/permissoes,
Quando ele marca/desmarca checkboxes para uma regra (ex: EDITAR_ALUNO),
Então as roles permitidas são atualizadas no banco via PUT /permissoes/{nomeRegra}.

Dado que a regra EDITAR_ALUNO permite apenas [ADM, COOR],
Quando um PROF tenta editar um aluno,
Então o backend retorna 403 Forbidden.
```

#### US-2.2: Verificar Permissões no Frontend
**Como** usuário logado,
**eu quero** que menus e botões sem permissão estejam ocultos,
**para que** a interface reflita exatamente o que posso fazer.

**Critérios de Aceite:**
```gherkin
Dado que o cargo PROF não possui permissão EXPORTAR_RELATORIO,
Quando o PROF acessa a tela de relatórios,
Então o botão "Exportar" não é renderizado na interface.
```

**Permissões disponíveis:** `VER_ALUNO`, `EDITAR_ALUNO`, `CRIAR_ALUNO`, `DELETAR_ALUNO`, `VER_FREQUENCIA`, `EDITAR_FREQUENCIA`, `VER_VOLUNTARIO`, `GERENCIAR_CESTAS`, `GERENCIAR_AMIGOS`, `EXPORTAR_RELATORIO`, `EDITAR_RENDIMENTO`, `EDITAR_AVALIACAO_PSICO`.

---

### ÉPICO 3: GESTÃO DE DISCENTES (ALUNOS)

**Escopo:** CRUD completo de alunos com matrícula auto-gerada, busca, exportação e conformidade LGPD.

#### US-3.1: Cadastrar Aluno
**Como** coordenador,
**eu quero** cadastrar um novo aluno com matrícula gerada automaticamente,
**para que** ele entre no sistema com dados pessoais e acadêmicos completos.

**Critérios de Aceite:**
```gherkin
Dado que o ano corrente é 2026 e o último aluno cadastrado tem matrícula 2026005,
Quando o coordenador cadastra um novo aluno,
Então a matrícula gerada automaticamente é 2026006.

Dado que uma matrícula já existe no sistema,
Quando alguém tenta cadastrar com a mesma matrícula,
Então o sistema retorna 409 "Matrícula já cadastrada!".
```

#### US-3.2: Listar Alunos (LGPD)
**Como** funcionário autorizado,
**eu quero** ver a lista de alunos com dados mínimos (matrícula, nome, sala, status),
**para que** dados sensíveis (prontuário, saúde, contatos) não sejam expostos na listagem.

**Critérios de Aceite:**
```gherkin
Dado que o endpoint GET /discente é chamado,
Quando a resposta é retornada,
Então APENAS os campos do DiscenteListagemDTO são trafegados (sem prontuário, saúde ou endereço).
```

#### US-3.3: Remover Aluno (Soft Delete + Anonimização)
**Como** administrador,
**eu quero** remover um aluno de forma que seus dados sensíveis sejam anonimizados,
**para que** o instituto cumpra o Art. 18 da LGPD mantendo o registro estatístico.

**Critérios de Aceite:**
```gherkin
Dado que o aluno com matrícula 2026001 será removido,
Quando o admin confirma a exclusão,
Então o status muda para INATIVO e campos de contato/saúde são sobrescritos com dados genéricos irreversíveis.
```

#### US-3.4: Exportar Alunos para Excel
**Como** coordenador com permissão EXPORTAR_RELATORIO,
**eu quero** exportar a lista de alunos em formato `.xlsx`,
**para que** eu possa trabalhar com os dados offline.

#### US-3.5: Alterar Avaliações com Permissão Granular
**Como** professor,
**eu quero** atualizar as avaliações de rendimento de um aluno,
**para que** o histórico acadêmico esteja sempre atualizado.

**Critérios de Aceite:**
```gherkin
Dado que o usuário tem permissão EDITAR_RENDIMENTO mas NÃO tem EDITAR_AVALIACAO_PSICO,
Quando ele envia avaliacaoRendimento=4.5 e avaliacaoPsicologico=3.0,
Então APENAS avaliacaoRendimento é atualizada; avaliacaoPsicologico permanece null.
```

#### US-3.6: Retenção de Filtros na Listagem e Padronização de UI
**Como** coordenador,
**eu quero** que meus filtros na lista de alunos (busca, turno, sala) sejam preservados após edição e que o botão de adicionar seja padronizado no cabeçalho,
**para que** eu não perca o contexto de navegação e tenha uma interface consistente.

**Critérios de Aceite:**
```gherkin
Dado que estou na lista de alunos e aplico o filtro de turno "Tarde",
Quando eu clico para editar um aluno e depois retorno à lista,
Então o filtro "Tarde" continua aplicado automaticamente (estado mantido via localStorage).

Dado que possuo a permissão CADASTRAR_ALUNO,
Quando abro a lista de alunos,
Então vejo o botão "Adicionar" no cabeçalho da tabela, junto com outros botões de ação.
```

---

### ÉPICO 4: GESTÃO DE VOLUNTÁRIOS

**Escopo:** CRUD de voluntários com suporte a múltiplas salas/disciplinas.

#### US-4.1: Cadastrar Voluntário
**Como** administrador,
**eu quero** cadastrar um voluntário com matrícula auto-gerada e múltiplas salas,
**para que** o sistema reflita sua atuação em diferentes turmas.

#### US-4.2: Listar Voluntários (LGPD)
**Como** funcionário autorizado,
**eu quero** ver voluntários com dados resumidos via `VoluntarioListagemDTO`,
**para que** a listagem não exponha dados pessoais desnecessários.

#### US-4.3: Listar Nomes e Funções
**Como** sistema (internamente),
**eu quero** obter a lista de voluntários com apenas nome e função (`VoluntarioDTO`),
**para que** dropdowns e seletores sejam populados sem over-fetching.

---

### ÉPICO 5: FREQUÊNCIA (PONTO ELETRÔNICO)

**Escopo:** Registro de presença/falta diária para alunos e voluntários.

#### US-5.1: Registrar Frequência de Aluno
**Como** professor,
**eu quero** registrar a presença de cada aluno por turno (manhã/tarde) com códigos P/F/FJ,
**para que** o controle de frequência seja preciso.

**Critérios de Aceite:**
```gherkin
Dado que a combinação matrícula + data já existe,
Quando o professor tenta registrar novamente,
Então o sistema retorna conflito (frequência já registrada).
```

#### US-5.2: Alertas de Faltas
**Como** coordenador,
**eu quero** visualizar alunos com alto índice de faltas num período,
**para que** ações pedagógicas possam ser tomadas preventivamente.

#### US-5.3: Auto-frequência do Voluntário
**Como** voluntário logado,
**eu quero** registrar minha própria presença diária na página de configurações,
**para que** meu registro de frequência seja mantido sem depender de terceiros.

#### US-5.4: Exportar Frequência para Excel
**Como** coordenador,
**eu quero** exportar a frequência filtrada por mês, sala e turno em `.xlsx`,
**para que** relatórios impressos sejam gerados para reuniões.

---

### ÉPICO 6: AMIGOS DO MELVIN (DOAÇÕES — STRIPE)

**Escopo:** Ecossistema de doações recorrentes e únicas com gateway Stripe.

#### US-6.1: Assinar Doação Recorrente
**Como** visitante do site,
**eu quero** escolher um valor mensal e cadastrar meu cartão de crédito,
**para que** eu me torne um doador recorrente do instituto.

**Critérios de Aceite:**
```gherkin
Dado que o visitante preencheu nome, email, contato, CPF (obrigatório), valor (R$30/50/100/custom) e stripeToken,
Quando ele submete o formulário,
Então o backend cria a assinatura via Stripe SDK (com idempotency key), salva o doador como PENDING e retorna 201 Created.
Os dados do cartão NUNCA tocam o banco PostgreSQL (PCI-DSS compliance).

Dado que já existe assinatura ativa/pendente para o mesmo CPF,
Quando o visitante submete o formulário com o MESMO valor,
Então o backend retorna 409 Conflict (sem criar nova assinatura).

Dado que já existe assinatura ativa/pendente para o mesmo CPF,
Quando o visitante submete com um VALOR DIFERENTE,
Então o backend ATUALIZA a assinatura existente no Stripe (não cria uma nova) e retorna 200 OK.
```

> **Notas de implementação:** CPF é obrigatório (validação `@CPF`), cifrado em repouso (AES-256-GCM) e indexado por *blind index* HMAC (assim como o e-mail) para deduplicação sem expor o dado. O webhook do Stripe é exposto publicamente em `…/api/v1/webhooks/payments`, mas o controller é mapeado em `/v1/webhooks/payments` porque o nginx remove o prefixo `/api/`.

#### US-6.2: Confirmação de Pagamento via Webhook
**Como** sistema (integração Stripe),
**eu quero** que o webhook `invoice.paid` confirme o primeiro pagamento,
**para que** o doador mude de PENDING para ACTIVE, receba e-mail de boas-vindas e o Instituto seja notificado.

**Critérios de Aceite:**
```gherkin
Dado que o Stripe dispara POST /api/v1/webhooks/payments com evento invoice.paid,
Quando a assinatura do header Stripe-Signature é válida,
Então o doador é atualizado para ACTIVE e mesesContribuindo é incrementado.

Dado que o header Stripe-Signature é inválido ou ausente,
Quando o webhook é recebido,
Então o sistema retorna 400 "Invalid signature" (proteção antifraude).
```

#### US-6.3: Registrar Falha de Pagamento
**Como** sistema,
**eu quero** que o webhook `invoice.payment_failed` registre inadimplência,
**para que** o doador mude para INACTIVE, receba aviso por e-mail e o Instituto seja notificado da falha.

#### US-6.4: Cancelar Assinatura
**Como** administrador,
**eu quero** cancelar manualmente a assinatura de um doador via painel,
**para que** a cobrança recorrente seja encerrada no Stripe e no banco local.

**Critérios de Aceite:**
```gherkin
Dado que o admin clica "Cancelar Assinatura" no doador ACTIVE,
Quando o sistema processa a requisição,
Então o Stripe cancela a subscription via SDK, o status muda para CANCELLED, um e-mail de encerramento é enviado ao doador e o Instituto é notificado.
```

#### US-6.5: Doação Única (One-Time)
**Como** visitante,
**eu quero** fazer uma doação avulsa sem assinatura mensal,
**para que** eu contribua pontualmente.

#### US-6.6: Doação de Itens
**Como** doador de bens materiais,
**eu quero** preencher um formulário com o tipo de item e observações,
**para que** o instituto registre a doação sem necessidade de pagamento online.

#### US-6.7: Lógica de Recompensas
**Como** sistema,
**eu quero** rastrear `mesesContribuindo` e disparar alertas em marcos específicos,
**para que** doadores recebam reconhecimento progressivo.

**Critérios de Aceite:**
```gherkin
Dado que o doador completou 3 meses,
Então status_certificado = DISPONIVEL.

Dado que o doador completou 6 meses,
Então alerta de envio de camiseta aparece no dashboard admin.

Dado que o doador completou 12 meses,
Então alerta de kit_especial aparece no dashboard admin.
```

---

### ÉPICO 7: CESTAS BÁSICAS, EMBAIXADORES E AVISOS

**Escopo:** Módulos de gestão complementares do instituto.

#### US-7.1: CRUD de Cestas Básicas
**Como** coordenador,
**eu quero** gerenciar o cadastro de beneficiários de cestas básicas,
**para que** a distribuição seja organizada e rastreável.

#### US-7.2: CRUD de Embaixadores
**Como** administrador,
**eu quero** cadastrar e editar embaixadores/parceiros com foto e redes sociais,
**para que** eles apareçam na página pública do site.

#### US-7.3: CRUD de Avisos
**Como** coordenador,
**eu quero** publicar avisos com título, corpo, imagem e período de exibição,
**para que** voluntários e equipe sejam informados de comunicados importantes.

---

### ÉPICO 8: DASHBOARD E RELATÓRIOS

**Escopo:** Painel principal com métricas e rankings.

#### US-8.1: Alunos Presentes Hoje
**Como** coordenador ao abrir o sistema,
**eu quero** ver a contagem de alunos presentes no dia,
**para que** tenha uma visão rápida da frequência diária.

#### US-8.2: Ranking de Alunos
**Como** coordenador,
**eu quero** ver o Top 5 alunos por frequência ou média de rendimento,
**para que** os destaques acadêmicos sejam reconhecidos.

#### US-8.3: Avisos Ativos no Dashboard
**Como** qualquer usuário logado,
**eu quero** ver os avisos ativos diretamente no dashboard,
**para que** eu esteja sempre informado dos comunicados vigentes.

---

### ÉPICO 9: DIÁRIO E RENDIMENTO

**Escopo:** Upload de documentos pedagógicos vinculados a alunos.

#### US-9.1: Upload de Diário
**Como** professor,
**eu quero** fazer upload de um arquivo PDF vinculado à matrícula do aluno,
**para que** o acompanhamento pedagógico seja registrado digitalmente.

#### US-9.2: Download de Diário
**Como** coordenador,
**eu quero** baixar o arquivo de diário de um aluno,
**para que** eu possa analisar o documento offline.

---

### ÉPICO 10: SITE INSTITUCIONAL (PÚBLICO)

**Escopo:** Landing page pública com informações do instituto, embaixadores, doações e impacto social.

#### US-10.1: Página de Doações
**Como** visitante,
**eu quero** acessar a página `/doacoes` e escolher entre doação recorrente, única ou de itens,
**para que** eu contribua com o instituto da forma que preferir.

#### US-10.2: Página de Embaixadores
**Como** visitante,
**eu quero** visualizar os embaixadores e parceiros do instituto,
**para que** conheça quem apoia a causa.

---

## 4. DIRETRIZES DE SINTAXE E PADRÕES

### Backend
- Padrão `Controller → Service → Repository`
- Endpoints RESTful (Atenção: `/cestas` e `/diarios` no plural, `/aviso` e `/embaixador` no singular)
- Validação de entrada com Jakarta Validation
- Logs via SLF4J + Logback com MDC para rastreabilidade
- DTOs estritos para listagens (LGPD)

### Frontend
- Componentes funcionais com Hooks
- Estilização via CSS Modules (SASS/SCSS)
- Integração via `services/` (uso de `http.js` como base)
- Hook `usePermissions` para controle de acesso visual

### Segurança
- Senhas: Argon2
- Tokens: JWT com expiração, assinado com `JWT_SECRET` via `.env`
- Webhooks: Validação de assinatura Stripe (`Stripe-Signature`)
- CORS: Origens autorizadas via `FRONTEND_URL`
- Rede: PostgreSQL isolado na rede Docker interna

---

## 5. CONGELAMENTO VISUAL (FASE 2)

| Data de Aprovação | Aprovado por | Evidência | Status |
|---|---|---|---|
| Maio/2026 | Instituto Social Melvin | Sistema em produção (institutomelvin.org) | ✅ CONGELADO |

### Tokens de Design Atuais
- **Tipografia:** Inter / Open Sans (400, 500, 700)
- **Fundo:** `--cor-bg-principal: #FDFCF8` | `--cor-bg-secundario: #F4F1EA`
- **Texto:** `--cor-texto-forte: #2A363B` | `--cor-texto-corpo: #5A666B`
- **Ação:** `--cor-primaria: #1A4D80` | `--cor-secundaria: #207556` | `--cor-destaque: #E29421`
- **Animação:** `--transition-suave: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

> ⚠️ Mudanças visuais a partir desta data caracterizam mudança de escopo e exigem aditivo de prazo conforme Seção 4 do Playbook Onda-Dev.

---

## 6. MEMÓRIA TÉCNICA (BUGS E DECISÕES)

Piloto do padrão "memória técnica por projeto" da metodologia Onda-Dev: vault Obsidian em [`./memoria-tecnica/`](./memoria-tecnica/_index.md), dentro do próprio repo, com bugs cabeludos resolvidos (causa raiz, não só sintoma) e decisões técnicas tomadas fora desta spec.

- **Antes de investigar um bug**, consultar `memoria-tecnica/bugs/` — pode já ter causa raiz documentada.
- **Antes de tomar decisão de arquitetura**, consultar `memoria-tecnica/decisoes/` — pode já existir uma decisão ativa sobre o assunto.
- **Ao resolver um bug não-trivial ou tomar uma decisão fora da spec**, registrar nota nova em `memoria-tecnica/` (templates em `memoria-tecnica/templates/`), linkando às notas relacionadas com a notação `[[nome-da-nota]]`.

---

## 7. CHANGELOG DE ESCOPO

| Data | Mudança | Fase Retornada | Impacto |
|---|---|---|---|
| — | Projeto migrado para metodologia Onda-Dev (retroativo) | Todas | Criação de CLAUDE.md e ROADMAP.md |
| 04/06/2026 | Refatoração do frontend para Arquitetura Orientada a Features (Screaming Architecture) | — (estrutural, sem retorno de fase) | Criação de `src/app/core/` (componentes/serviços/hooks compartilhados) e `src/app/features/` (Alunos, Voluntarios, Embaixadores, AmigosMelvin, Avisos, Cestas); aliases `@core`/`@features`/`@site` em Vite + jsconfig. Apenas pastas e caminhos de import alterados — zero mudança de UI, comportamento, rotas ou testes E2E. `src/site/` preservado. |
| 06/06/2026 | Correção crítica do fluxo Amigos do Melvin + CPF | — (correção/evolução, sem retorno de fase) | **Incidente:** erro no cadastro com cobrança em dobro e webhook nunca reconciliando (`/api/v1/webhooks/payments` 404 por rewrite do nginx). **Correções:** webhook remapeado para `/v1/webhooks/payments`; idempotency key + timeouts no Stripe; `proxy_read_timeout` no nginx; trava de duplo-submit no frontend; volume de logs persistente; JWT removido dos logs. **Evolução:** CPF obrigatório (cifrado + blind index); deduplicação por CPF (bloqueia mesmo valor / atualiza em valor diferente); edição de CPF no painel admin. Migrations V6 (email_hash), V7 (cpf), V8 (cpf_hash). |
| 06/06/2026 | Notificação ao Instituto para doações + correção de e-mail remetente | — (evolução, sem retorno de fase) | **E-mail remetente** corrigido de `contato@institutomelvin.org` (inexistente) para `imeh@igrejadapaz.com.br` (SMTP real). **Notificações ao Instituto:** adicionadas 5 notificações via `notifyInstituto()` — novo doador, pagamento confirmado, falha de pagamento, cancelamento por webhook e cancelamento manual. E-mail admin centralizado como `@Value("${app.admin-email}")` com default `imeh@igrejadapaz.com.br`. Embaixador já usava notificação ao Instituto, agora via método centralizado. |
| 15/07/2026 | Auditoria de produção: 3 bugs de erro 500 corrigidos + configuração operacional Stripe finalizada | — (correção/evolução, sem retorno de fase) | **Correções de código:** (1) health check documentado (`/api/v1/health`) nunca existiu, retornava 403 — exposto `/actuator/health` (só status) e liberado no `SecurityConfiguration`; (2) webhook de pagamentos (`PaymentWebhookController`) vazava 500 com stack trace quando a requisição chegava sem corpo — `@RequestBody` tornado opcional, cai no tratamento 400 já existente; (3) login com matrícula inexistente retornava 500 em vez do 401 documentado na US-1.1 — `AuthorizationService.loadUserByUsername` repassava `null` de `findByLogin`, violando o contrato de `UserDetailsService`; agora lança `UsernameNotFoundException`. **Operacional (Stripe Dashboard):** Customer Portal configurado (cancelamento fim-de-ciclo + troca de cartão), e-mails automáticos de cartão expirando/falha ativados, Radar CVC ativado, logo/ícone do Instituto subidos em Branding. Radar CEP **não** ativado (formulário usa `hidePostalCode: true`, regra ficaria inerte — decisão documentada no `DEPLOY_CHECKLIST.md`). Backup do banco e checklist final de deploy verificados e marcados. |


## Diretivas de Gestão (Regra de Ouro do Trello)
> **ATENÇÃO:** Toda vez que você (Claude/IA) criar, modificar ou deletar qualquer especificação funcional ou técnica nos arquivos `CLAUDE.md`, `ROADMAP.md`, `docs/spec.md` ou `design/DESIGN.md`, você é **OBRIGADO** a executar o script `./scripts/trello_sync.py` para espelhar essa exata alteração no Trello correspondente (criando cards no Backlog, atualizando os Critérios de Aceite ou arquivando o que foi cancelado). Documentação e Trello são a mesma entidade.

