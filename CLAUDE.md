# 📘 CLAUDE.md — Especificação Viva do Sistema Melvin

> **Última atualização:** 12/08/2026
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
| **Testes Frontend** | Playwright (E2E — 17 suítes) |
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

#### US-3.7: Registrar Ocorrências do Aluno
**Status:** ✅ Concluído (10/08/2026, ver ROADMAP.md Módulo 12).

**Como** professor,
**eu quero** registrar observações comportamentais e pedagógicas pontuais sobre um aluno,
**para que** o histórico fique documentado e não dependa só da minha memória.

**Critérios de Aceite:**
```gherkin
Dado que o professor está na ficha do aluno,
Quando ele registra uma ocorrência com categoria (comportamental/pedagógica), descrição e data,
Então a ocorrência é salva vinculada à matrícula do aluno e ao autor (professor), com timestamp.

Dado que existem múltiplas ocorrências para um aluno,
Quando um coordenador ou diretor abre a ficha do aluno,
Então vê o histórico completo em ordem cronológica (mais recente primeiro).

Dado que um usuário sem a permissão GERENCIAR_OCORRENCIA tenta registrar uma ocorrência,
Quando ele submete a requisição,
Então o backend retorna 403 Forbidden.
```

> **Nota de implementação (atualizada na entrega):** entidade `Ocorrencia` nova (`matricula_discente`, `categoria` enum `COMPORTAMENTAL`/`PEDAGOGICA`, `descricao` cifrada via `SensitiveDataConverter`, `autor_login`, `data_ocorrencia`, `criado_em`). Autor identificado pelo `login` (matrícula) do usuário autenticado, não por UUID — evita join só pra exibir "quem registrou". Ordenação cronológica feita via `@Query` JPQL explícita (não método derivado), mesmo padrão já usado em `FrequenciaDiscenteRepository` para campos com underscore no nome. Endpoint `POST /ocorrencias` + `GET /ocorrencias/discente/{matricula}`, ambos atrás da permissão dinâmica `GERENCIAR_OCORRENCIA` (`[PROF, COOR, DIRE, ADM]`) — inclusive a leitura, mais restrita que `VISUALIZAR_ALUNOS` (que também libera ASSIST/PSICO), decisão deliberada dado o teor comportamental sensível do dado. Sem endpoint de tela dedicada "ficha do aluno" no sistema — a seção de Ocorrências foi anexada à própria tela de edição de Aluno (`Form.jsx`), que já cumpre esse papel hoje.

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

#### US-5.5: Notificação Automática de Falta ao Responsável
**Status:** ✅ Concluído (10/08/2026, ver ROADMAP.md Módulo 11).

**Como** coordenador,
**eu quero** que o responsável pelo aluno receba um aviso automático assim que uma falta é registrada,
**para que** a família seja informada no mesmo dia, sem a coordenação precisar ligar — ajudando a identificar cedo sinais de vulnerabilidade da família.

**Critérios de Aceite:**
```gherkin
Dado que um professor registra presencaManha="F" ou presencaTarde="F" para um aluno com e-mail de responsável cadastrado,
Quando o registro de frequência é salvo,
Então um e-mail assíncrono é disparado ao responsável no mesmo dia, informando data e turno da falta.

Dado que o aluno não possui e-mail de responsável cadastrado,
Quando a falta é registrada,
Então a frequência é salva normalmente (sem quebrar o fluxo) e nenhum e-mail é enviado.
```

