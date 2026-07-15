# Documentação Técnica: Sistema Melvin
*Versão 2.0 — Maio/2026 | Atualizado a partir da documentação original v1.0*

---

## 1. Visão Geral

O Sistema Melvin é uma plataforma web de gestão completa para o **Instituto Social Melvin**, cobrindo gerenciamento de alunos, voluntários, doações, frequência, comunicados e finanças. A arquitetura é dividida em três camadas orquestradas via Docker.

### 1.1 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Java 21 + Spring Boot 3.3.x |
| Banco de Dados | PostgreSQL |
| Segurança | Spring Security + JWT + Argon2 |
| Pagamentos | Stripe (SDK nativo + Webhooks) |
| E-mail | Spring Boot Starter Mail (SMTP, @Async) |
| Infraestrutura | Docker + Docker Compose + Nginx |
| Testes Frontend | Cypress (E2E) |
| Testes Backend | JUnit 5 + Spring Test |

### 1.2 Topologia de Rede

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

---

## 2. Estrutura do Projeto

```
sistema-melvin/
├── frontend/                        # SPA React/Vite
│   └── src/
│       ├── pages/                   # Telas da aplicação
│       │   ├── Login/               # Tela de login
│       │   ├── HomeApp/             # Dashboard principal
│       │   ├── Config/              # Configurações e auto-frequência
│       │   ├── ConfiguracoesPermissoes/ # RBAC (gestão de permissões)
│       │   ├── Relatorios/          # Exportações e relatórios
│       │   ├── Rendimento/          # Notas e avaliações
│       │   ├── lista/               # Listagens (Alunos, Voluntários, etc.)
│       │   ├── forms/               # Formulários de cadastro/edição
│       │   └── frequencias/         # Ponto eletrônico (alunos e voluntários)
│       ├── components/              # Componentes reutilizáveis de UI
│       ├── services/                # http.js, auth.js, requests/
│       ├── hooks/                   # usePermissions, useAlunos, etc.
│       └── site/                    # Landing page pública
├── sistema/                         # Backend Spring Boot
│   └── src/main/java/.../sistema/
│       ├── domain/                  # Módulos de negócio (DDD simplificado)
│       │   ├── amigomelvin/         # Doações + Stripe
│       │   ├── aviso/               # Comunicados
│       │   ├── cestas/              # Cestas básicas
│       │   ├── dashboard/           # Métricas e rankings
│       │   ├── diario/              # Arquivos de acompanhamento
│       │   ├── discente/            # Alunos
│       │   ├── embaixador/          # Embaixadores/parceiros
│       │   ├── frequencia/          # Ponto eletrônico
│       │   ├── imagem/              # Gestão de imagens/mídias
│       │   ├── permissao/           # RBAC dinâmico
│       │   └── voluntario/          # Voluntários
│       ├── security/                # JWT, filtros, AuthController
│       ├── config/                  # Configurações globais de beans
│       └── shared/                  # Utilitários compartilhados
├── postgres/                        # Init scripts do banco
├── docker-compose.yml               # Produção
├── docker-compose.dev.yml           # Desenvolvimento com HMR
├── dev.sh                           # Script de desenvolvimento
├── deploy.sh                        # Deploy local/produção
├── deploy-remote.sh                 # Deploy remoto via rsync+SSH
├── backup.sh                        # Backup automático do banco
└── .env                             # Variáveis de ambiente (não versionar)
```

---

## 3. Modelos de Dados (Entidades)

### 3.1 Discente (Aluno)
Campos principais: `matricula` (única, 7 dígitos — ex: `2026001`), `nome`, `dataNascimento`, `responsavel`, `contatoResponsavel`, `sala`, `status` (`ATIVO`, `INATIVO`, `EM_ESPERA`), `karate` (boolean), `ballet` (boolean), `informatica` (boolean), e demais aulas extras.

**Regra de Matrícula:** O backend busca a maior matrícula do ano corrente via `findTopByOrderByMatriculaDesc` e incrementa. Matrículas legadas de 8 dígitos (ex: `20247001`) são preservadas.

### 3.2 Voluntario
Campos principais: `matricula` (única, sequência independente da de alunos), `nome`, `funcao`, `contato`, `disponibilidade` (segunda a sexta), `salas[]` (lista de turmas), `status`.

**Regra de Múltiplas Salas:** Um voluntário pode estar vinculado a múltiplas salas/disciplinas simultaneamente.

### 3.3 FrequenciaDiscente / FrequenciaVoluntario
Campos: `matricula`, `nome`, `sala`, `data` (LocalDate), `presenca_manha` (`P`/`F`/`FJ`), `presenca_tarde` (`P`/`F`/`FJ`), `justificativa`.

