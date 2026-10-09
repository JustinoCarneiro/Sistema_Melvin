# Sistema Melvin — Histórias de Usuário e Critérios de Aceite

> Fonte canônica do escopo funcional. Resumo dos épicos e ponteiros em `CLAUDE.md`.
> Contrato de trabalho: `AGENTS.md`. Changelog de escopo: `CLAUDE.md` §7.


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
Dado que o cargo informado é válido (COOR, PROF, AUX, COZI, DIRE, ADM, MARK, ZELA, PSICO, ASSIST, TECH),
Quando o admin submete a alteração,
Então o role é atualizado e retorna 200 OK.

Dado que o cargo informado é inválido,
Quando o admin submete,
Então o sistema retorna 400 "Role inválida".
```

---

#### US-1.5: Cargo Técnico (TECH)
**Como** desenvolvedor/responsável técnico do sistema,
**eu quero** ter um cargo próprio, distinto do ADM da administração do Instituto,
**para que** minhas ações de manutenção/suporte técnico fiquem separadas das ações da administração real nos registros e ocorrências, sem abrir mão de acesso a nenhuma tela.

**Critérios de Aceite:**
```gherkin
Dado que um usuário tem o cargo TECH,
Quando ele acessa qualquer tela do sistema,
Então ele tem o mesmo nível de acesso de um ADM, inclusive às telas exclusivas (Permissões de Acesso, Calendário de Exceções, Arquivo Morto, criar/redefinir login de outros usuários).

Dado que o ADM configura as Permissões de Acesso,
Quando uma regra dinâmica libera o cargo ADM,
Então essa mesma regra também libera o cargo TECH (o TECH nunca fica com acesso a menos módulos do que o ADM).

Dado que um usuário TECH está logado,
Quando ele visualiza o cabeçalho do sistema ou o formulário de cadastro de voluntário,
Então o cargo aparece rotulado como "Suporte Técnico", não como "ADM".
```

> **Nota de implementação:** `UserRole.TECH` adicionado ao enum (ordinal 10 — armazenado como `smallint` sem `@Enumerated` explícito, exige `ALTER TABLE users` no check constraint, `migration V16`). Backend: toda checagem `hasRole("ADM")`/`hasAnyRole("ADM", ...)` em `SecurityConfiguration` ganhou `"TECH"` ao lado; `PermissaoService` espelha automaticamente TECH em qualquer regra dinâmica que já libere ADM (`espelharAdmParaTech()`, roda no boot, cobre inclusive regras já existentes em produção antes do TECH existir — não é só um default de regra nova). Frontend: `usePermissions.hasPermission` trata TECH como bypass total, igual ADM; `perfisGerais`/`perfisEquipe` e toda rota antes restrita a `role="ADM"` em `Routes.jsx` ganharam TECH; função "tecnico" nova no cadastro de Voluntário (mapeada para o cargo TECH). Sem tela de gestão de usuário "self-service" — a criação do primeiro login TECH é manual (mesma limitação de bootstrap que qualquer ADM novo: `POST /auth/register` exige estar autenticado como ADM/TECH).

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

Dado que uma solicitação está com status SOLICITADA (pendente de validação) ou AGENDADA (aguardando retirada, ex.: beneficiário não compareceu na data marcada),
Quando o coordenador clica em "Cancelar" na linha da solicitação e confirma,
Então o status muda para CANCELADA e a solicitação some das listas "Pendentes de validação" e "Aguardando retirada".

Dado que uma solicitação já está ENTREGUE ou já está CANCELADA,
Quando alguém tenta cancelá-la,
Então o sistema recusa a ação (não há cancelamento depois da entrega, nem cancelamento duplicado).

Dado que validação, cancelamento e confirmação de entrega disputam a mesma solicitação,
Quando duas dessas ações são executadas ao mesmo tempo,
Então apenas a primeira transição compatível é persistida e a outra recebe conflito sem sobrescrever o estado vencedor.
```