> **Nota de implementação (atualizada na entrega):** campo novo `email_responsavel` em `Discente` (cifrado via `SensitiveDataConverter`) — nome em snake_case pra seguir a convenção real do arquivo (`contato_pai`/`contato_mae`/`contato_saida`), não `emailResponsavel` como cogitado inicialmente. Migration `V12__Add_email_responsavel_to_discente.sql`. Reaproveitado `EmailService.sendEmail()` (`shared/service/EmailService.java`), chamado a partir de `FrequenciaDiscenteService.cadastrar()`. Campo adicionado também ao formulário de Aluno (frontend), seção "Contexto Familiar" — sem isso a coluna nova nunca seria preenchida por ninguém.
>
> Esta US cobre só a versão e-mail (🟢 Pequeno, como aprovado). O cliente perguntou se o aviso "daria pra ser no WhatsApp" — decisão registrada em 11/08/2026: **vira item formal de Backlog** (ver US-5.6 abaixo), não é feito agora.

#### US-5.6: Notificação de Falta via WhatsApp
**Status:** 🔲 Backlog — decisão do cliente em 11/08/2026: aprovado como item futuro, não priorizado ainda. Substitui a "Nota de escopo pendente de decisão" que existia aqui.

**Como** coordenador,
**eu quero** que o aviso de falta (US-5.5) também possa ser enviado por WhatsApp, além do e-mail,
**para que** a família seja alcançada num canal que ela de fato usa no dia a dia.

**Critérios de Aceite (a refinar quando este item for priorizado):**
```gherkin
Dado que um aluno falta e o responsável tem WhatsApp cadastrado,
Quando o e-mail de aviso é disparado (US-5.5),
Então uma mensagem equivalente é enviada também por WhatsApp, pelo provedor contratado.

Dado que o envio por WhatsApp falha,
Quando isso acontece,
Então o e-mail continua sendo enviado normalmente — WhatsApp nunca deve derrubar o canal que já funciona.
```

> **Levantamento de custo (10/08/2026):**
> - **Via API oficial (Meta/WhatsApp Business Platform):** não é gratuita, mas também não é cara por mensagem — notificação de falta se enquadra em categoria "utilidade" (mensagem transacional ligada a um evento), tabelada em ~R$0,04–0,09 por envio no Brasil em 2026. O custo que realmente pesa não é a Meta, é a **mensalidade de um provedor/BSP** (Twilio, Zenvia, 360dialog etc.) — na faixa de R$200–1.200/mês no Brasil. Pro volume baixo do Instituto (poucas faltas/dia), o custo por mensagem seria irrisório, mas a mensalidade fixa do BSP pode não compensar.
> - **Via biblioteca não-oficial** (ex. Baileys/whatsapp-web.js): sem mensalidade nem custo por mensagem, mas **viola os Termos de Uso do WhatsApp** — risco real de banimento do número, sem suporte oficial, quebra quando o WhatsApp muda o protocolo. Não recomendado pra uso institucional sem deixar esse risco explícito pro cliente.
> **Peso estimado:** 🟡 Médio (pela integração com o BSP), não 🔴 — o item 🔴 Grande da proposta original considerava o módulo cheio de "Notificações via WhatsApp"; este escopo é menor, plugado no gatilho que a US-5.5 já criou.
> **Antes de priorizar:** decidir com o cliente o provedor/BSP (custo mensal recorrente é o fator decisivo, não o preço por mensagem) e se a mensalidade se justifica pelo volume real de faltas do Instituto.

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

#### US-7.4: Solicitar Cesta Básica com Agendamento e Confirmação de Entrega
**Status:** ✅ Concluído (10/08/2026, ver ROADMAP.md Módulo 13). Substitui, no pedido do cliente, o item originalmente proposto como "Confirmação de leitura em avisos" — motivado por problemas reais na entrega de cestas.
**Revisado em 12/08/2026 (duas vezes):** primeiro o check-in por QR Code saiu do escopo (confirmação virou manual, direto na tela); depois, no mesmo dia, o dono do projeto esclareceu que o pedido original do cliente sempre foi ter o QR Code — a remoção tinha sido uma decisão técnica interna, não um pedido do cliente. QR Code **reintroduzido como caminho principal** de confirmação de entrega, com a confirmação manual (já construída) mantida como caminho **alternativo**. Ver nota de implementação atualizada abaixo.