Chave de unicidade lógica: `matricula + data`. Operações de consulta e exclusão usam `findByMatriculaAndData` e `deleteByMatriculaAndData`.

### 3.4 AmigoMelvin (Doador)
Campos: `id` (UUID), `nome`, `email` (cifrado), `cpf` (cifrado, armazenado como `xxx.xxx.xxx-xx`), `contato` (cifrado), `emailHash` / `cpfHash` (*blind index* HMAC para deduplicação sem descriptografar), `formaPagamento`, `valorMensal`, `status` (enum `DonorStatus`: `PENDING`, `ACTIVE`, `INACTIVE`, `CANCELLED`), `stripeCustomerId`, `subscriptionId`, `mesesContribuindo`, `dataInicio`, `lastProcessedInvoiceId` (idempotência de webhook), `diaPreferido`, `mensagem`.

O **CPF é obrigatório** no cadastro (validação de dígitos via `@CPF`). A **deduplicação é por CPF**: mesmo CPF com assinatura ativa/pendente no **mesmo valor** retorna `409`; com **valor diferente**, a assinatura existente é **atualizada** no Stripe (não cria nova).

**Subentidade DoacaoItem:** Registra individualmente cada cobrança/fatura Stripe vinculada a um doador.

### 3.5 PermissaoRegra
Campos: `id` (UUID), `role` (String — ex: `PROFESSOR`, `COORDENADOR`), `permissao` (String — ex: `EDITAR_ALUNO`, `VER_FREQUENCIA`, `EXPORTAR_RELATORIO`).

Cada linha representa: "o cargo X pode executar a ação Y". O backend valida isso dinamicamente via Spring Security antes de cada operação.

### 3.6 Demais Entidades

| Entidade | Campos principais |
|---|---|
| `Aviso` | `titulo`, `corpo`, `status`, `data_inicio`, `data_final`, imagem atrelada |
| `Cestas` | `nome`, `contato`, `rede`, `lider_celula`, `responsavel`, `dataEntrega` |
| `Embaixador` | `nome`, `apelido`, `descricao`, `instagram`, `contato`, `status`, imagem atrelada |
| `Diario` | `matriculaAtrelada` (única), `fileName`, `fileType`, `filePath` |
| `Imagem` | `idAtrelado`, `tipo` (ex: `embaixador`, `aviso`), `fileName`, `filePath` |

---

## 4. Módulos e Regras de Negócio

### 4.1 Autenticação e Sessão (JWT)
1. Usuário acessa `/login`, informa matrícula e senha.
2. Backend (`AuthenticationController`) valida contra `User` + Argon2.
3. `TokenService` gera JWT assinado com `JWT_SECRET` (injetado via `.env`).
4. Token armazenado em cookie. O interceptor `http.js` o injeta em todas as requisições via header `Authorization: Bearer <token>`.
5. `SecurityFilter` valida o token e carrega permissões RBAC a cada requisição.
6. `PrivateRoute.jsx` protege rotas no Frontend — redireciona para `/login` se não autorizado (403).

### 4.2 RBAC Dinâmico (Permissões)
- O Administrador acessa `/app/config/permissoes` e configura via checkboxes quais ações cada cargo pode executar.
- Cada regra é persistida como uma linha em `PermissaoRegra`.
- **Dupla validação:** O Frontend oculta botões e menus via `usePermissions`. O Backend bloqueia na camada de serviço/security, retornando `403 Forbidden` se a permissão não existir.
- Permissões disponíveis incluem: `VER_ALUNO`, `EDITAR_ALUNO`, `CRIAR_ALUNO`, `DELETAR_ALUNO`, `VER_FREQUENCIA`, `EDITAR_FREQUENCIA`, `VER_VOLUNTARIO`, `GERENCIAR_CESTAS`, `GERENCIAR_AMIGOS`, `EXPORTAR_RELATORIO`, entre outras.

### 4.3 Módulo Amigos do Melvin (Stripe)

