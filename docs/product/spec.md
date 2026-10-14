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

Dado que uma matrícula acumulou 10 tentativas de senha errada (de qualquer IP) ou um IP acumulou 20 em
matrículas diferentes, numa janela de 15 minutos,
Quando uma nova tentativa chega, mesmo com a senha certa,
Então o sistema responde 429 até a janela acabar; um login bem-sucedido zera a contagem da matrícula (não a do IP).
```
> **Nota de implementação (10/10/2026):** `LoginAttemptService`. Ver [[login-sem-limite-de-tentativas-e-verificacao-de-senha-sem-teto]].

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

Dado que a senha informada tem menos de 8 caracteres, é a própria matrícula ou é uma senha comum,
Quando o administrador submete o registro,
Então o sistema retorna 400 com a regra explicada.

Dado que o cargo é TECH,
Quando quem está registrando NÃO é TECH,
Então o sistema retorna 403 (só o Suporte Técnico cria acesso técnico).
```
> **Nota de implementação (10/10/2026):** `PoliticaDeSenha` e a separação do TECH (US-1.5).

#### US-1.3: Alteração de Senha
**Como** administrador,
**eu quero** alterar a senha de um usuário existente,
**para que** ele possa recuperar o acesso caso esqueça suas credenciais.

**Critérios de Aceite:**
```gherkin
Dado que o usuário existe no sistema,
Quando o admin envia a nova senha,
Então a senha é atualizada com hash Argon2 e retorna 200 OK.

Dado que a nova senha tem menos de 8 caracteres, é a própria matrícula ou é uma senha comum,
Quando o admin submete,
Então o sistema retorna 400 com a regra explicada.

Dado que o usuário é TECH,
Quando quem está redefinindo a senha NÃO é TECH,
Então o sistema retorna 403.
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

Dado que o novo cargo é TECH ou o usuário já é TECH,
Quando quem está alterando NÃO é TECH,
Então o sistema retorna 403 (a separação do cargo técnico vale também na API, não só na tela).
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

Dado que o aluno 2026001 será removido e possui nome, nome dos pais, e-mails, dados de trabalho e renda da família e data de nascimento,
Quando o admin confirma a exclusão,
Então o nome passa a "Aluno removido",
  E nome da mãe, nome do pai, e-mail, e-mail do responsável, outro familiar, local de trabalho, ocupação, renda e horário de medicamento ficam vazios,
  E a cidade passa a "Anonimizado" e a data de nascimento mantém apenas o ano (01/01 do ano de nascimento),
  E matrícula, sala, turno e sexo são preservados para a estatística e para a numeração dos próximos alunos.

Dado que o aluno 2026001 possui frequências, ocorrências e diário registrados,
Quando o admin confirma a exclusão,
Então o nome em todas as frequências passa a "Aluno removido",
  E a descrição de todas as ocorrências é substituída por um texto fixo, preservando categoria, data e autor,
  E o diário (arquivo e registro) é apagado.

Dado que o arquivo do diário do aluno não pôde ser apagado,
Quando o admin confirma a exclusão,
Então a exclusão inteira é desfeita (nada fica pela metade) e o admin recebe um erro.

Dado que a situação da matrícula é alterada para "Inativa" (e não "Deletar"),
Quando o admin salva,
Então nenhum dado é apagado, o aluno vai para a lista de desativados e pode voltar a qualquer momento.

Dado o formulário do aluno,
Quando o admin escolhe "Deletar" em "Situação Matrícula",
Então a tela exibe o aviso de que a ação é irreversível, só deve ser usada em pedido de eliminação de dados, e que quem saiu e pode voltar deve ser marcado como "Inativa",
  E ao salvar, a confirmação repete o aviso e, se recusada, nada é enviado ao servidor.
```

> **Critérios 2 a 6 acrescentados em 12/10/2026** (auditoria de produção de 08/10/2026; ver `memoria-tecnica/decisoes/exclusao-de-aluno-anonimizacao-completa-em-cascata.md`): a versão original só cobria contato e saúde, deixando nome, família e as frequências, ocorrências e diários ligados ao aluno. A matrícula é mantida de propósito: a numeração de novos alunos usa `COUNT(*) ... LIKE 'AAAA%'`, e trocá-la geraria matrículas duplicadas.

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

#### Regra de leitura da frequência (acrescentada em 12/10/2026)
**Origem:** decisão do Instituto em 12/10/2026 ("frequências devem ser lidas por docentes, coordenação e diretoria"), que fecha o módulo 18 do `ROADMAP.md`. Antes, qualquer cargo logado lia a frequência de alunos e o ponto de todos os voluntários.

