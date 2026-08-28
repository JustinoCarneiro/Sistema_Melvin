# 🗺️ ROADMAP.md — Blueprint de Arquitetura e Contratos

> **Última atualização:** 27/08/2026 (Módulo 16 — Cargo Técnico TECH)
> **Metodologia:** Onda-Dev (Fase 3 — Blueprint)
> **Referência:** [CLAUDE.md](./CLAUDE.md)

---

## Classificação de Módulos (Peso Onda-Dev)

> Padronização de vocabulário (30/07/2026, seção 12 da metodologia): coluna **Status** usa
> `✅ Concluído` — substituiu "COMPLETO", que era o termo usado aqui antes, pra ficar consistente
> com o resto dos projetos da Onda. Datas por módulo não foram registradas incrementalmente
> durante o desenvolvimento; a referência mais próxima é a "Última atualização" deste documento
> (04/06/2026).

| # | Módulo | Peso | Dias | Status |
|---|---|---|---|---|
| 1 | Autenticação & RBAC Dinâmico | 🔴 Grande | 5-7 | ✅ Concluído |
| 2 | Gestão de Discentes (Alunos) | 🟡 Médio | 3-4 | ✅ Concluído |
| 3 | Gestão de Voluntários | 🟡 Médio | 3-4 | ✅ Concluído |
| 4 | Frequência (Ponto Eletrônico) | 🟡 Médio | 3-4 | ✅ Concluído |
| 5 | Amigos do Melvin (Stripe) | 🔴 Grande | 5-7 | ✅ Concluído |
| 6 | Cestas + Embaixadores + Avisos | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 7 | Dashboard + Relatórios | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 8 | Diário + Rendimento | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 9 | Site Institucional (Público) | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 10 | Imagens e Mídias | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 11 | Notificação de Falta ao Responsável | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 12 | Registro de Ocorrências do Aluno | 🟡 Médio | 3-4 | ✅ Concluído |
| 13 | Solicitação de Cestas + Confirmação de Entrega | 🔴 Grande | 5-7 | ✅ Concluído |
| 14 | Notificação de Falta via WhatsApp | 🟡 Médio | 3-4 | 🔲 Backlog |
| 15 | Central de Ajuda (Manual do Sistema) | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 16 | Cargo Técnico (TECH) | 🟡 Médio | 3-4 | ✅ Concluído |

---

## Prazo Técnico (Fórmula Onda-Dev)

```
Fase 2 (Aprovação Visual):  5 dias
Módulos Grandes (2x):      14 dias
Módulos Médios (3x):       12 dias
Módulos Pequenos (5x):     10 dias
Fase 5 (Homologação):       2 dias
────────────────────────────────────
TOTAL:                      43 dias úteis
```

---

## MÓDULO 1: AUTENTICAÇÃO & RBAC DINÂMICO
**Peso: 🔴 GRANDE (~5-7 dias) | Status: ✅ Concluído**

> Épicos de referência: [CLAUDE.md #Épico 1](./CLAUDE.md) e [CLAUDE.md #Épico 2](./CLAUDE.md)

### Contratos API

#### `POST /auth/login` — Autenticação
```json
// Request
{
  "login": "2026001",
  "password": "minhasenha"
}

// Response 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "ADM"
}

// Response 401 Unauthorized
{
  "status": 401,
  "message": "Matrícula ou senha inválida."
}
```

#### `POST /auth/register` — Registrar Usuário
```json
// Request
{
  "login": "2026001",
  "password": "novasenha",
  "role": "PROF"
}

// Response 200 OK (sem body)
// Response 400 Bad Request (matrícula sem voluntário)
// Response 409 Conflict (matrícula já registrada)
```

#### `PUT /auth/alterar_senha` — Alteração de Senha
```json
// Request
{
  "login": "2026001",
  "newPassword": "senhaatualizada"
}

// Response 200 OK (sem body)
// Response 404 Not Found (usuário não encontrado)
```

#### `GET /auth/role_{matricula}` — Consultar Role
```json
// Response 200 OK
"ADM"

// Response 404 Not Found
{ "status": 404, "message": "Usuário não encontrado." }
```

#### `PUT /auth/alterar_role/{matricula}/{role}` — Alterar Role
```json
// Response 200 OK (sem body)
// Response 400 Bad Request
{ "status": 400, "message": "Role inválida" }
```

---

#### `GET /permissoes` — Listar Todas as Regras
```json
// Response 200 OK
[
  {
    "nomeRegra": "EDITAR_ALUNO",
    "rolesPermitidas": ["ADM", "COOR"]
  },
  {
    "nomeRegra": "VER_FREQUENCIA",
    "rolesPermitidas": ["ADM", "COOR", "PROF"]
  }
]
```

#### `PUT /permissoes/{nomeRegra}` — Atualizar Regra
```json
// Request (body = lista de roles)
["ADM", "COOR", "PROF"]

// Response 200 OK
```

#### `GET /permissoes/minhas` — Minhas Permissões
```json
// Response 200 OK (baseado no token JWT do usuário autenticado)
["VER_ALUNO", "EDITAR_ALUNO", "VER_FREQUENCIA"]
```

---

## MÓDULO 2: GESTÃO DE DISCENTES (ALUNOS)
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 3](./CLAUDE.md)

### Contratos API