**Fluxo de Assinatura Mensal:**
1. Visitante preenche dados na landing page → escolhe valor mensal.
2. Frontend envia token do cartão diretamente à Stripe (`pk_live/pk_test`). Dados do cartão **nunca** passam pelo backend Melvin.
3. Backend recebe `SubscriptionRequestDTO` (com **CPF obrigatório**), valida duplicidade por CPF e chama `StripeService.createCustomer()/createSubscription()` com **idempotency key**. O SDK Stripe usa timeouts explícitos (connect 10s / read 20s) para não estourar o gateway timeout do nginx.
4. Doador é salvo no banco com `DonorStatus.PENDING`.
5. Stripe processa a cobrança de forma assíncrona.
6. Stripe envia `POST` para a URL pública `…/api/v1/webhooks/payments` com evento `invoice.paid`. **Atenção ao roteamento:** o nginx (host e container) faz `proxy_pass` removendo o prefixo `/api/`, então o controller é mapeado em `/v1/webhooks/payments` (e liberado nesse path no Spring Security).
7. `PaymentWebhookController` valida assinatura via `Stripe-Signature` header + `STRIPE_WEBHOOK_SECRET`.
8. Backend atualiza o doador para `DonorStatus.ACTIVE` (idempotente via `lastProcessedInvoiceId`). E-mail de confirmação é disparado via `@Async`. O Instituto também é notificado por e-mail (`notifyInstituto`).

**Fluxo de Doação Única (OneTime):**
- `OneTimeDonationDTO` permite doações avulsas sem criação de assinatura recorrente.

**Fluxo de Cancelamento:**
- **Autoatendimento:** O doador acessa o Stripe Customer Portal através de um link recebido por e-mail para gerenciar ou cancelar sua assinatura.
- **Manual (Painel Admin):** O administrador clica em "Cancelar Assinatura no Stripe" na tela de edição do doador.
- O backend (`AmigoMelvinService.cancelarAssinaturaManual`) se comunica com a Stripe via SDK (`stripeService.cancelSubscription`), atualiza o status no banco para `CANCELLED`, dispara um e-mail automático de encerramento ao doador e notifica o Instituto.

**Recursos Avançados Stripe Configurados:**
- **Smart Retries:** Retentativas inteligentes de cobrança ativadas no Stripe Dashboard (até 8 tentativas em 2 semanas) antes de marcar como Inadimplente/Cancelado.
- **Radar Antifraude:** Regra de bloqueio por falha de CVC ativada. Regra de bloqueio por CEP **não** ativada — o formulário de doação usa `hidePostalCode: true` no Stripe Elements e nunca coleta o campo, então essa regra ficaria sempre inerte (ver `DEPLOY_CHECKLIST.md`, seção 2.1.4).
- **Notificações Automáticas:** Disparos nativos da Stripe para falhas de cartão e cartões expirando, com links seguros de atualização (Customer Portal).
- **Notificações ao Instituto:** O sistema envia cópia de todos os eventos relevantes (novo doador, pagamento confirmado, falha de pagamento, cancelamento) para o e-mail administrativo via `EmailService.notifyInstituto()`. O e-mail admin é configurável via `app.admin-email` (default: `imeh@igrejadapaz.com.br`). **Remetente SMTP:** `imeh@igrejadapaz.com.br`.

### 4.4 Módulo de Frequência (Ponto Eletrônico)
- **Alunos:** `Aluno_frequencia` — permite lançar presença/falta por sala e data, com código `P`/`F`/`FJ` para manhã e tarde.
- **Voluntários:** `Voluntario_frequencia` — mesmo padrão.
- **Auto-frequência:** Na página de `Config`, o voluntário logado pode registrar a própria presença.
- **Alerta de Faltas:** O domínio de frequência possui `FaltaAlertaDTO` para identificar alunos com alto índice de ausências.

### 4.5 Módulo Diário / Rendimento
- Professores fazem upload de arquivos (PDF, docs) vinculados à matrícula do aluno.
- `DiarioService` persiste o arquivo no servidor no diretório configurado em `application.properties` (`file.upload-dir-diarios`).
- `Rendimento` no Frontend agrega notas, avaliações e histórico de frequência em um painel único por aluno.
- `DashboardService` expõe `AlunoRankingDTO` com rankings de frequência/rendimento.

### 4.6 Módulo de Imagens
- `ImagemController` permite upload/troca de imagens vinculadas a entidades via `idAtrelado` + `tipo`.
- Usado atualmente para: foto de **Embaixadores** (`tipo: "embaixador"`) e banner de **Avisos** (`tipo: "aviso"`).
- Arquivos servidos estaticamente via `WebConfig.java` a partir dos diretórios `/app/docs/`.
- **Roadmap:** Expansão futura para permitir que a equipe do Instituto atualize textos e imagens do site público diretamente pelo painel administrativo (CMS leve), sem necessidade de intervenção técnica.

---

## 5. API REST — Endpoints Principais