> **Nota de implementação (atualizada na entrega):** máquina de estados nova (`SOLICITADA → AGENDADA → ENTREGUE`, com `CANCELADA` previsto no enum como saída) sobre `Cestas`, reintroduzindo o campo `status` — nullable, para que os cadastros diretos já existentes (sem fluxo de solicitação) fiquem com `status` NULL e sigam distinguíveis das solicitações reais. Campos do solicitante genéricos (`nomeSolicitante` + `nivelSolicitante`, enum `CELULA/SETOR/AREA/DISTRITO/REDE`), não um campo fixo por nível — o beneficiário/célula continua identificado por `lider_celula`/`rede`, que já existiam. Migration `V14`.
>
> **Segurança do endpoint público:** `POST /cestas/solicitacao` é `permitAll` (mesmo padrão de `/amigomelvin`), mas — diferente dos demais endpoints públicos — recebeu **rate limit** (5 solicitações/hora por IP, Bucket4j), por ser o único que dispara um fluxo de trabalho interno da coordenação. Decisão e trade-offs em `memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md`. O service **ignora campos de fluxo interno vindos no payload** (`id`, `status`, `dataRetirada`, `entregueEm` e `qrCodeToken`): a solicitação sempre nasce limpa em `SOLICITADA` — o payload público não consegue forjar entrega nem reutilizar token de QR.
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
>
> **Cancelamento (08–09/10/2026):** pedido do cliente — cancelar solicitações pendentes de validação, e cancelar agendamentos quando o beneficiário não comparece na data de retirada. `CANCELADA` já existia no enum `StatusCesta` desde a V14 mas estava morto (nenhum código o usava); fechado agora com `cancelar(UUID id)` em `CestasService` e `PUT /cestas/solicitacao/{id}/cancelar`, reaproveitando `GERENCIAR_CESTAS`. Aceita a partir de `SOLICITADA` **ou** `AGENDADA` (os dois pontos pedidos); recusa (409) a partir de `ENTREGUE` ou já `CANCELADA` — mesma guarda de estado das demais transições. As transições `SOLICITADA → AGENDADA`, `SOLICITADA/AGENDADA → CANCELADA` e `AGENDADA → ENTREGUE` usam updates condicionais pelo status observado no banco; se o estado mudar entre leitura e escrita, a operação perde com 409 e a tela recarrega as listas. Ao cancelar um agendamento, o token de QR Code é invalidado. O CRUD geral `/cestas` fica restrito a registros de entrada/saída com `status` nulo: não lista, edita nem exclui solicitações, e seu POST ignora campos internos do fluxo. `DELETE /cestas/**` exige `GERENCIAR_CESTAS`. Sem migration (coluna `status` já é `VARCHAR(20)` sem `CHECK` constraint) e sem campo de motivo (escopo mínimo pedido; item cancelado simplesmente some das duas listas filtradas por status — se o Instituto quiser depois um histórico/relatório de cancelamentos, é evolução futura, não assumida aqui). Botão "Cancelar" com confirmação (`window.confirm`, mesmo padrão já usado em Alunos/Voluntários/Cestas) nas duas telas (pendentes e agendadas). A regra padrão `GERENCIAR_CESTAS` inclui `COOR`; a regra ativa de produção foi conferida antes do deploy e já libera esse cargo.

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

**Escopo:** Landing page pública institucional — história, equipe, espaços, atividades, agenda, transparência, documentos e canais de contato/contribuição — além de doações, embaixadores e impacto social.

#### US-10.1: Página de Doações
**Como** visitante,
**eu quero** acessar a página `/doacoes` e escolher entre doação recorrente, única ou de itens,
**para que** eu contribua com o instituto da forma que preferir.

#### US-10.2: Página de Embaixadores
**Como** visitante,
**eu quero** visualizar os embaixadores e parceiros do instituto,
**para que** conheça quem apoia a causa.