**Como** líder de qualquer nível da hierarquia da igreja (célula, setor, área, distrito ou rede),
**eu quero** solicitar uma cesta básica em nome de um membro de célula, através de um link, sem precisar ligar ou ir pessoalmente até o instituto,
**para que** o pedido chegue formalizado até a coordenação para validação, não importa em qual nível eu esteja na hierarquia.

> **Hierarquia do Instituto (explicada pelo cliente, 10/08/2026):** o Instituto Melvin faz parte de uma igreja organizada em pequenos grupos (células). A estrutura, do menor pro maior nível, é: **pequeno grupo/célula → setor (liderado pelo *supervisor*) → área → distrito → rede**. "Supervisor" não é sinônimo de "líder de célula" nem de "rede" — é especificamente o líder de um *setor* (um nível acima da célula, um nível abaixo da área).
>
> **Correção de escopo (10/08/2026):** o cliente esclareceu que **qualquer nível pode solicitar**, não só o supervisor — o pedido é sempre *para um membro de uma célula específica*, mas quem preenche o link pode ser o próprio líder da célula, o supervisor do setor dela, ou alguém ainda mais acima (área/distrito/rede). O link não deve travar em um nível fixo; a solicitação precisa registrar **quem** pediu e **de qual nível**, além de qual célula/beneficiário é o destino da cesta.

**Como** coordenador,
**eu quero** validar as solicitações recebidas, definir a data de retirada e confirmar a entrega quando o beneficiário retira a cesta,
**para que** o instituto tenha rastreabilidade real de quem retirou cada cesta — resolvendo a falta de controle na entrega relatada pelo cliente.

**Critérios de Aceite:**
```gherkin
Dado que um líder (de qualquer nível: célula, setor, área, distrito ou rede) acessa o link público de solicitação de cesta,
Quando ele informa seu nome, seu nível na hierarquia, e os dados do beneficiário/célula, e envia,
Então a solicitação é criada com status SOLICITADA e a coordenação é notificada por e-mail (com todos os dados do pedido, inclusive contato do beneficiário e observações).

Dado que uma solicitação está com status SOLICITADA,
Quando o coordenador valida e define a data de retirada,
Então o status muda para AGENDADA e a solicitação passa a aparecer na lista "Aguardando retirada".

Dado que uma solicitação foi validada e agendada,
Quando o sistema gera o QR Code de retirada,
Então, se o solicitante informou e-mail no formulário, ele recebe automaticamente o QR Code em anexo junto com a data de retirada.

Dado que o beneficiário comparece no dia agendado para retirar a cesta portando o QR Code,
Quando a equipe do instituto escaneia o código (pela câmera embutida na tela ou colando o texto decodificado),
Então o status muda para ENTREGUE, com data/hora da confirmação registrada.

Dado que o QR Code não está disponível na hora da retirada (perdido, e-mail não veio, etc.),
Quando a equipe do instituto clica em "Confirmar Entrega" (por nome) na solicitação correspondente,
Então o status muda para ENTREGUE do mesmo jeito — o caminho alternativo nunca fica bloqueado pelo principal.

Dado que uma solicitação já está ENTREGUE,
Quando alguém tenta confirmar a entrega dela de novo (por QR Code ou manualmente),
Então o sistema recusa a ação e exibe "já foi confirmada como entregue em [data/hora]" (evita dupla contagem de entrega).
```

