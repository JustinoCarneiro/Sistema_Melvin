# 🗺️ ROADMAP.md — Blueprint de Arquitetura e Contratos

> **Última atualização:** 04/06/2026
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
| `Cestas` | `id` (UUID) | `nome`, `contato`, `rede`, `lider_celula`, `dataEntrega` |
| `Embaixador` | `id` (UUID) | `nome`, `apelido`, `descricao`, `instagram`, `status` |
| `Aviso` | `id` (UUID) | `titulo`, `corpo`, `status`, `data_inicio`, `data_final` |
| `Diario` | `id` | `matriculaAtrelada` (única), `fileName`, `filePath` |
| `Imagem` | `id` | `idAtrelado`, `tipo`, `fileName`, `filePath` |

---

## Migrations (Flyway)

| Versão | Descrição |
|---|---|
| V1 | Baseline (tabelas iniciais) |
| V2 | Constraints de unicidade (frequência) |
| V3 | Refatoração AmigoMelvin para suportar assinaturas Stripe |
| V4 | Criação tabela DoacaoItem |
| V5 | Adição de campos dia/mensagem em AmigoMelvin |