#### US-10.3: Reorganização do Menu Principal
**Como** visitante,
**eu quero** navegar o site institucional por um menu organizado por tema (Início, O Instituto, Nossos Espaços, Projetos e Atividades, Equipe, Agenda, Como Ajudar, Transparência, Contato, Área da Família),
**para que** eu encontre rápido a informação que procuro, sem depender de rolar a página inteira.

**Critérios de Aceite:**
```gherkin
Dado que o visitante está em qualquer página do site institucional,
Quando ele abre o menu principal,
Então vê os itens Início, O Instituto, Nossos Espaços, Projetos e Atividades, Equipe, Agenda, Como Ajudar, Transparência, Contato e Área da Família, nessa ordem.

Dado que as páginas de doação já existentes hoje (Amigos do Melvin, Doação, Sua Nota tem Valor, Embaixadores) foram agrupadas sob "Como Ajudar",
Quando o visitante acessa uma URL antiga diretamente (ex: /doacoes, /amigos-do-melvin),
Então a página carrega normalmente, sem link quebrado, mesmo fora do menu reorganizado.
```

#### US-10.4: Página "O Instituto"
**Como** visitante,
**eu quero** conhecer a história, missão, visão, valores, público atendido e princípios do Instituto,
**para que** eu entenda quem são e o que fazem antes de me engajar (doar, ser voluntário, matricular um filho).

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "O Instituto",
Quando a página carrega,
Então exibe história, missão, visão, valores, público atendido e os princípios cristãos que orientam o trabalho do Instituto.
```

#### US-10.5: Página "Nossos Espaços"
**Como** visitante,
**eu quero** ver uma galeria com foto, nome e descrição de cada ambiente do Instituto,
**para que** eu conheça a estrutura física antes de visitar pessoalmente.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Nossos Espaços",
Quando a página carrega,
Então vê uma lista de ambientes (ex: Recepção, Diretoria, salas de reforço, espaço de atendimento psicopedagógico, oficinas, espaço de esporte, cozinha, refeitório, área de convivência, entre outros), cada um com foto, nome e descrição curta.

Dado que o visitante clica no botão "Conheça nosso Instituto",
Quando a ação ocorre,
Então abre uma galeria navegável com as fotos de todos os ambientes.
```

#### US-10.6: Página "Projetos e Atividades"
**Como** visitante,
**eu quero** ver quais atividades o Instituto oferece (reforço escolar, esporte, oficinas, cursos, ações sociais),
**para que** eu saiba do que meu filho, ou a comunidade, pode participar.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Projetos e Atividades",
Quando a página carrega,
Então vê cada atividade oferecida com uma descrição curta de seu propósito.
```

#### US-10.7: Página "Equipe"
**Como** visitante,
**eu quero** ver a equipe do Instituto organizada por setor (Diretoria, Coordenação, Secretaria e Administrativo, Equipe Pedagógica, Equipe Técnica e Social, Instrutores, Equipe de Apoio e Voluntários),
**para que** eu identifique quem é responsável por cada função.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Equipe",
Quando a página carrega,
Então vê as pessoas agrupadas nos 8 setores (Diretoria, Coordenação, Secretaria e Administrativo, Equipe Pedagógica, Equipe Técnica e Social, Instrutores, Equipe de Apoio, Voluntários), cada uma com nome, cargo/função e foto.

Dado que uma pessoa listada não tem autorização de uso de imagem/dados registrada,
Quando a página é montada,
Então essa pessoa não é exibida — toda exibição depende de autorização prévia (já confirmada como existente e assinada para a equipe e alunos atuais).

Dado que a seção "Voluntários" é exibida,
Quando o visitante a vê,
Então aparece com destaque textual diferenciado (ex: "pessoas que doam tempo, conhecimento e amor"), reconhecendo o caráter voluntário.
```