> **Nota de implementação (atualizada na entrega):** máquina de estados nova (`SOLICITADA → AGENDADA → ENTREGUE`, com `CANCELADA` previsto no enum como saída) sobre `Cestas`, reintroduzindo o campo `status` — nullable, para que os cadastros diretos já existentes (sem fluxo de solicitação) fiquem com `status` NULL e sigam distinguíveis das solicitações reais. Campos do solicitante genéricos (`nomeSolicitante` + `nivelSolicitante`, enum `CELULA/SETOR/AREA/DISTRITO/REDE`), não um campo fixo por nível — o beneficiário/célula continua identificado por `lider_celula`/`rede`, que já existiam. Migration `V14`.
>
> **Segurança do endpoint público:** `POST /cestas/solicitacao` é `permitAll` (mesmo padrão de `/amigomelvin`), mas — diferente dos demais endpoints públicos — recebeu **rate limit** (5 solicitações/hora por IP, Bucket4j), por ser o único que dispara um fluxo de trabalho interno da coordenação. Decisão e trade-offs em `memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md`. O service **ignora campos de fluxo interno vindos no payload** (`status`, `entregueEm`, `id`): a solicitação sempre nasce em `SOLICITADA` — payload público não consegue forjar uma cesta já entregue.
>
> **QR Code: removido e reintroduzido no mesmo dia (12/08/2026).** Primeira revisão: check-in por QR Code saiu do escopo, confirmação virou manual por ID (`QrCodeService`, ZXing e a coluna `qr_code_token` removidos; migration `V14` editada antes de ir a produção). Segunda revisão, horas depois: esclarecido que o pedido original do cliente ("acessar o formulário através de um link ou QRCODE") sempre incluiu QR Code — a remoção anterior tinha sido overengineering cortado sem necessidade real. Reintroduzido como **caminho principal**, com a confirmação manual (que já estava em produção) virando o **caminho alternativo**, não descartada.
>
> **Design do check-in por QR Code (reintroduzido):** na validação (`SOLICITADA → AGENDADA`), o sistema sempre gera um `qrCodeToken` (UUID aleatório, não adivinhável) — independente de e-mail cadastrado, pra coordenação sempre poder ver/baixar manualmente (`GET /cestas/solicitacoes/{id}/qrcode`). Se o solicitante informou e-mail no formulário público (campo novo, opcional, cifrado como os demais contatos), o QR Code (PNG via ZXing) é enviado automaticamente por e-mail em anexo assim que a coordenação agenda a retirada — `EmailService` ganhou `sendEmailComAnexo()`. **Por que e-mail do solicitante, não do beneficiário:** o beneficiário nunca interage com o sistema (só é citado no formulário); o solicitante (o líder que preencheu o pedido) tem uma relação contínua com ele e repassa/imprime o QR Code antes da retirada. Na hora da entrega, a equipe do Instituto confirma pela tela interna (autenticada) — nunca o beneficiário diretamente, que não tem login — via `POST /cestas/solicitacao/checkin/{token}`, alimentado tanto por um campo de colar o texto decodificado quanto por um scanner de câmera embutido (`html5-qrcode`, câmera traseira). Falha ao gerar/enviar o QR Code por e-mail é best-effort — não derruba a validação, que já foi persistida (o caminho alternativo continua de pé).
>
> **Migration `V15`** (não editou a `V14`, que já tinha ido a produção entre as duas revisões): `email_solicitante` (cifrado, nullable) e `qr_code_token` (nullable, unique) em `cestas`.
>
> **Link público sem `#` (12/08/2026):** para uso em QR Codes/links compartilhados com supervisores e líderes externos, `/solicitarcesta` passou a ser renderizado fora do `HashRouter` que o resto do app usa (que produz URLs com `/#/`) — acessível como `institutomelvin.org/solicitarcesta`, uma URL limpa. O Nginx de produção já tinha fallback de SPA (`try_files ... /index.html`) configurado, então isso não exigiu mudança de infraestrutura.
>
> **Permissões:** validação, check-in (por ID ou por token) e visualização do QR reaproveitam `GERENCIAR_CESTAS` (já existente). A permissão `SOLICITAR_CESTA` cogitada na especificação **não foi criada** — perdeu o sentido quando o cliente esclareceu que qualquer nível da hierarquia pode solicitar, sem cadastro prévio no sistema (o link é aberto, protegido por rate limit em vez de permissão).

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