**Critérios de Aceite:**
```gherkin
Dado que o usuário tem a permissão "Gerenciar Frequência" (por padrão: PROF, COOR, DIRE, ADM e TECH; em produção também AUX),
Quando ele consulta a frequência de alunos (chamada do dia, histórico, alertas de faltas) ou abre o Dashboard,
Então vê a frequência do dia e os alertas de faltas.

Dado que o usuário não tem essa permissão (por exemplo COZI, MARK, ZELA, PSICO e ASSIST),
Quando a frequência de alunos é consultada,
Então o servidor nega com 403, o Dashboard carrega sem os cartões "Frequência do Dia" e "Faltas Excessivas", a lista de alunos não consulta os alertas e a aba "Frequência" de Relatórios não é oferecida.

Dado qualquer voluntário logado,
Quando ele abre Configurações,
Então lê e registra o próprio ponto; o ponto dos demais voluntários só é lido por ADM, TECH, DIRE e COOR.
```

> **Fora desta regra:** a exportação para Excel (US-5.4) segue pela permissão "Visualizar Relatórios", que inclui PSICO e ASSIST; alinhá-la a esta regra é decisão pendente do Instituto. A permissão é editável em Configurações → Permissões de Acesso, então a regra acompanha o que o ADM conceder.

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
**Status:** 🔲 Backlog — decisão do cliente em 11/08/2026: aprovado como item futuro, não priorizado ainda. Substitui a "Nota de escopo pendente de decisão" que existia aqui. **14/10/2026:** segue sem prioridade (ver "Pré-requisitos externos" abaixo).

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
>
> **Pré-requisitos externos (14/10/2026):** o Instituto forneceu um número de telefone para isso (o número **não é registrado em nenhum arquivo versionado**). Ainda não existe nenhuma configuração do lado da Meta; faltam (1) conta Meta Business, (2) registro do número, por SMS ou ligação — em geral o número não pode estar ativo no WhatsApp comum ao mesmo tempo — e (3) aprovação do template de mensagem. **Decisão:** fica para depois, sem prioridade agora. Ver `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

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
Então o backend ATUALIZA a assinatura existente no Stripe (não cria uma nova) e retorna 200 OK; a resposta
pública traz só o aviso de atualização, nunca o cadastro do doador.

Dado que o CPF casa com um cadastro mas o e-mail enviado é diferente do e-mail desse cadastro (ou vice-versa),
Quando o visitante submete,
Então o backend retorna 409 sem alterar nada (alterar uma assinatura exige CPF E e-mail do mesmo cadastro).

Dado que o mesmo IP enviou 20 assinaturas na última hora,
Quando ele tenta mais uma,
Então o backend retorna 429.
```
> **Nota de implementação (10/10/2026):** resposta pública é `AssinaturaRespostaDTO` (só `clientSecret` ou
> "atualizada"), `RateLimitPublicoFilter` (20/h). Ver [[cadastros-publicos-confiavam-no-corpo-da-requisicao]].

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

**Critérios de Aceite:**
```gherkin
Dado que um visitante preenche o formulário público de embaixador (nome, contato, e-mail, Instagram opcional),
Quando ele submete,
Então o cadastro entra como não aprovado e não contatado, com um id novo (o corpo da requisição não escolhe
id, status nem descrição — isso é da administração), e a resposta não devolve o cadastro.

Dado que o mesmo IP enviou 5 cadastros na última hora,
Quando ele tenta mais um,
Então o backend retorna 429.

Dado que a administração (por padrão ADM, TECH e DIRE) edita um embaixador,
Quando ela altera contato, e-mail, Instagram, descrição ou aprovação,
Então os dados são atualizados; quem não tem a permissão de gerenciar embaixadores recebe 403.
```
> **Nota de implementação (10/10/2026):** `EmbaixadorCadastroDTO`, `RateLimitPublicoFilter` (5/h). Ver
> [[cadastros-publicos-confiavam-no-corpo-da-requisicao]] e US-10.2 (lista pública).

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
**Como** coordenador ou docente,
**eu quero** ver o Top 5 alunos por frequência ou média de rendimento,
**para que** os destaques acadêmicos sejam reconhecidos.