#### US-10.8: Página "Agenda"
**Como** visitante ou família,
**eu quero** ver o calendário de eventos do Instituto (reuniões de pais, palestras, campanhas, passeios, feriados, datas especiais) e os horários de funcionamento/turmas,
**para que** eu me organize e não perca nenhum compromisso.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Agenda",
Quando a página carrega,
Então vê os próximos eventos institucionais (reunião de pais, evento, palestra, campanha, passeio, feriado, data especial) em ordem cronológica.

Dado que a página "Agenda" também mostra a rotina semanal,
Quando o visitante consulta,
Então vê os horários de funcionamento do Instituto e os horários de cada turma/atividade.
```

> **Nota:** eventos e rotina semanal precisam de alguém (secretaria/coordenação) cadastrando — não é conteúdo estático, é CRUD interno novo que alimenta esta página pública de leitura. Desenho desse CRUD fica fora do escopo desta US.

#### US-10.9: Cardápio e Lanches da Semana
**Como** família,
**eu quero** consultar o que será servido às crianças durante a semana, quando aplicável,
**para que** eu saiba o que meu filho vai comer no Instituto.

**Critérios de Aceite:**
```gherkin
Dado que o Instituto oferece alimentação/lanche em determinada semana,
Quando a família acessa a página de Cardápio,
Então vê o que está planejado para cada dia daquela semana.

Dado que não há cardápio cadastrado para a semana corrente,
Quando a família acessa a página,
Então vê uma mensagem informando que a informação ainda não foi publicada, em vez de uma página vazia sem explicação.
```

> **Nota:** conteúdo muda toda semana — requer cadastro interno (provavelmente pela cozinha, cargo `COZI` já existente), fora do escopo desta US de exibição pública.

#### US-10.10: Notícias e Registros de Atividades
**Como** visitante ou família,
**eu quero** ver fotos e relatos curtos das atividades realizadas pelo Instituto,
**para que** eu acompanhe o dia a dia e o impacto do trabalho.

**Critérios de Aceite:**
```gherkin
Dado que uma atividade foi registrada com foto e relato,
Quando o visitante acessa "Notícias e Registros",
Então vê os registros mais recentes primeiro, cada um com foto, data e relato curto.

Dado que uma foto envolve aluno(s) identificável(is),
Quando o registro é publicado,
Então só é publicado se a autorização de uso de imagem do(s) aluno(s) envolvido(s) estiver vigente (mesma autorização já confirmada como assinada na matrícula).
```

> **Nota:** conteúdo recorrente — requer cadastro interno (provavelmente marketing, cargo `MARK` já existente), fora do escopo desta US de exibição pública.

#### US-10.11: Página "Projetos e Parceiros"
**Como** visitante, potencial parceiro ou empresa,
**eu quero** ver quais instituições, igrejas, empresas e projetos já apoiam o Instituto,
**para que** eu avalie a credibilidade e as formas de parceria existentes.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Projetos e Parceiros",
Quando a página carrega,
Então vê a lista de parceiros (instituições, igrejas, empresas) e dos projetos que eles apoiam.
```

#### US-10.12: Estrutura Organizacional e Organograma
**Como** visitante, potencial parceiro ou empresa,
**eu quero** ver a estrutura organizacional do Instituto representada visualmente,
**para que** eu entenda a hierarquia e a governança antes de avaliar uma parceria.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa a página de Transparência,
Quando ele consulta a seção de estrutura organizacional,
Então vê um organograma visual com a hierarquia (Instituto Melvin Edward Huber → Diretoria → Coordenação → Secretaria/Administrativo → Pedagógico → Assistência Social/Equipe Técnica → Projetos e Instrutores → Apoio → Voluntariado).
```

#### US-10.13: "Transparência Melvin" — Números de Impacto
**Como** visitante, doador ou potencial parceiro,
**eu quero** ver números grandes e simples sobre o impacto do Instituto,
**para que** eu entenda rapidamente o alcance do trabalho, sem precisar ler relatórios extensos.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Transparência",
Quando a página carrega,
Então vê números agregados de impacto: crianças atendidas, famílias alcançadas, atendimentos educacionais realizados, refeições/lanches oferecidos, atividades esportivas realizadas, cursos/oficinas oferecidos, voluntários atuantes e alimentos/doações distribuídos.

Dado que a mesma página mostra "Para onde vão as doações?",
Quando o visitante consulta,
Então vê a destinação por categoria (alimentação, material pedagógico, manutenção, atividades esportivas, higiene, projetos sociais), nunca por indivíduo nem com folha de pagamento.
```

