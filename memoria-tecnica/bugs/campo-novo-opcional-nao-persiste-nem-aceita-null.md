---
tipo: bug
data: 2026-08-10
severidade: Alta
status: Resolvido
---

# Campo novo em entidade antiga: 500 por NOT NULL herdado + campo descartado no PUT

## Sintoma
Homologação da US-7.4/US-5.5 (Fase 5, contra cópia do schema real de produção) encontrou dois
defeitos que **passaram por toda a suíte unitária verde** (70/70) e só apareceram com a aplicação
de pé:

1. `POST /cestas/solicitacao` devolvia **500** — `null value in column "data_entrega" violates
   not-null constraint`. O endpoint público inteiro estava inutilizável.
2. O e-mail do responsável (`email_responsavel`) preenchido na ficha de um aluno **existente** era
   descartado em silêncio: `PUT /discente` respondia 200, e o campo voltava vazio. Como todo aluno
   em produção já existe, a notificação de falta (US-5.5) **nunca dispararia na prática**.

## Causa raiz
São dois sintomas do mesmo tema — **o banco e o service não acompanham a entidade JPA**:

1. **`ddl-auto: update` nunca relaxa constraint existente.** `Cestas.dataEntrega` é nullable na
   entidade Java hoje, mas a coluna foi criada como `NOT NULL` por uma versão antiga da entidade.
   O Hibernate em modo `update` só **adiciona** coisas — nunca remove um `NOT NULL` já gravado.
   Resultado: entidade e banco divergem silenciosamente, e o teste unitário (mock) e o de
   repositório (H2 recriado do zero a partir da entidade) **não conseguem** ver essa divergência.
   Só um banco com o schema real revela.
2. **`DiscenteService.alterar()` copia campo a campo** (~55 setters manuais, não `BeanUtils.copy`
   nem merge). Todo campo novo precisa ser adicionado ali à mão; esquecer não quebra nada — o PUT
   responde 200 e o dado some. `cadastrar()` não tem esse problema (salva a entidade inteira), por
   isso o campo funcionava em aluno novo e falhava em aluno existente.

## Solução
1. `V14__Add_solicitacao_fields_to_cestas.sql` ganhou `ALTER TABLE cestas ALTER COLUMN
   data_entrega DROP NOT NULL`. Validado aplicando a migration sobre uma cópia do schema real de
   produção (`pg_dump --schema-only`) restaurada em container local.
2. `existente.setEmail_responsavel(...)` adicionado ao `alterar()`, com teste que falha se sumir.
3. `nome` (do beneficiário) entrou na validação de `solicitar()` — também é `NOT NULL` no banco,
   então valia o mesmo 500; agora devolve 400 tratado.

## Como não repetir
- **Ao adicionar campo opcional a uma entidade antiga**, conferir se as colunas *já existentes*
  que o novo fluxo deixa em branco são `NOT NULL` no banco real:
  `SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = '<tabela>'`.
  A entidade Java **não** é fonte de verdade sobre isso.
- **Ao adicionar campo a `Discente`**, adicionar também no `alterar()`. Auditoria rápida dos
  campos que o `alterar()` esquece:
  ```bash
  # compara os `private <tipo> campo;` da entidade com os `existente.setX(` do service
  ```
  Na data desta nota, seguem **de fora** (pré-existentes, não corrigidos aqui):
  `contato_saida` — que **aparece no formulário** e portanto também é descartado ao editar — e
  `teatro`. Os `avaliacao*` ficam de fora de propósito (têm endpoint próprio com permissão
  granular, US-3.5).
- Suíte unitária verde **não** cobre esta classe de defeito. O que pegou foi a Fase 5 com schema
  real; vale repetir esse passo sempre que uma US mexer em entidade antiga.

## Ligado a
- [[rate-limit-apenas-solicitacao-cesta]]