### ÉPICO 11: CENTRAL DE AJUDA (MANUAL DO SISTEMA)

**Escopo:** Documentação de uso do sistema, acessível de dentro da área logada, para os voluntários de qualquer cargo.

#### US-11.1: Consultar Manual do Sistema
**Como** voluntário de qualquer cargo (COOR, PROF, AUX, COZI, DIRE, ADM, MARK, ZELA, PSICO, ASSIST),
**eu quero** acessar, a partir da tela de Configurações, um manual explicando cada funcionalidade do sistema com prints das telas reais,
**para que** eu aprenda a usar o sistema sem depender de suporte humano, respeitando o que meu cargo tem permissão para ver e fazer.

**Critérios de Aceite:**
```gherkin
Dado que o usuário está autenticado com qualquer cargo,
Quando ele acessa a tela de Configurações (/app/config),
Então vê o botão "Manual do Sistema" disponível para todos os cargos (não apenas ADM).

Dado que o usuário clica no botão "Manual do Sistema",
Quando a navegação ocorre,
Então o sistema abre /app/manual com o conteúdo organizado por funcionalidade (Perfis de Acesso, Alunos, Voluntários, Frequência, Cestas, Avisos, Embaixadores, Amigos do Melvin, Relatórios, Permissões, Administração).

Dado que o usuário está lendo uma seção do manual,
Quando a seção descreve um passo que corresponde a uma tela do sistema,
Então esse passo exibe um print real dessa tela, não apenas texto.

Dado que uma seção documenta uma funcionalidade restrita a determinados cargos (ex: Permissões, exclusiva de ADM),
Quando qualquer usuário lê essa seção,
Então o texto indica explicitamente quais cargos têm acesso a ela, mesmo que o leitor não seja um deles.
```