> **Nota:** se os números forem dinâmicos (consultando dado real do sistema — Discente, Cestas, Amigos do Melvin), entra integração de agregação nova; se forem informados manualmente pelo Instituto, é conteúdo estático. Decisão de arquitetura pendente, fora do escopo desta US.

#### US-10.14: Prestação de Contas Simplificada
**Como** visitante ou doador,
**eu quero** ver um resumo periódico simples do que foi recebido e distribuído (ex: "recebemos X kg de alimentos e distribuímos X cestas"),
**para que** eu confie que minha doação está sendo usada, sem precisar interpretar uma planilha financeira.

**Critérios de Aceite:**
```gherkin
Dado que o Instituto publica a prestação de contas de um período,
Quando o visitante consulta,
Então vê um resumo simplificado (quantidade recebida, quantidade distribuída) sem identificar nenhuma família beneficiária.
```

#### US-10.15: Documentos Institucionais
**Como** visitante, família ou parceiro,
**eu quero** acessar os documentos institucionais do Instituto,
**para que** eu consulte regras, calendário, orientações e políticas sem precisar perguntar à secretaria.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Documentos Institucionais",
Quando a página carrega,
Então vê, no mínimo, o regulamento, o calendário, as orientações às famílias, a política de proteção à criança e os canais de contato, disponíveis para download/consulta.
```

#### US-10.16: Página "Como Ajudar" com Destaque para Doação
**Como** visitante que quer contribuir,
**eu quero** ver, numa única página, todas as formas de ajudar o Instituto (doação financeira, alimentos, roupas, material escolar, higiene, voluntariado, indicação para empresas),
**para que** eu escolha a forma que for possível pra mim.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Como Ajudar",
Quando a página carrega,
Então vê as páginas de doação já existentes (Amigos do Melvin, Doação, Sua Nota tem Valor, Embaixadores) e as demais formas de contribuição (alimentos, roupas, material escolar, higiene, voluntariado, indicação do Instituto para empresas).

Dado que a doação financeira é o canal de arrecadação principal do Instituto,
Quando o visitante vê o menu ou a página "Como Ajudar",
Então o atalho/botão "Doar" mantém o mesmo destaque visual que tem hoje (separado dos demais itens), não vira apenas mais um item de submenu.
```

#### US-10.17: Página "Contato"
**Como** visitante,
**eu quero** encontrar os canais de contato do Instituto,
**para que** eu consiga falar com eles por telefone, e-mail ou presencialmente.

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa "Contato",
Quando a página carrega,
Então vê endereço, telefone, e-mail e redes sociais do Instituto.
```

#### US-10.18: Canal de Sugestões e Reclamações
**Como** família ou visitante,
**eu quero** enviar uma sugestão ou reclamação para o Instituto,
**para que** eu me manifeste com segurança, sem precisar de um contato direto.

**Critérios de Aceite:**
```gherkin
Dado que o visitante está na página "Contato" ou em "Como Ajudar",
Quando ele preenche e envia o formulário de sugestão/reclamação,
Então a mensagem é registrada e notificada à coordenação/secretaria, sem exigir login — é um canal público e anônimo, aberto a qualquer visitante (não só família matriculada).