#### `GET /discente?search={termo}` — Listar Alunos (LGPD)
```json
// Response 200 OK (DiscenteListagemDTO — sem dados sensíveis)
[
  {
    "matricula": "2026001",
    "nome": "João Silva",
    "nome_pai": "Carlos Silva",
    "nome_mae": "Maria Silva",
    "status": "ATIVO",
    "sala": 3,
    "turno": "MANHA",
    "ingles": true,
    "karate": false,
    "informatica": true,
    "musica": false,
    "teatro": false,
    "ballet": false,
    "futsal": true,
    "artesanato": false
  }
]
```

#### `GET /discente/matricula/{matricula}` — Capturar por Matrícula
```json
// Response 200 OK (Entidade completa — endpoint protegido)
{
  "matricula": "2026001",
  "nome": "João Silva",
  "dataNascimento": "2015-03-15",
  "responsavel": "Carlos Silva",
  "contatoResponsavel": "(11) 99999-9999",
  "sala": 3,
  "turno": "MANHA",
  "status": "ATIVO",
  "avaliacaoRendimento": 4.5,
  "avaliacaoPsicologico": null
  // ... demais campos
}
```

#### `GET /discente/sala/{sala}` — Listar por Sala
```json
// Response 200 OK (DiscenteListagemDTO[])
```

#### `POST /discente` — Cadastrar Aluno
```json
// Request (Entidade Discente)
{
  "nome": "João Silva",
  "dataNascimento": "2015-03-15",
  "responsavel": "Carlos Silva",
  "contatoResponsavel": "(11) 99999-9999",
  "sala": 3,
  "turno": "MANHA"
}

// Response 200 OK (matrícula auto-gerada pelo backend)
// Response 409 Conflict ("Matricula já cadastrada!")
```

#### `PUT /discente` — Alterar Aluno
```json
// Request (Entidade Discente com matrícula)
// Response 200 OK
// Response 404 Not Found
```

#### `DELETE /discente/{matricula}` — Remover (Soft Delete + Anonimização)
```json
// Response 200 OK
// Response 404 Not Found ("Matricula não cadastrada!")
```

#### `GET /discente/export?search={termo}` — Exportar Excel
```
// Response 200 OK
// Content-Type: application/vnd.ms-excel
// Content-Disposition: attachment; filename=discentes.xlsx
```

#### `PUT /discente/{matricula}/avaliacoes` — Alterar Avaliações
```json
// Request (DiscenteAvaliacaoDTO)
{
  "avaliacaoRendimento": 4.5,
  "avaliacaoPsicologico": 3.0
}

// Response 200 OK (apenas campos com permissão são atualizados)
```

---

## MÓDULO 3: GESTÃO DE VOLUNTÁRIOS
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 4](./CLAUDE.md)

### Contratos API

#### `GET /voluntario?search={termo}` — Listar (LGPD)
```json
// Response 200 OK (VoluntarioListagemDTO[])
```

#### `GET /voluntario/nomesfuncoes` — Nomes e Funções
```json
// Response 200 OK (VoluntarioDTO[])
[
  { "nome": "Ana Souza", "funcao": "Professora de Inglês" }
]
```

#### `GET /voluntario/matricula/{matricula}` — Capturar por Matrícula
```json
// Response 200 OK (Entidade Voluntario completa)
```

#### `POST /voluntario` — Cadastrar
```json
// Response 200 OK
// Response 409 Conflict
```

#### `PUT /voluntario` — Alterar
```json
// Response 200 OK
```

#### `DELETE /voluntario/{matricula}` — Remover
```json
// Response 200 OK
// Response 404 Not Found
```

---

## MÓDULO 4: FREQUÊNCIA (PONTO ELETRÔNICO)
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 5](./CLAUDE.md)

### Contratos API

#### `GET /frequenciadiscente` — Listar Todas
```json
// Response 200 OK (FrequenciaDiscente[])
```

#### `GET /frequenciadiscente/{data}` — Por Data
```json
// Response 200 OK — data no formato YYYY-MM-DD
```

#### `GET /frequenciadiscente/{data}/{matricula}` — Capturar Específica
```json
// Response 200 OK
{
  "matricula": "2026001",
  "nome": "João Silva",
  "sala": 3,
  "data": "2026-06-04",
  "presenca_manha": "P",
  "presenca_tarde": "F",
  "justificativa": null
}
```

#### `POST /frequenciadiscente` — Registrar
```json
// Request
{
  "matricula": "2026001",
  "nome": "João Silva",
  "sala": 3,
  "data": "2026-06-04",
  "presenca_manha": "P",
  "presenca_tarde": "P"
}
```

#### `DELETE /frequenciadiscente/{matricula}/{data}` — Remover

#### `GET /frequenciadiscente/alertas-faltas?mes={m}&ano={a}` — Alertas
```json
// Response 200 OK (FaltaAlertaDTO[])
```

#### `GET /frequenciadiscente/export?mes={m}&ano={a}&sala={s}&turno={t}&busca={b}` — Exportar Excel

*Mesma estrutura para `/frequenciavoluntario`.*

---

## MÓDULO 5: AMIGOS DO MELVIN (DOAÇÕES — STRIPE)
**Peso: 🔴 GRANDE (~5-7 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 6](./CLAUDE.md)

### Contratos API