**Critérios de Aceite:**
```gherkin
Dado que o usuário tem a permissão "Visualizar Relatórios" (por padrão: PROF, COOR, DIRE, ADM, TECH, ASSIST e PSICO),
Quando ele abre o dashboard,
Então vê os cards "Destaques" e "Atenção Necessária" e escolhe entre Média Pedagógica (média das quatro notas pedagógicas), Presença, Participação, Comportamento e Rendimento.

Dado que o usuário não é PSICO nem COOR,
Quando ele consulta o ranking,
Então a nota de Avaliação Psicológica não aparece na ordenação nem entra na média, e pedir a ordenação "psicologico" é negado com 403 pelo servidor.

Dado que o usuário é PSICO ou COOR,
Quando ele consulta o ranking,
Então vê a opção Psicológico e a Média Geral com as cinco notas, mesmo que a permissão "Visualizar Relatórios" tenha sido retirada do cargo.

Dado que o usuário não tem "Visualizar Relatórios" e não é PSICO nem COOR,
Quando ele abre o dashboard,
Então os cards de ranking não aparecem e o servidor responde 403 ao ranking.
```

#### Regra da nota psicológica (decisão de 14/10/2026): só PSICO e COOR a veem, em todos os lugares

A restrição deixa de valer só para o ranking. A nota de Avaliação Psicológica é dado sensível de saúde de criança e é de uso da equipe de Psicologia e Coordenação.

```gherkin
Dado que o usuário não é PSICO nem COOR,
Quando ele consulta a ficha de um aluno (inclusive a tela de Rendimento),
Então a resposta do servidor não contém a nota psicológica (o campo é omitido, não zerado) e a tela não exibe a linha "Avaliação Psicológica".

Dado que o usuário não é PSICO nem COOR,
Quando ele cadastra ou edita um aluno,
Então a resposta do servidor também não contém a nota psicológica.

Dado que o usuário é PSICO ou COOR e a nota psicológica de um aluno ainda não foi lançada,
Quando ele abre a ficha ou a tela de Rendimento,
Então o campo vem com valor nulo e a linha continua visível, para que a primeira nota possa ser lançada.

Dado que o usuário não é PSICO nem COOR,
Quando ele exporta a planilha de alunos,
Então a coluna "Avaliação Psicológico" sai vazia e a média sai calculada só com as quatro notas pedagógicas, com o cabeçalho "Média Pedagógica".

Dado que o usuário é PSICO ou COOR,
Quando ele exporta a planilha de alunos,
Então a coluna traz a nota e a "Média Geral" usa as cinco notas.

Dado que o usuário não é PSICO nem COOR (mesmo que tenha a permissão "Editar Avaliação Psicológica"),
Quando ele salva as avaliações de um aluno,
Então a nota psicológica existente é preservada: o servidor só a grava se o usuário tiver a permissão E for PSICO ou COOR.
```

> **Nota:** a regra vale para o ranking do painel, a ficha do aluno (e Rendimento), as respostas de cadastro/edição do aluno e a planilha de alunos. **Impacto:** na configuração de produção de 14/10/2026, ADM, DIRE e TECH tinham a permissão "Editar Avaliação Psicológica" e viam/editavam a nota; deixam de ver e de editar. A tabela de Relatórios não traz as notas dos alunos (a listagem não as devolve), então não é uma via de acesso. Ver `memoria-tecnica/bugs/dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica.md` e `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

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

**Critérios de Aceite:**
```gherkin
Dado que o visitante acessa a página de Embaixadores,
Quando a lista carrega,
Então vê apenas embaixadores aprovados, cada um com foto, nome e descrição.

Dado que alguém se cadastrou como embaixador e ainda não foi aprovado,
Quando o visitante acessa a página,
Então esse cadastro não aparece, e contato, e-mail e Instagram de nenhum cadastrado chegam ao navegador do visitante.

Dado que a administração (por padrão ADM, TECH e DIRE) abre a gestão de embaixadores,
Quando a lista completa carrega,
Então vê todos os cadastros, aprovados e pendentes, com os dados de contato; quem não tem a permissão de gerenciar embaixadores recebe 403.
```

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

Dado que o Instituto enviou os valores de um período, com o período e a fonte,
Quando a administração os aprova,
Então a página pública passa a mostrá-los com o período e a fonte, e o sistema guarda quem aprovou e quando.

Dado que um valor ainda não foi aprovado pela administração,
Quando o visitante acessa "Transparência",
Então esse valor não aparece.

Dado que uma contagem pequena por categoria poderia identificar uma família,
Quando a administração revisa os valores antes de aprovar,
Então ela confere isso e só publica o que não identifica ninguém.
```