Dado que o formulário é um endpoint público sem autenticação,
Quando ele recebe submissões,
Então é protegido contra abuso por rate limit (mesmo padrão já usado em `/cestas/solicitacao`, ver `memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md`), evitando flood de bot.
```

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

### ÉPICO 12: OCORRÊNCIAS TÉCNICAS

**Escopo:** Registro de achados técnicos do próprio sistema (bugs, incidentes, decisões técnicas, manutenção, segurança), exclusivo do cargo TECH — nem o ADM tem acesso, mantendo a separação entre a manutenção técnica do sistema e a administração real do Instituto.

#### US-12.1: Registrar e Consultar Ocorrências Técnicas
**Como** usuário do cargo TECH,
**eu quero** registrar achados técnicos do sistema (bugs corrigidos, incidentes, decisões de manutenção, revisões de log) — muitos deles originados de sessões de trabalho com IA/agente técnico — e consultar o histórico depois,
**para que** o conhecimento técnico da manutenção do sistema fique registrado, sem se misturar aos registros de ocorrência de alunos nem ficar visível para a administração do Instituto.

**Critérios de Aceite:**
```gherkin
Dado que um usuário TECH está na tela de Configurações,
Quando ele visualiza a página,
Então vê o card "Ocorrências Técnicas", que não aparece para nenhum outro cargo, incluindo ADM.

Dado que um usuário TECH preenche título, categoria (Bug, Incidente, Manutenção, Decisão Técnica, Segurança), severidade (Baixa, Média, Alta), descrição e data,
Quando ele registra a ocorrência,
Então ela é salva vinculada ao seu login como autor, com timestamp de criação, e status inicial "Pendente".

Dado que existem ocorrências técnicas cadastradas,
Quando um usuário TECH abre a lista,
Então vê todas em ordem cronológica decrescente, com filtro por título/descrição, categoria e status (Pendente/Resolvido).

Dado que uma ocorrência está "Pendente",
Quando o usuário TECH clica no badge de status dela,
Então o status alterna para "Resolvido" (e vice-versa).

Dado que um usuário de qualquer outro cargo (incluindo ADM) tenta acessar a rota de Ocorrências Técnicas diretamente,
Quando a requisição chega ao backend,
Então o sistema retorna 403 Forbidden.
```

> **Nota de implementação:** entidade `OcorrenciaTecnica` nova (`titulo`, `categoria` enum, `severidade` enum, `descricao` — sem `SensitiveDataConverter`, diferente de `Ocorrencia`/aluno: é dado técnico interno, não pessoal sob LGPD —, `resolvido`, `autorLogin`, `dataOcorrencia`, `criadoEm`), migration `V17`. Autorização hardcoded em `SecurityConfiguration` (`hasRole("TECH")`, não `hasAnyRole` com ADM — deliberadamente exclusivo, mesmo padrão de restrição das telas de Permissões/Calendário, só que sem incluir ADM desta vez). Frontend: card novo em `Config.jsx` controlado por um estado `isTech` próprio (`role === 'TECH'` exato, não o `isAdm` que já inclui TECH), para não vazar pro ADM. Rotas `/app/ocorrencias-tecnicas` e `/app/ocorrencias-tecnicas/criar` com `role="TECH"`. Documentado no Manual do Sistema (US-11.1) como seção "Exclusivo do TECH — nem o ADM vê esta tela".

---

### ÉPICO 13: ÁREA DA FAMÍLIA (PORTAL DO RESPONSÁVEL)

**Escopo:** Portal autenticado para responsáveis de alunos acompanharem frequência, desenvolvimento, agenda e documentos do filho, e se comunicarem com o Instituto, sem depender dos cargos de equipe já existentes (`COOR, PROF, AUX, COZI, DIRE, ADM, MARK, ZELA, PSICO, ASSIST, TECH`). Backlog — ver `CLAUDE.md` §7 (changelog de 08/10/2026) para o histórico de levantamento com a cliente.

#### US-13.1: Autenticação de Responsável
**Como** responsável por um aluno matriculado,
**eu quero** entrar na Área da Família com usuário e senha próprios,
**para que** eu acesse só as informações do(s) meu(s) filho(s), sem precisar de um login de equipe.

**Critérios de Aceite:**
```gherkin
Dado que o responsável tem credenciais válidas de família,
Quando ele faz login na Área da Família,
Então acessa o painel só com os dados do(s) aluno(s) vinculado(s) a ele, nunca de outro aluno.