#### `GET /amigomelvin` — Listar Doadores (LGPD)
```json
// Response 200 OK (AmigoMelvinListagemDTO[])
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "Maria Santos",
    "contato": "(11) 98765-4321",
    "email": "maria@email.com",
    "valorMensal": 50.00,
    "status": "ACTIVE",
    "mesesContribuindo": 3,
    "dataInicio": "2026-03-01T10:00:00",
    "diaPreferido": "10",
    "mensagem": "Feliz em ajudar!"
  }
]
```

#### `GET /amigomelvin/stats` — Estatísticas
```json
// Response 200 OK
{
  "totalDoadores": 15,
  "totalAtivos": 12,
  "receitaMensal": 1500.00
}
```

#### `POST /amigomelvin/subscribe` — Criar Assinatura
```json
// Request (SubscriptionRequestDTO)
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "contato": "(11) 98765-4321",
  "valor": 50.00,
  "stripeToken": "tok_visa",
  "dia": "10",
  "mensagem": "Feliz em ajudar!"
}

// Response 200 OK
```

#### `POST /amigomelvin/one-time` — Doação Única
```json
// Request (OneTimeDonationDTO)
{
  "nome": "Carlos Pereira",
  "email": "carlos@email.com",
  "contato": "(11) 91234-5678",
  "valor": 100.00,
  "stripeToken": "tok_visa"
}

// Response 200 OK
```

#### `POST /amigomelvin/items` — Doação de Itens
```json
// Request (DoacaoItemDTO)
{
  "nome": "Ana Oliveira",
  "telefone": "(11) 99876-5432",
  "tipoItem": "Roupas infantis",
  "observacao": "Tamanhos 4 a 8 anos, em bom estado"
}

// Response 200 OK
```

#### `POST /amigomelvin/{id}/cancelar` — Cancelar Assinatura Manual
```json
// Response 200 OK (cancela no Stripe + atualiza status + envia e-mail)
```

#### `POST /api/v1/webhooks/payments` — Webhook Stripe (PÚBLICO)
```
// Request: Stripe Payload (raw body)
// Headers: Stripe-Signature: t=...,v1=...
// Eventos escutados: invoice.paid, invoice.payment_failed, customer.subscription.deleted

// Response 200 OK: "Webhook processed"
// Response 400: "Invalid signature" ou "Error processing webhook"
```

**Máquina de Estados:**

| Estado Atual | Evento Stripe | Novo Estado |
|---|---|---|
| N/A | `customer.subscription.created` | `PENDING` |
| `PENDING` | `invoice.paid` | `ACTIVE` (meses: 1) |
| `ACTIVE` | `invoice.paid` | `ACTIVE` (meses: n+1) |
| `ACTIVE` | `invoice.payment_failed` | `INACTIVE` |
| `INACTIVE` | `invoice.paid` | `ACTIVE` |
| `ANY` | `customer.subscription.deleted` | `CANCELLED` |

---

## MÓDULO 6: CESTAS + EMBAIXADORES + AVISOS
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 7](./CLAUDE.md)

### Contratos API

#### Cestas (`/cestas`)
| Método | Endpoint | Body |
|---|---|---|
| `GET` | `/cestas` | — |
| `POST` | `/cestas` | `Cestas` entity |
| `PUT` | `/cestas` | `Cestas` entity (com id) |
| `DELETE` | `/cestas/{id}` | — (UUID) |

#### Embaixadores (`/embaixador`)
| Método | Endpoint | Body |
|---|---|---|
| `GET` | `/embaixador` | — |
| `POST` | `/embaixador` | `Embaixador` entity |
| `PUT` | `/embaixador` | `Embaixador` entity |

#### Avisos (`/aviso`)
| Método | Endpoint | Body |
|---|---|---|
| `GET` | `/aviso` | — |
| `POST` | `/aviso` | `Aviso` entity |
| `PUT` | `/aviso/{id}` | `Aviso` entity (UUID no path) |

---

## MÓDULO 7: DASHBOARD + RELATÓRIOS
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 8](./CLAUDE.md)

### Contratos API

#### `GET /dashboard/presentes` — Alunos Presentes Hoje
```json
// Response 200 OK
{ "presentes": 42 }
```

#### `GET /dashboard/ranking?sortBy={media|frequencia}` — Ranking Top 5
```json
// Response 200 OK (AlunoRankingDTO[])
```

#### `GET /dashboard/avisos` — Avisos Ativos
```json
// Response 200 OK (Aviso[])
```

---

## MÓDULO 8: DIÁRIO + RENDIMENTO
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 9](./CLAUDE.md)

### Contratos API

| Método | Endpoint | Tipo | Descrição |
|---|---|---|---|
| `GET` | `/diarios/captura/{matricula}` | JSON | Metadados do diário |
| `GET` | `/diarios/download/{matricula}` | Binary | Download do arquivo |
| `POST` | `/diarios/upload` | Multipart | Upload (file + matriculaAtrelada) |
| `PUT` | `/diarios/atualizar/{matriculaAtrelada}` | Multipart | Substituir arquivo |
| `DELETE` | `/diarios/delete/{matriculaAtrelada}` | — | Deletar diário |

---

## MÓDULO 9: SITE INSTITUCIONAL (PÚBLICO)
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído**