> **Decisão (14/10/2026):** o Instituto envia os valores prontos, com período e fonte, e a administração aprova antes de publicar; **sem cálculo automático**. Motivo: o sistema só tem parte dos dados (alunos ativos, cestas, doações), refeições e famílias atendidas por projeto não estão registradas de forma confiável, número errado em página pública custa credibilidade, contagem pequena por categoria pode identificar uma família, e a solução cabe no escopo sem aumentá-lo. **Depois:** indicadores do sistema podem entrar pré-calculados para aprovação (mudança de escopo futura). Ver `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

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

Dado que a coordenação ou a administração conferiu pessoalmente o documento de um responsável,
Quando ela o cadastra e o vincula ao(s) aluno(s) dele,
Então o responsável passa a ter login próprio, entregue a ele pela coordenação ou administração, com acesso só aos alunos vinculados.

Dado que quem tenta cadastrar um responsável não é da coordenação nem da administração,
Quando a requisição chega ao servidor,
Então o sistema recusa (403).

Dado que alguém sem cadastro procura criar uma conta pela Área da Família,
Quando abre a tela de entrada ou chama a API,
Então não existe caminho de autocadastro: nem tela, nem rota pública de criação de conta de família.
```

> **Decisão (14/10/2026):** coordenação e administração cadastram cada responsável **depois de conferir o documento pessoalmente** e entregam o login inicial; não há autocadastro. Motivo: o portal mostra dados de crianças e permite agir (justificar falta, trocar telefone, autorizar passeio), e autocadastro por dados que outras pessoas sabem (CPF, matrícula, data de nascimento) deixaria quem não é o responsável ver os dados da criança ou autorizar passeio; conferir o documento é a única checagem confiável, já praticada na matrícula, e dados de criança têm proteção reforçada na LGPD. O custo é um cadastro por família. **Se virar gargalo:** evoluir para convite por link no e-mail cadastrado, ainda confirmado pela coordenação. Justificativa completa em `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`. Pré-requisito de todas as demais US deste épico.

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

Dado que a foto do aluno ou o professor da sala não estão preenchidos,
Quando o responsável abre o painel,
Então o painel carrega normalmente, sem esse item e sem erro.
```

> **Decisão (14/10/2026): painel completo, com foto e professor.** A autorização de uso de imagem já está assinada na matrícula (não é restrição). **Foto:** campo novo na ficha do aluno, enviado por upload com o `UploadSeguro`. **Professor:** sai do cruzamento de `Voluntario.funcao` + `salaUm`/`salaDois` com `Discente.sala`, sem cadastro novo; antes de desenhar, conferir em produção só por contagem se esses campos estão preenchidos. Aumenta o módulo 23 (reestimar ao desenhar). Ver `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

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

Dado que o professor lançou o conteúdo trabalhado da sala (um registro com sala, data e texto curto, por dia ou por semana),
Quando o responsável acessa "Acompanhamento",
Então vê os conteúdos lançados para a sala do filho, por data.
```

> **Decisão (14/10/2026):** "conteúdos trabalhados" é um **registro novo** (sala + data + texto curto), lançado pelo professor por dia ou por semana; hoje o Diário (Épico 9) é só upload de arquivo e não serve. Ver `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

#### US-13.4: Desenvolvimento
**Como** responsável logado,
**eu quero** ver relatórios periódicos simples sobre o desenvolvimento do meu filho,
**para que** eu saiba o que ele está avançando e o que precisa de reforço em casa.

**Critérios de Aceite:**
```gherkin
Dado que a coordenação aprovou um relatório periódico escrito para o aluno,
Quando o responsável acessa "Desenvolvimento",
Então vê avanços percebidos, aspectos a fortalecer e orientações para continuar o trabalho em casa.

Dado que um relatório ainda não foi aprovado pela coordenação,
Quando o responsável acessa "Desenvolvimento",
Então o relatório não aparece, e o sistema guarda quem aprovou e quando cada relatório publicado.

Dado que ainda não existe relatório aprovado para o período corrente,
Quando o responsável acessa "Desenvolvimento",
Então vê uma mensagem explicando isso, em vez de uma tela vazia sem contexto.

Dado qualquer tela ou resposta da Área da Família,
Quando ela mostra dados de desenvolvimento do aluno,
Então a avaliação psicológica NUNCA aparece, nem na tela nem na resposta da API, e notas soltas não são exibidas: a família vê somente relatórios escritos e aprovados.
```

> **Decisão (14/10/2026):** a família vê só relatórios escritos e aprovados pela coordenação; a avaliação psicológica nunca vai à família. Motivo: nota solta sem contexto gera ansiedade e comparação, o relatório dá contexto, e a aprovação evita publicar algo sensível sem revisão (com registro de quem aprovou); a psicológica é dado sensível de saúde de criança, de uso da equipe. A lei não proíbe mostrar notas pedagógicas: isso é recomendação, e a base forte é só a psicológica. Ver `memoria-tecnica/decisoes/decisoes-14-10-2026-area-da-familia-transparencia-e-nota-psicologica.md`.

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