> **Nota de implementação:** rota `/app/manual` reaproveita o mesmo array de cargos (`perfisEquipe`) usado nas demais rotas internas — não é uma permissão dinâmica nova, é documentação, então todo mundo com login no sistema pode ler, independente do que pode *fazer*. Botão adicionado em `Config.jsx` fora do bloco `{isAdm && (...)}`, como primeiro card da página (antes de "Meu Perfil"), para ficar visível a qualquer cargo assim que a tela carrega. Prints capturados via Playwright (mesmo mecanismo de mock de autenticação/API já usado nas suítes E2E, `frontend/tests/fixtures.js`) para refletir a UI real sem expor dados de alunos/voluntários/doadores reais — todo o conteúdo das telas capturadas usa dados fictícios de exemplo.

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
| 04/08/2026 | Auditoria de backup em produção: divergência entre o documentado (diário + criptografado) e o real (mensal + texto puro) corrigida, incluindo cópia off-site | — (correção, sem retorno de fase) | **Achado:** `docs/SEGURANCA_E_LGPD.md` e `docs/APRESENTACAO_PARA_O_INSTITUTO.md` prometiam backup diário e criptografado; o cron real (`/root/scripts/backup_postgres.sh`) rodava só 1x/mês, gerava `.sql` em texto puro, e mantinha só 1 backup por vez (retenção 30 dias + cadência mensal). Script também tinha senha do Postgres em texto puro num arquivo `755` (variável morta, nunca usada pelo `pg_dump`). **Correção:** cron alterado para diário (02h); dump agora passa por `gzip \| openssl enc -aes-256-cbc` antes de gravar (chave em `/root/scripts/.backup_encryption_key`, `chmod 600`); alerta por e-mail em falha via SMTP já existente (`SPRING_MAIL_*` do `.env`); senha morta removida; script `chmod 700`. Retenção de 30 dias agora mantém ~30 backups distintos (era 1). **Off-site:** `rclone` instalado no servidor com remote próprio (`gdrive:`, escopo `drive.file`, OAuth client dedicado no Google Cloud pra evitar rate-limit da chave compartilhada), enviando o dump cifrado pra `justinocarneiro161@gmail.com` ao final de cada execução, com retenção espelhada (30 dias) no remoto. Testado ponta a ponta com sucesso (dump → cifra → local → off-site → limpeza). Detalhes, comando de restauração e riscos pendentes (token OAuth em modo "Testando" expira em 7 dias; chave de criptografia só existe no servidor) em `memoria-tecnica/decisoes/backup-melvin-diario-criptografado.md`. **Extensão pro Sistema Lucas (mesmo dia):** o mesmo remote `gdrive:` foi reaproveitado pro backup do Lucas (projeto/repo separado, também neste servidor) — dump agora criptografado (chave própria, distinta da do Melvin) e enviado pra `gdrive:sistema-lucas-backups/`, alerta usando o SMTP do próprio Lucas (não o do Instituto). Aplicado só na cópia do script já implantada no servidor (backup do original em `backup.sh.bak_pre_20260804`) — o repositório-fonte do Lucas está fora do alcance desta sessão, então uma reimplantação futura sem essa mesma mudança reverteria o comportamento. App OAuth publicado em produção no mesmo dia (sem exigir verificação do Google, escopo `drive.file`), eliminando o risco de expiração em 7 dias. **Pendente:** estender off-site pro SAW HUB também (infra já existe, reaproveitável). |
| 10/08/2026 | Cliente aprovou 3 evoluções de escopo pós-produção (proposta de benchmark enviada, resposta do cliente via WhatsApp) | — (evolução, sem retorno de fase) | Adicionadas US-5.5 (notificação automática de falta ao responsável, 🟢 Pequeno — versão e-mail; pergunta do cliente sobre WhatsApp registrada como nota de escopo separada, não aprovada ainda), US-3.7 (registro de ocorrências do aluno, 🟡 Médio) e US-7.4 (solicitação de cesta básica com agendamento e check-in por QR Code, 🔴 Grande — substituiu no pedido do cliente o item originalmente proposto de "confirmação de leitura em avisos"; motivado por problema real relatado na entrega de cestas, sem rastreabilidade de quem retirou). Todas as 3 em status Backlog, ainda não desenvolvidas — ver ROADMAP.md Módulos 11-13. Cards espelhados no Trello (Sistema Melvin, lista Backlog). Aprovações equivalentes de Sistema Lucas (NPS pós-consulta, lembrete WhatsApp, lista de espera) ficam fora do escopo deste CLAUDE.md — projeto/repo separado — mas foram espelhadas no Trello do Lucas nesta mesma sessão. |
| 11/08/2026 | US-5.5, US-3.7 e US-7.4 implementadas (TDD) e homologadas (Fase 5); auditoria pré-deploy encontrou e corrigiu pendências adicionais; decisão do cliente sobre WhatsApp | — (implementação + correção, sem retorno de fase) | **Entrega:** as 3 US concluídas (ver ROADMAP.md Módulos 11-13), backend 72/72 → 79/79 ao longo das correções, E2E 39/49 → 49/49 (mocks tinham prefixo `/api/` divergente da `baseURL` real, destravando também o CI que estava vermelho desde 07/06/2026 por um problema não relacionado, de fronteira de import). **Homologação (Fase 5):** migrations V12-V14 validadas contra cópia do schema real de produção; achado e corrigido `cestas.data_entrega` NOT NULL herdado (500 em todo `POST /cestas/solicitacao`) e `email_responsavel` descartado em silêncio no `PUT /discente` de aluno existente. **Auditoria pré-deploy adicional:** critério de aceite da US-7.4 "coordenação é notificada" não estava implementado (corrigido); US-5.5 não notificava quando a falta era lançada por edição (`PUT`, o caminho real da tela de chamada — corrigido); tela de validação de solicitações estava sem link no menu (corrigido); vulnerabilidade de segurança no rate-limit do endpoint público (`X-Forwarded-For` lido do lado errado, burlável + vazamento de memória — corrigido, ver `memoria-tecnica/bugs/rate-limit-burlavel-por-x-forwarded-for-forjado.md`); `contato_saida` (dado de segurança, quem retira a criança) tinha o mesmo bug do `email_responsavel` — corrigido. **Decisão do cliente:** a pergunta sobre WhatsApp (US-5.5) vira item formal de Backlog — US-5.6, ROADMAP.md Módulo 14 — aprovado como trabalho futuro, não priorizado agora. Nenhum deploy em produção foi feito; produção segue na V11, aguardando liberação. |
| 12/08/2026 | Deploy em produção (V11 → V14): US-5.5, US-3.7 e US-7.4 (sem QR Code) ao vivo; ajustes finos de UI; backup off-site restaurado | — (deploy + correção, sem retorno de fase) | **Deploy:** backup pré-deploy, `rsync` + restart dos containers, migrations V12-V14 aplicadas limpas, smoke test pós-deploy (health check, login com mensagem UTF-8 correta, URL limpa `/solicitarcesta`). **UI:** contraste de texto branco-sobre-branco corrigido em Avisos/Embaixadores/Cestas (ícone de editar e rótulo do card mobile); texto de descrição de ocorrência sem espaços estourava a largura do card (`overflow-wrap`). **Infra:** token OAuth do `rclone` (backup off-site pro Google Drive) tinha sido revogado apesar de o app já estar "publicado" — reautorizado e documentado que isso pode acontecer de novo (não é garantia permanente), ver `memoria-tecnica/decisoes/backup-melvin-diario-criptografado.md`. **Pesquisa (não implementada ainda):** alternativas de notificação por WhatsApp (US-5.6) pesquisadas de novo — API oficial da Meta não tem isqenção pra mensagem proativa de utilidade desde jul/2025, mas um BSP pay-as-you-go (Twilio, sem mensalidade fixa) reduz o custo estimado de R$200-1.200/mês pra ~R$30-50/mês no volume do Instituto; segue não priorizado. |
| 12/08/2026 | QR Code da US-7.4 removido e, no mesmo dia, reintroduzido como caminho principal (confirmação manual virou caminho alternativo) | — (correção de rumo + evolução, sem retorno de fase) | O dono do projeto esclareceu que a remoção do QR Code (linha acima, feita antes do deploy) tinha sido uma decisão técnica interna, não um pedido real do cliente — o pedido original ("acessar o formulário através de um link ou QRCODE") sempre incluiu QR Code. Reimplementado com desenho mais robusto que a primeira versão: e-mail do solicitante (novo campo opcional, cifrado) recebe o QR Code em anexo automaticamente na validação; check-in por scanner de câmera embutido (`html5-qrcode`) ou colando o texto decodificado; confirmação manual por nome (já em produção) preservada como caminho alternativo, nunca bloqueado pelo QR. Migration `V15` (a `V14`, dessa vez, já estava em produção — não podia mais ser editada). Backend: 11 testes novos/adaptados em `CestasServiceTest`. Testado ponta a ponta via Docker com envio real de e-mail. Ver nota de implementação da US-7.4 acima e `memoria-tecnica/decisoes/qr-code-removido-confirmacao-manual.md` (atualizada com a reversão). |


## Diretivas de Gestão (Regra de Ouro do Trello)
> **ATENÇÃO:** Toda vez que você (Claude/IA) criar, modificar ou deletar qualquer especificação funcional ou técnica nos arquivos `CLAUDE.md`, `ROADMAP.md`, `docs/spec.md` ou `design/DESIGN.md`, você é **OBRIGADO** a executar o script `./scripts/trello_sync.py` para espelhar essa exata alteração no Trello correspondente (criando cards no Backlog, atualizando os Critérios de Aceite ou arquivando o que foi cancelado). Documentação e Trello são a mesma entidade.