> Épico de referência: [CLAUDE.md #Épico 10](./CLAUDE.md)

Páginas públicas (sem autenticação):
- `/` — Home do site
- `/embaixadores` — Lista de embaixadores
- `/amigos-do-melvin` — Seção de impacto social
- `/doacoes` — Formulários de doação (recorrente, única, itens)
- `/cadastro-amigo` — Cadastro de novo amigo doador
- `/nota-de-valor` — Página institucional

---

## MÓDULO 10: IMAGENS E MÍDIAS
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído**

### Contratos API

| Método | Endpoint | Tipo | Descrição |
|---|---|---|---|
| `GET` | `/imagens/lista` | JSON | Listar todas as imagens |
| `GET` | `/imagens/captura/{id}/{tipo}` | JSON | Buscar por idAtrelado e tipo |
| `POST` | `/imagens/upload/{id}/{tipo}` | Multipart | Upload de imagem |
| `PUT` | `/imagens/atualizar/{id}/{tipo}` | Multipart | Atualizar imagem |

Tipos suportados: `embaixador`, `aviso`.

---

## MÓDULO 11: NOTIFICAÇÃO DE FALTA AO RESPONSÁVEL
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído (10/08/2026)**

> Épico de referência: [CLAUDE.md #Épico 5 — US-5.5](./CLAUDE.md)

### Mudança de modelo
`Discente` ganha campo novo `email_responsavel` (cifrado, `SensitiveDataConverter`) — nome snake_case pra seguir a convenção já usada em `contato_pai`/`contato_mae`/`contato_saida` no mesmo arquivo (não `emailResponsavel`, como a spec inicial cogitava). Migration `V12__Add_email_responsavel_to_discente.sql`.

### Fluxo
`FrequenciaDiscenteService.cadastrar()` passa a, ao salvar presença `F` em qualquer turno (manhã e/ou tarde), chamar `EmailService.sendEmail()` de forma assíncrona (best-effort — `EmailService` já engole falha de envio internamente, não derruba o cadastro de frequência). Sem `email_responsavel` cadastrado, a frequência é salva normalmente e nenhum envio é tentado. Sem contrato de API novo (é efeito colateral do `POST /frequenciadiscente` já existente).

### Entrega (TDD)
4 testes novos em `FrequenciaDiscenteServiceTest` (falta manhã, falta tarde, sem falta, falta sem e-mail cadastrado) — RED confirmado (erro de compilação por método inexistente) antes da implementação, GREEN depois. Suíte completa do backend: 50/50 verde. Campo "E-mail do Responsável" adicionado ao formulário de Aluno (frontend) — sem esse campo de UI a coluna nova nunca seria preenchida.

---

## MÓDULO 12: REGISTRO DE OCORRÊNCIAS DO ALUNO
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído (10/08/2026)**

> Épico de referência: [CLAUDE.md #Épico 3 — US-3.7](./CLAUDE.md)

### Modelo: `Ocorrencia` (entregue)
| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | PK |
| `matricula_discente` | string | FK lógica pra `Discente` |
| `categoria` | enum | `COMPORTAMENTAL`, `PEDAGOGICA` |
| `descricao` | text (cifrado) | `SensitiveDataConverter` |
| `autor_login` | string | login/matrícula do usuário autenticado (não UUID — evita join só pra exibir quem registrou; revisado em relação à proposta inicial `autorId`) |
| `data_ocorrencia` | LocalDate | |
| `criado_em` | LocalDateTime | |

Migration `V13__Create_Ocorrencia_Table.sql`.

### Contratos API (entregue)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/ocorrencias` | Cria ocorrência (permissão `GERENCIAR_OCORRENCIA`); autor extraído do token, não do payload |
| `GET` | `/ocorrencias/discente/{matricula}` | Histórico ordenado por data desc (`GERENCIAR_OCORRENCIA` — mais restrito que `VISUALIZAR_ALUNOS`) |

**Não implementado nesta entrega:** `DELETE /ocorrencias/{id}` — não fazia parte dos critérios de aceite aprovados (CLAUDE.md US-3.7 só cobre criar e listar); ficou de fora pra não expandir escopo além do combinado. Considerar como item futuro se o cliente pedir.

Nova permissão dinâmica: `GERENCIAR_OCORRENCIA`, default `[PROF, COOR, DIRE, ADM]`.

### Entrega (TDD)
7 testes novos: `OcorrenciaServiceTest` (3 — cadastro válido/matrícula inexistente/listagem) + `OcorrenciaRepositoryTest` (2, `@DataJpaTest` contra H2 — valida a ordenação cronológica de verdade, incluindo desempate por `criado_em`) + verificação de build/lint do frontend. Seção "Ocorrências" anexada ao `Form.jsx` de Aluno (não existe tela dedicada de "ficha do aluno" no sistema hoje — `Form.jsx` já cumpre esse papel). Suíte completa do backend: 55/55 verde, incluindo o teste de boot do contexto Spring completo (`SistemaApplicationTests`).

---

## MÓDULO 13: SOLICITAÇÃO DE CESTAS + CONFIRMAÇÃO DE ENTREGA
**Peso: 🔴 GRANDE (~5-7 dias) | Status: ✅ Concluído (10/08/2026, revisado 12/08/2026 — duas vezes)**

> Épico de referência: [CLAUDE.md #Épico 7 — US-7.4](./CLAUDE.md)

> ✅ **QR Code: removido e reintroduzido no mesmo dia (12/08/2026).** Primeira revisão removeu o check-in por QR Code do escopo. Horas depois, esclarecido que essa remoção não tinha vindo de um pedido real do cliente — o pedido original sempre incluiu QR Code. Reintroduzido como **caminho principal** de confirmação de entrega, com a confirmação manual (construída na primeira revisão) virando o **caminho alternativo**. Esta seção reflete o estado final; o histórico completo das duas revisões está na nota mais abaixo.

### Mudança de modelo
`Cestas` ganha máquina de estados nova: campo `status` (enum `SOLICITADA`, `AGENDADA`, `ENTREGUE`, `CANCELADA` — reintroduz um campo de status que havia sido removido do modelo atual), `dataRetirada` (LocalDate, definida na validação — distinto do `dataEntrega` atual) e `entregueEm` (LocalDateTime, preenchido na confirmação de entrega, manual ou por QR Code). Reintroduzido também (migration V15): `emailSolicitante` (cifrado, opcional) e `qrCodeToken` (UUID gerado na validação).

**Hierarquia da igreja (esclarecida pelo cliente, 10/08/2026):** célula → **setor** (liderado pelo *supervisor*) → área → distrito → rede. **Correção de escopo (mesma data):** qualquer nível da hierarquia pode ser o solicitante, não só o supervisor — o pedido é sempre *para um membro de uma célula específica*, mas quem preenche o link pode estar em qualquer nível acima dela. Por isso o modelo não ganha um campo fixo por nível (ex. só `setor`); ganha dois campos genéricos: `nomeSolicitante` (string) e `nivelSolicitante` (enum `CELULA`, `SETOR`, `AREA`, `DISTRITO`, `REDE`). O beneficiário/célula de destino da cesta continua identificado pelos campos que já existem (`liderCelula`, `rede`) — a mudança é só em *quem pede*, não em *pra quem é*.

### Contratos API
| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `POST` | `/cestas/solicitacao` | Público (`permitAll`) | Líder de qualquer nível cria solicitação (`nomeSolicitante` + `nivelSolicitante` + dados do beneficiário/célula) → status `SOLICITADA`, dispara e-mail à coordenação |
| `GET` | `/cestas/solicitacoes` | `GERENCIAR_CESTAS` | Lista solicitações pendentes de validação (status `SOLICITADA`) |
| `PUT` | `/cestas/solicitacao/{id}/validar` | `GERENCIAR_CESTAS` | Define `dataRetirada` → status `AGENDADA` |
| `GET` | `/cestas/solicitacoes/agendadas` | `GERENCIAR_CESTAS` | Lista solicitações aguardando retirada (status `AGENDADA`) |
| `POST` | `/cestas/solicitacao/{id}/confirmar-entrega` | `GERENCIAR_CESTAS` | Caminho **alternativo**: confirmação manual, pelo ID → status `ENTREGUE`. Retorna 409 se já estava `ENTREGUE` ou se ainda não foi `AGENDADA` |
| `POST` | `/cestas/solicitacao/checkin/{token}` | `GERENCIAR_CESTAS` | Caminho **principal**: confirmação por token de QR Code (escaneado ou colado) → mesma lógica/mesmos 409 do endpoint acima |
| `GET` | `/cestas/solicitacoes/{id}/qrcode` | `GERENCIAR_CESTAS` | Imagem PNG do QR Code da solicitação (pra coordenação ver/baixar manualmente, mesmo sem e-mail cadastrado) |

### Riscos técnicos — como ficaram na entrega
- **Endpoint público sem proteção antiabuso → resolvido.** `POST /cestas/solicitacao` recebeu rate limit de 5 solicitações/hora por IP (`CestasSolicitacaoRateLimitFilter`, Bucket4j 8.19.0). Escopo deliberadamente cirúrgico: só este endpoint, não os demais públicos (que seguem sem proteção). Decisão, calibragem e armadilha de ordem de registro do filtro em `memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md`.
  **Correção de segurança (auditoria pré-deploy, 11/08/2026):** a chave do limite lia o primeiro elemento de `X-Forwarded-For`, que o nginx (`$proxy_add_x_forwarded_for`) **anexa** ao valor mandado pelo cliente — ou seja, o começo do header é a parte que o próprio cliente controla. O limite era burlável variando o header, e cada valor forjado abria uma entrada nova no mapa em memória (vazamento explorável, heap de 512m). Corrigido: chave agora sai de `X-Real-IP` (sobrescrito pelo nginx), fallback lê o *último* elemento do `X-Forwarded-For`, e o mapa tem teto de 10k entradas. Ver `memoria-tecnica/bugs/rate-limit-burlavel-por-x-forwarded-for-forjado.md`.
- **Payload público não pode forjar estado.** `solicitar()` zera `id`, `status`, `dataRetirada` e `entregueEm` antes de salvar — sem isso, um POST manual criaria uma cesta já `ENTREGUE`. Coberto por teste.
- **Permissão `SOLICITAR_CESTA` não foi criada** — perdeu o sentido com a correção de escopo (qualquer nível solicita, sem cadastro prévio). Validação e confirmação de entrega reaproveitam `GERENCIAR_CESTAS`.

### Fora do escopo desta entrega
- **Transição `CANCELADA`** existe no enum mas não tem endpoint que a acione.
- **Envio de QR Code por WhatsApp** — só por e-mail nesta entrega (mesma limitação da US-5.5/US-5.6: WhatsApp automatizado ainda não foi implementado no sistema).

### Entrega (TDD)
Backend: `CestasServiceTest` com 33 testes (os 22 da entrega original — solicitar/validar/listarAgendadas/confirmarEntrega, os 409 de dupla confirmação e de confirmação antes de agendar, payload forjado, notificação à coordenação — mais 11 novos da reintrodução do QR Code: geração de token na validação, envio de e-mail com anexo quando há `emailSolicitante`, falha de envio não derruba a validação, confirmação por token — sucesso/404/409/equivalência com o caminho por ID —, obtenção do QR Code — sucesso/sem token/inexistente) + `CestasSolicitacaoRateLimitFilterTest` (5). Suíte completa do backend verde. Frontend: página pública `/solicitarcesta` (fora do `HashRouter`, URL limpa, com campo de e-mail do solicitante) + tela interna `/app/cestas/solicitacoes` com três blocos ("Pendentes de validação", "Confirmar entrega via QR Code" — scanner de câmera embutido ou colar o código — e "Aguardando retirada", com botões "Ver QR Code" e "Confirmar Entrega"). E2E (suíte mockada): 49/49 verde, sem regressão. Verificação viva adicional via Docker com envio real de e-mail (QR Code em anexo confirmado no log do `EmailService` e na imagem renderizada). Lint e `npm run build` OK.

> **Achado na auditoria pré-deploy (11/08/2026):** o critério de aceite "a coordenação é notificada" não tinha sido implementado na entrega original — a lista acima chegou a listar isso como "fora do escopo", decisão revertida na auditoria porque é um critério de aceite aprovado, não um nice-to-have. `solicitar()` agora chama `emailService.notifyInstituto()` com solicitante, nível, beneficiário, contato, célula, rede e observações. Ver commit `406f7f9`.

> **Histórico do QR Code — três capítulos, todos em 12/08/2026:**
> 1. **Implementado (10/08, na entrega original):** token UUID gerado na transição pra `AGENDADA`, `GET /cestas/qrcode/{token}` devolvia PNG via ZXing, `POST /cestas/checkin/{token}` fazia o check-in por leitura.
> 2. **Removido (antes do deploy):** decisão tomada nesta sessão pra simplificar — confirmação manual pelo ID, sem token nem geração de imagem. `QrCodeService`, dependências ZXing e a coluna `qr_code_token` foram removidos; `checkin(token)` virou `confirmarEntrega(id)`.
> 3. **Reintroduzido (horas depois, mesmo dia):** esclarecido que a remoção do passo 2 não correspondia a um pedido real do cliente — o pedido original sempre incluiu QR Code. Reimplementado com um desenho mais completo que o original: `qrCodeToken` volta a ser gerado (sempre, na validação — não só quando há e-mail), `email_solicitante` novo (cifrado, opcional) permite envio automático do QR Code em anexo, `POST /cestas/solicitacao/checkin/{token}` (path reorganizado pra caber na regra de segurança já existente do `/cestas/solicitacao/**`) e `GET /cestas/solicitacoes/{id}/qrcode` pra visualização manual. A confirmação manual por ID (construída no passo 2) **não foi descartada** — virou o caminho alternativo permanente. Migration `V15` (a `V14` já estava em produção entre os passos 2 e 3, não podia mais ser editada).
>
> **Por que e-mail do solicitante, não do beneficiário:** o beneficiário nunca faz login no sistema — só é citado no formulário público. O solicitante (o líder que preencheu o pedido) tem relação contínua com o beneficiário e repassa/imprime o QR Code antes da retirada.
>
> **Link público sem `#` (12/08/2026):** `/solicitarcesta` é a única rota do app renderizada fora do `HashRouter` compartilhado — necessário para uma URL limpa (`institutomelvin.org/solicitarcesta`) utilizável em QR Codes/links impressos para supervisores e líderes externos. O restante do app (área logada + demais páginas do site) continua em `HashRouter`; migrar tudo para `BrowserRouter` seria uma mudança maior, não feita aqui. O Nginx de produção (`nginx.conf` do frontend) já tinha `try_files $uri $uri/ /index.html;`, então o fallback de SPA para essa URL limpa não exigiu mudança de infraestrutura — validado direto contra o Nginx real do container, não só contra o dev server.
>
> **Nota de processo (12/08/2026):** parte da revisão do passo 2 acima (redesign visual de `/solicitarcesta`, extração do `HashRouter`, correção do rótulo "Você é líder de:", ajuste de contraste dos badges de Cestas) foi feita por um agente de IA diferente (Gemini/Antigravity), rodando em paralelo no mesmo diretório de trabalho enquanto esta sessão também editava os mesmos arquivos (`CestasService.java` entre eles). As duas edições foram conferidas depois — sem conflito de fato (linhas diferentes do mesmo método), suíte completa revalidada e testada de ponta a ponta via Docker antes de aceitar o resultado como correto.

> ✅ **Migration V14 validada na homologação (Fase 5, 10/08/2026)** contra uma cópia do schema real de produção (`pg_dump --schema-only`, sem dados) restaurada em Postgres 14 local, com o histórico Flyway real de produção (V1-V11, checksums conferidos). As três migrations novas (V12/V13/V14) aplicaram limpo e a aplicação subiu em cima. A homologação revelou que `cestas.data_entrega` era `NOT NULL` no banco — divergindo da entidade, que a declara nullable —, o que fazia todo `POST /cestas/solicitacao` estourar 500; a V14 ganhou o `DROP NOT NULL` correspondente. Ver `memoria-tecnica/bugs/campo-novo-opcional-nao-persiste-nem-aceita-null.md`.

---

## MÓDULO 14: NOTIFICAÇÃO DE FALTA VIA WHATSAPP
**Peso: 🟡 MÉDIO (~3-4 dias, estimativa) | Status: 🔲 Backlog**

> Épico de referência: [CLAUDE.md #Épico 5 — US-5.6](./CLAUDE.md)

Decisão do cliente (11/08/2026): fica formalmente registrado como Backlog, não priorizado agora.
Sem contrato de API novo — plugaria no mesmo gatilho que a US-5.5 já criou em
`FrequenciaDiscenteService` (`cadastrar()` e `alterar()`), como canal adicional ao lado do
`EmailService`, nunca no lugar dele (falha no WhatsApp não pode derrubar o e-mail que já funciona).

**Decisão de produto pendente antes de estimar com precisão:** qual provedor/BSP contratar. O
custo por mensagem (~R$0,04–0,09, categoria "utilidade") é irrelevante pro volume do Instituto —
o que decide é a mensalidade do BSP (R$200–1.200/mês). Levantamento completo em CLAUDE.md
(Épico 5, US-5.6).

---

## MÓDULO 15: CENTRAL DE AJUDA (MANUAL DO SISTEMA)
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído (26/08/2026)**

> Épico de referência: [CLAUDE.md #Épico 11 — US-11.1](./CLAUDE.md)

### Sem contrato de API novo
Feature 100% frontend — nenhuma entidade, endpoint ou migration nova. Conteúdo estático (texto + prints) empacotado no bundle da SPA.

### Frontend
Nova feature folder `frontend/src/app/features/Manual/` (mesmo padrão de barrel `index.js` das demais features): `pages/Manual.jsx` + `Manual.module.scss`, conteúdo organizado em seções (Perfis de Acesso, Meu Perfil/Auto Frequência, Alunos, Voluntários, Frequência, Cestas Básicas, Avisos, Embaixadores, Amigos do Melvin, Relatórios/Rendimento, Permissões, Administração), navegação por abas laterais/pills, reaproveitando os tokens visuais já definidos em `index.scss` (`$cor-primaria`, `$cor-secundaria`, padrão de `.card`).

Rota `/app/manual` registrada em `Routes.jsx` com `role={perfisEquipe}` (mesmo array de 10 cargos já usado em Alunos/Voluntários/etc.) — não é uma permissão dinâmica nova, é leitura liberada a qualquer cargo autenticado. Botão "Manual do Sistema" adicionado em `Config.jsx` como primeiro card da página, fora do bloco condicional `{isAdm && (...)}`, visível a todos os cargos.

### Prints das telas
Capturados via Playwright, reaproveitando o mesmo mecanismo de mock de cookies/API já usado nas suítes E2E (`frontend/tests/fixtures.js` injeta `token`/`role`/`login` e intercepta chamadas de API) — sem depender de backend/Postgres rodando. Dados fictícios de exemplo em todas as telas capturadas (nenhum dado real de aluno, voluntário ou doador). Script de captura em `frontend/scripts/capture-manual-screenshots.mjs` (não faz parte da suíte de testes — é uma ferramenta de geração de assets, roda sob demanda).

---

## MÓDULO 16: CARGO TÉCNICO (TECH)
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído (27/08/2026)**

> Épico de referência: [CLAUDE.md #Épico 1 — US-1.5](./CLAUDE.md)

### Mudança de modelo
`UserRole` ganha o valor `TECH` (ordinal 10). Como o campo `role` de `User` é armazenado como `smallint` por enum ordinal (sem `@Enumerated` explícito), o check constraint `users_role_check` (gerado originalmente pelo Hibernate `ddl-auto=update`, travado em `0-9`) precisa de migration explícita — não é ajustado automaticamente quando o enum ganha um valor novo. Migration `V16__Add_tech_role_to_users_check.sql`.

### Contratos API
Sem endpoint novo. `PUT /auth/alterar_role/{matricula}/{role}` já aceita qualquer valor de `UserRole` via `UserRole.valueOf()` — TECH funciona automaticamente, sem mudança de contrato.

### Autorização (equivalente ao ADM em tudo)
- `SecurityConfiguration`: toda rota antes restrita a `hasRole("ADM")` ou `hasAnyRole("ADM", ...)` ganhou `"TECH"` ao lado (permissões, registro de usuário, alterar senha/role, imagens, diários).
- `PermissaoService.espelharAdmParaTech()`: roda no `@PostConstruct`, depois do seed de regras padrão — para toda `PermissaoRegra` que já libera `ADM` e ainda não libera `TECH`, adiciona `TECH` à lista. Cobre tanto os defaults novos (`ADM,TECH,...` já vem assim no código) quanto regras que já existiam em produção antes do TECH existir (sem isso, um `UPDATE` manual via SQL ou pela tela de Permissões seria necessário regra por regra).
- Frontend: `usePermissions().hasPermission()` trata `TECH` como bypass total (mesmo padrão do `ADM`); `perfisGerais`/`perfisEquipe` e toda rota antes restrita a `role="ADM"` em `Routes.jsx` ganharam `TECH` (Permissões, Calendário de Exceções, Arquivo Morto, frequências de administradores/diretores).

### UI
Rotulado como "Suporte Técnico": badge do cabeçalho (`Header/index.jsx`), coluna nova na matriz de Permissões (`ConfiguracoesPermissoes.jsx`), e nova opção de Função no cadastro de Voluntário (`funcao: "tecnico"` → mapeado para o cargo `TECH` em `getRoleFromFuncao`). Dashboard próprio em `/app/tech` (mesmo componente `HomeApp` dos demais cargos) e tela de frequência própria em `/voluntario/frequencias/tecnicos`, seguindo o mesmo padrão dos demais cargos — sem isso o cargo ficaria incompleto em relação aos outros 10 (sem destino de navegação ao clicar no título do sistema, por exemplo).

### Entrega (TDD)
Backend: 8 testes novos — `UserTest` (3: TECH resolve para `ROLE_TECH` via branch explícito, guarda de regressão do fallback `else`→`ROLE_DIRE` que DIRE ainda usa, ADM inalterado) e `PermissaoServiceTest` (4 novos: `hasPermission` libera TECH numa regra que já lista TECH, `espelharAdmParaTech()` adiciona TECH a uma regra com ADM, não mexe numa regra sem ADM, é idempotente quando TECH já está presente — método passou de `private` para visibilidade de pacote só para isso). Suíte completa revalidada, 0 regressão. Frontend: nova suíte `tests/tech-role.spec.js` (3 testes: card de Administração visível em Configurações, acesso a Permissões de Acesso, acesso a Calendário de Exceções, todos com o cargo sobrescrito para TECH via cookie + mock de `/auth/role_*`). Lint, build e suíte E2E completa (52/52) verdes.

### Fora do escopo desta entrega
Sem tela de "criar usuário" self-service — o primeiro login TECH foi criado manualmente (mesma limitação de bootstrap que qualquer ADM novo: `POST /auth/register` já exige estar autenticado como ADM/TECH).

---

## Modelagem de Dados (Resumo)

| Entidade | Chave Primária | Campos Notáveis |
|---|---|---|
| `User` | `id` | `login` (matrícula), `password` (Argon2), `role` (enum) |
| `PermissaoRegra` | `id` (UUID) | `role`, `permissao` |
| `Discente` | `matricula` (string, 7 dígitos) | `nome`, `sala`, `status`, `turno`, atividades extras |
| `Voluntario` | `matricula` (string) | `nome`, `funcao`, `salas[]`, `disponibilidade` |
| `FrequenciaDiscente` | `id` | `matricula + data` (unicidade lógica), `presenca_manha`, `presenca_tarde` |
| `FrequenciaVoluntario` | `id` | Mesma estrutura que FrequenciaDiscente |
| `AmigoMelvin` | `id` (UUID) | `email`, `valorMensal`, `status` (DonorStatus), `mesesContribuindo`, `stripeCustomerId`, `stripeSubscriptionId` |
| `DoacaoItem` | `id` | `nome`, `telefone`, `tipoItem`, `observacao` |
| `Cestas` | `id` (UUID) | `nome`, `contato`, `rede`, `lider_celula`, `dataEntrega`, `status` (StatusCesta, null nos cadastros diretos antigos), `nomeSolicitante`, `nivelSolicitante` (NivelHierarquico), `dataRetirada`, `entregueEm` |
| `Embaixador` | `id` (UUID) | `nome`, `apelido`, `descricao`, `instagram`, `status` |
| `Aviso` | `id` (UUID) | `titulo`, `corpo`, `status`, `data_inicio`, `data_final` |
| `Diario` | `id` | `matriculaAtrelada` (única), `fileName`, `filePath` |
| `Imagem` | `id` | `idAtrelado`, `tipo`, `fileName`, `filePath` |
| `Ocorrencia` | `id` (UUID) | `matricula_discente`, `categoria`, `descricao` (cifrado), `autor_login`, `data_ocorrencia`, `criado_em` |

---

## Migrations (Flyway)

| Versão | Descrição |
|---|---|
| V1 | Baseline (tabelas iniciais) |
| V2 | Constraints de unicidade (frequência) |
| V3 | Refatoração AmigoMelvin para suportar assinaturas Stripe |
| V4 | Criação tabela DoacaoItem |
| V5 | Adição de campos dia/mensagem em AmigoMelvin |
| V12 | `email_responsavel` em Discente (Módulo 11 — notificação de falta) |
| V13 | Criação da tabela `Ocorrencia` (Módulo 12 — registro de ocorrências) |
| V14 | Campos de solicitação/agendamento/entrega em Cestas (Módulo 13) |
| V15 | `email_solicitante` + `qr_code_token` em Cestas (Módulo 13 — QR Code reintroduzido) |
| V16 | Amplia check constraint `users_role_check` para o cargo TECH (Módulo 16) |