| Método | Endpoint | Função |
|---|---|---|
| `POST` | `/auth/login` | Autenticação — retorna JWT |
| `GET` | `/discente` | Lista todos os alunos |
| `POST` | `/discente` | Cadastra novo aluno |
| `PUT` | `/discente/{matricula}` | Atualiza dados do aluno |
| `DELETE` | `/discente/{matricula}` | Remove aluno |
| `GET` | `/voluntario` | Lista voluntários |
| `GET` | `/frequenciadiscente` | Lista frequências de alunos |
| `POST` | `/frequenciadiscente` | Registra frequência |
| `GET` | `/frequenciavoluntario` | Lista frequências de voluntários |
| `GET` | `/cestas` | Lista cestas básicas |
| `GET` | `/embaixadores` | Lista embaixadores |
| `GET` | `/amigosmelvin` | Lista doadores |
| `POST` | `/amigosmelvin/subscribe` | Cria assinatura Stripe |
| `POST` | `/webhooks/payments` | Webhook Stripe (invoice.paid) |
| `GET` | `/aviso` | Lista avisos |
| `POST` | `/imagem` | Upload de imagem |
| `GET` | `/permissao` | Lista regras RBAC |
| `POST` | `/permissao` | Cria/atualiza regra RBAC |
| `GET` | `/dashboard` | Dados do painel principal |
| `GET` | `/actuator/health` | Health check (Spring Boot Actuator, público) |

---

## 6. Segurança e LGPD

| Mecanismo | Detalhe |
|---|---|
| Hashing de Senhas | Argon2 (resistente a GPU e rainbow tables) |
| Minimização de Dados (LGPD) | Uso estrito de DTOs nas listagens para evitar tráfego massivo de prontuários, dados financeiros e contatos |
| Soft Delete & Anonimização | Exclusão lógica (Inativação) combinada com anonimização ativa de dados de saúde e contatos (Art. 18, LGPD) |
| Tokens de Sessão | JWT com expiração, assinado com `JWT_SECRET` via `.env` |
| RBAC | Dupla validação: Frontend (hooks) + Backend (Spring Security filters) |
| Webhooks | Assinatura validada via `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET` |
| CORS | Origens autorizadas via variável de ambiente `FRONTEND_URL` |
| Isolamento de Rede | PostgreSQL inacessível externamente (apenas rede interna Docker) |
| Secrets | Nenhum segredo hardcoded; tudo via `.env` injetado pelo Docker |

---

## 7. Infraestrutura e Deploy

### 7.1 Variáveis de Ambiente Necessárias (`.env`)
```env
# Banco de Dados
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DB=sistemamelvin

# JWT
JWT_SECRET=...

# Frontend
FRONTEND_URL=https://institutomelvin.org
VITE_REACT_APP_FETCH_URL=https://institutomelvin.org/api

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# E-mail (SMTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=...
SPRING_MAIL_PASSWORD=...
```

### 7.2 Scripts de Automação

| Script | Função |
|---|---|
| `./dev.sh` | Sobe banco + backend + frontend com HMR (porta 3001) |
| `./deploy.sh` | Build e sobe containers de produção localmente |
| `./deploy-remote.sh` | Rsync para VPS + deploy remoto via SSH |
| `./backup.sh` | Dump `.sql.gz` do banco + limpeza de backups > 30 dias |
| `monitor_melvin.sh` | Monitora memória do container, detecta OOM e reinicia preventivamente |

### 7.3 Configuração JVM (Dockerfile Backend)
```dockerfile
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```
Limites explícitos para evitar o erro crônico 504 por exaustão de heap.

---

## 8. Testes Automatizados

### 8.1 Frontend — Cypress (E2E)
```bash
cd frontend
npm run cypress:run   # Headless
npm run cypress:open  # Interativo
```
Suítes: `discentes.cy.js`, `voluntarios.cy.js`, `frequencias.cy.js`, `auth.cy.js`, `permissao.cy.js`, `dynamic_permissions_ui.cy.js`.

### 8.2 Backend — JUnit 5
```bash
cd sistema
./mvnw test
```
Testes: `DiscenteServiceTest`, `CestasServiceTest`, `AmigoMelvinServiceTest`, `DiarioServiceTest`, `AvisoServiceTest`, `TokenServiceTest`, `SistemaApplicationTests`.

---

## 9. Acesso ao Sistema

| Ambiente | URL | Porta |
|---|---|---|
| Produção | https://institutomelvin.org | 443 (Nginx) |
| Desenvolvimento Frontend | http://localhost:3001 | 3001 (Vite HMR) |
| Desenvolvimento Backend | http://localhost:8443 | 8443 |
| **Credencial de Teste (Admin)** | Matrícula: `20247001` / Senha: `admin` | — |

---

*Documentação mantida em `docs/DOCUMENTACAO_TECNICA.md`. Atualize junto a cada release.*