Dado que um responsável tem mais de um filho matriculado,
Quando ele faz login,
Então consegue alternar entre os filhos dentro da mesma conta, sem precisar de um login por filho.

Dado que as credenciais de família são inválidas ou não existem,
Quando alguém tenta entrar,
Então o sistema recusa o acesso sem revelar se a matrícula/CPF informado existe (mesmo princípio de não enumeração já usado no login de equipe).
```

> **Nota:** mecanismo de como o responsável recebe a credencial inicial (autocadastro validado por matrícula/CPF do filho vs. o Instituto cria e entrega) é decisão de arquitetura pendente, fora do escopo desta US. Pré-requisito de todas as demais US deste épico.

#### US-13.2: Painel "Meu Filho"
**Como** responsável logado,
**eu quero** ver um resumo do meu filho ao entrar (foto, nome, turma, professor, horário, frequência do mês),
**para que** eu tenha a informação mais importante sem precisar navegar por várias telas.

**Critérios de Aceite:**
```gherkin
Dado que o responsável está logado,
Quando a Área da Família carrega,
Então vê foto, nome, turma, professor, horário e percentual de frequência do mês do filho selecionado.

Dado que o responsável quer mais contexto institucional,
Quando ele navega a partir do painel,
Então encontra atalhos para Professores, Diretoria, Secretaria, Projetos e Nossos Espaços (mesmo conteúdo já público do site, ver Épico 10).
```

#### US-13.3: Acompanhamento
**Como** responsável logado,
**eu quero** ver presença/faltas, atividades frequentadas, evolução no reforço e conteúdos trabalhados do meu filho,
**para que** eu acompanhe o dia a dia dele no Instituto.

**Critérios de Aceite:**
```gherkin
Dado que o responsável acessa "Acompanhamento",
Quando a página carrega,
Então vê presenças/faltas, atividades frequentadas, evolução no reforço escolar e conteúdos trabalhados do filho.

Dado que uma observação pedagógica foi registrada internamente como sensível (ex: ligada a atendimento psicológico),
Quando o responsável acessa "Acompanhamento",
Então essa observação NÃO é exibida — só as observações pedagógicas marcadas como apropriadas para a família aparecem.
```

#### US-13.4: Desenvolvimento
**Como** responsável logado,
**eu quero** ver relatórios periódicos simples sobre o desenvolvimento do meu filho,
**para que** eu saiba o que ele está avançando e o que precisa de reforço em casa.

**Critérios de Aceite:**
```gherkin
Dado que a equipe pedagógica publicou um relatório periódico para o aluno,
Quando o responsável acessa "Desenvolvimento",
Então vê avanços percebidos, aspectos a fortalecer e orientações para continuar o trabalho em casa.

Dado que ainda não existe relatório publicado para o período corrente,
Quando o responsável acessa "Desenvolvimento",
Então vê uma mensagem explicando isso, em vez de uma tela vazia sem contexto.
```

> **Nota:** conteúdo estruturado novo — hoje "Diário e Rendimento" (Épico 9) é só upload/download de arquivo, não existe relatório periódico estruturado por aluno. Modelagem desse relatório fica fora do escopo desta US.

#### US-13.5: Minha Agenda
**Como** responsável logado,
**eu quero** ver os dias, horários, reuniões, eventos e compromissos específicos do meu filho,
**para que** eu não perca nada que diga respeito a ele.

**Critérios de Aceite:**
```gherkin
Dado que o responsável acessa "Minha Agenda",
Quando a página carrega,
Então vê os dias/horários das atividades do filho, próximas reuniões, eventos e avaliações que afetam aquele aluno especificamente, cruzando a agenda institucional (Épico 10, US-10.8) com a turma do aluno.
```

#### US-13.6: Documentos e Autorização de Passeio
**Como** responsável logado,
**eu quero** ver declarações, comunicados, termos e autorizar passeios do meu filho,
**para que** eu resolva isso pelo celular, sem precisar ir até a secretaria.

**Critérios de Aceite:**
```gherkin
Dado que o responsável acessa "Documentos",
Quando a página carrega,
Então vê declarações, comunicados, termos e autorizações pendentes destinadas à família dele.

Dado que existe uma autorização de passeio pendente,
Quando o responsável clica em "Autorizo" dentro da Área da Família autenticada,
Então o sistema grava o texto exato da autorização no momento do clique, o usuário responsável e o timestamp — funcionando como assinatura eletrônica simples, válida para esse consentimento de baixo risco.

Dado que o prazo de uma autorização pendente já passou,
Quando o responsável tenta autorizar depois do prazo,
Então o sistema recusa e indica que o prazo encerrou.
```

#### US-13.7: Comunicação com o Instituto
**Como** responsável logado,
**eu quero** enviar mensagem à secretaria/coordenação, justificar falta, atualizar meu telefone e solicitar atendimento,
**para que** eu resolva essas pendências sem precisar ligar ou ir pessoalmente.

**Critérios de Aceite:**
```gherkin
Dado que o responsável preenche o formulário de "Comunicação com o Instituto" (mensagem, justificar falta, atualizar telefone ou solicitar atendimento),
Quando ele envia,
Então o pedido é encaminhado por e-mail à secretaria/coordenação — não é mensageria interna com resposta pelo sistema (confirmado não existir chat/ticket em nenhum épico hoje).

Dado que o responsável justifica uma falta já registrada do filho,
Quando ele envia a justificativa,
Então a frequência do aluno (Épico 5) é marcada como "falta justificada" imediatamente, mantendo quem justificou, quando, e o texto/anexo informado — sem apagar o registro original de falta feito pelo professor, e visível/reversível pela coordenação.

Dado que o responsável atualiza o telefone de contato,
Quando ele salva,
Então o cadastro do aluno é atualizado imediatamente com o novo telefone.

Dado que o campo atualizado é o "contato de saída" (quem retira a criança), não um telefone comum,
Quando o responsável tenta alterá-lo,
Então o sistema notifica a equipe/outro responsável cadastrado sobre a mudança, por ser dado de segurança da criança.
```

> **Nota:** o critério de "falta justificada" introduz um estado novo sobre a Frequência do Épico 5 (hoje só `presencaManha`/`presencaTarde` = "F"/presente) — desenho exato desse campo fica fora do escopo desta US, mas é alteração em domínio de outro épico, não isolada ao Épico 13.

#### US-13.8: Avisos Direcionados
**Como** responsável logado,
**eu quero** receber avisos específicos do meu filho (ex: "inscrito no passeio", "precisamos da autorização até dia 15"), além dos avisos gerais do Instituto,
**para que** eu não misture o que é geral com o que é específico do meu filho.

**Critérios de Aceite:**
```gherkin
Dado que a coordenação cria um aviso direcionado a um aluno ou família específica,
Quando o responsável daquele aluno acessa "Avisos",
Então vê esse aviso, mas nenhum outro responsável vê (diferente do Aviso institucional hoje, que é sempre visível a todo mundo, ver Épico 7 US-7.3).

Dado que existe um aviso geral do Instituto (broadcast, como já funciona hoje) e um aviso direcionado ao filho do responsável,
Quando o responsável acessa "Avisos",
Então vê os dois tipos juntos, diferenciados visualmente.
```

> **Nota:** modelo `Aviso` atual (Épico 7) não tem campo de destinatário, é broadcast institucional puro — direcionamento por aluno/família é modelagem nova, não reaproveitamento.

---

