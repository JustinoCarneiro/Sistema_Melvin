# 🗺️ ROADMAP.md — Blueprint de Arquitetura e Contratos

> **Última atualização:** 08/10/2026 (prazo máximo de três meses para todo o escopo aberto)
> **Metodologia:** OndaDev 3.0 — sistema em produção (Fase 5); blueprint incremental das novas evoluções
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
| 14 | Notificação de Falta via WhatsApp (US-5.6) | 🟡 Médio | 4 | ⬜ Pendente |
| 15 | Central de Ajuda (Manual do Sistema) | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 16 | Cargo Técnico (TECH) | 🟡 Médio | 3-4 | ✅ Concluído |
| 17 | Ocorrências Técnicas | 🟢 Pequeno | 1-2 | ✅ Concluído |
| 18 | Revisão de fronteiras de acesso e regressões de segurança | 🔴 Grande | 7 | 🟡 Em andamento (3 lotes publicados em 10/10/2026) |
| 19 | Identidade e vínculo de responsáveis | 🔴 Grande | 7 | ⬜ Pendente |
| 20 | Comunicação da família, faltas e contatos | 🔴 Grande | 7 | ⬜ Pendente |
| 21 | Documentos da família e autorização de passeio | 🔴 Grande | 7 | ⬜ Pendente |
| 22 | Avisos direcionados | 🟡 Médio | 4 | ⬜ Pendente |
| 23 | Painel e acompanhamento do aluno | 🔴 Grande | 7 | ⬜ Pendente |
| 24 | Relatórios de desenvolvimento | 🟡 Médio | 4 | ⬜ Pendente |
| 25 | Agenda institucional, rotina e cardápio | 🔴 Grande | 7 | ⬜ Pendente |
| 26 | Agenda da família | 🟡 Médio | 4 | ⬜ Pendente |
| 27 | Navegação e páginas institucionais | 🟡 Médio | 4 | ⬜ Pendente |
| 28 | Espaços, equipe, notícias e consentimento de imagem | 🔴 Grande | 7 | ⬜ Pendente |
| 29 | Transparência, prestação de contas e documentos públicos | 🔴 Grande | 7 | ⬜ Pendente |
| 30 | Canal público de sugestões e reclamações | 🟡 Médio | 4 | ⬜ Pendente |

> Módulos 14 e 18–30: a coluna **Dias** usa o limite superior do peso (Grande 7, Médio 4), como na fórmula da seção "Evolução 08/10/2026". Pesos preliminares até a Fase 3.

---

## Prazo Técnico Histórico (estimativa original, não usar para a evolução de 2026/2027)

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

## Evolução 08/10/2026 — escopo aberto e prazo máximo de 08/01/2027

**Abrangência:** as 16 histórias novas do site (`US-10.3`–`US-10.18`), as 8 histórias da Área da Família (`US-13.1`–`US-13.8`), o backlog anterior `US-5.6` (módulo 14) e a revisão e validação do cancelamento de cestas acrescentado à `US-7.4`. Este último foi implementado e endurecido em `c2eed41` (versão reaplicada e ampliada do rascunho `041abf7`) e **publicado em produção em 09/10/2026 às 11:21**; conferido em leitura em 09/10: fontes e imagens no servidor correspondem ao `c2eed41`, Flyway sem migração pendente e API saudável. Em 09/10 o `c2eed41` também virou a `main` do GitHub (CI verde) e a `main` local foi alinhada a ele; o rascunho antigo ficou só na branch local `main-pre-reconciliacao`, sem publicação. Falta a validação humana do Instituto. Os módulos 1–17 mantêm o status histórico acima, exceto o 14, agora incluído no escopo restante. Esta seção substitui o total histórico de 43 dias para decisões sobre o trabalho **restante**.

### Limite e cálculo OndaDev 3.0

- **Prazo máximo do cliente:** **08/01/2027** (três meses desde 08/10/2026). **Capacidade confirmada:** uma pessoa conduzindo o desenvolvimento, com agentes de IA. O [playbook OndaDev 3.0](./docs/Metodologia_de_Desenvolvimento_-_Onda.md) (apontador; texto canônico em `onda-starter`, seção 7, "Previsibilidade — o prazo calculado") foi desenhado para exatamente esse cenário e estima por peso de módulo, não por horas. Contar agentes como capacidade extra, ou somar margem por cima da fórmula, duplicaria o que o método já assume: o resultado da fórmula é o "prazo técnico blindado" do próprio playbook (limite superior de cada peso).
- De 09/10/2026 a 08/01/2027 há **59 dias úteis** (segunda a sexta, excluídos 12/10, 02/11, 20/11, 24–25/12, 31/12/2026 e 01/01/2027; [feriados de 2026](https://pesquisa.apps.tcu.gov.br/doc/norma/Portaria/TCU%20E%20TCU/1/2026/)). Premissa conservadora: 24 e 31/12 são pontos facultativos tratados como não úteis; se forem trabalhados, a janela sobe para 61 dias.
- **Fórmula OndaDev (`Prazo = Fase 2 + Σ módulos + 2d de Fase 5`) para o escopo restante:** Fase 2 com identidade existente (2) + módulos Grandes (8 × 7 = 56) + módulos Médios (6 × 4 = 24) + Fase 5 (2) + revisão e validação do cancelamento de cestas (1) = **85 dias úteis**. A linha de base termina em **17/02/2027** (08–09/02/2027, Carnaval, tratados como sem expediente); **não atende** ao prazo máximo. Déficit: **26 dias úteis** (24, se 24 e 31/12 forem trabalhados).
- Mesmo no limite inferior dos pesos (Grande 5, Médio 3), 8 × 5 + 6 × 3 + 2 + 2 + 1 = **63 dias**, ainda 4 além da janela. Não é defensável registrar 08/01 como entrega garantida com uma pessoa, escopo integral e as evidências exigidas.
- A data de 08/01 permanece como **restrição do cliente e risco aberto** para o escopo integral. O dono do projeto decidiu internamente dividir a entrega: núcleo de 52 dias úteis até 28/12/2026 (7 dias úteis antes do limite) e restante com segunda homologação até 19/02/2027, totalizando 87 dias úteis. O Instituto ainda precisa aceitar o prazo da etapa 2; ver `memoria-tecnica/decisoes/entrega-em-duas-etapas-prazo-08-01-2027.md`. Uma eventual redução de estimativa só vale após evidência real de velocidade (timesheet em `docs/METRICAS-PROJETO.md`, recalibração dos pesos), sem suprimir testes, segurança ou homologação.

### Gates da metodologia antes de iniciar e encerrar a evolução

| Etapa | Evidência / condição de passagem | Situação em 08/10/2026 |
|---|---|---|
| Fase 1 · G1 | Fechar decisões ainda abertas na spec: emissão de credenciais e vínculo familiar, fonte dos indicadores, escopo do cadastro editorial e provedor de WhatsApp. Registrar mudanças primeiro em `CLAUDE.md` e `docs/product/spec.md`. | ⬜ Pendente |
| Fase 2 · G2/G3 | Produzir protótipo estático navegável das novas telas, com acessibilidade AA e estados de erro/vazio/carregamento; obter aceite do Instituto e congelamento visual. A identidade existe e está em produção (`docs/DESIGN_SYSTEM.md`, tokens em `frontend/src/index.scss` e em `CLAUDE.md` §5), o que sustenta Fase 2 ≈ 2 dias; o diretório `design/` referenciado em `AGENTS.md` ainda não existe neste checkout e o contrato deve ser reconciliado. | ⬜ Pendente |
| Fase 3 | Após G3, fechar ERD e relações exatas, contratos Request/Response com validação e autorização no servidor, rastreabilidade história ↔ módulo (tabela abaixo, a confirmar) e controle ↔ módulo, além de threat model dos módulos com PII/auth. `docs/security/` (threat model, controles, relatório de revisão) ainda não existe neste repositório e nasce aqui. A modelagem, os pesos e os contratos abaixo são **propostas**, não o blueprint aprovado. | ⬜ Pendente |
| Fase 4 · G4/G5/G6 | Implementar módulo por módulo com teste falhando antes da mudança, Green/Refactor, revisão estática de segurança nos riscos, um autor por PR, outro agente revisando R1/R2, small commits, status canônico no ROADMAP e linha de timesheet em `docs/METRICAS-PROJETO.md`. Agentes em paralelo usam worktrees isolados, nunca o mesmo checkout. | ⬜ Pendente |
| Fase 5 · G7 | Smoke Docker, toda a esteira de testes, UAT humano, migrações para a frente e rollback ensaiado, relatório de controles/bloqueadores de segurança, revisão manual da `memoria-tecnica/` e análise `docs/ANALISE-PROJETO-<nome>.md`. Deploy via CI/CD só com autorização explícita e alvo confirmado. | ⬜ Pendente |

A correção de rotas públicas identificada no módulo 18 pode ser tratada **como manutenção de segurança separada do novo portal**, com seu próprio contrato, TDD e revisão proporcional ao risco, antes do G3 visual. A codificação das novas histórias 10 e 13 só começa após G3 e a Fase 3 concluída. Mudanças de autenticação e de dados de crianças são R2 pelo contrato local; qualquer migration que altere esses dados também segue R2. Migrations sem PII seguem a classificação local de R1 até que o contrato canônico do projeto seja reconciliado com o playbook 3.0.

**Estado da previsão:** há módulos e pesos definidos para orientar a decisão, mas ainda **não há cronograma de entrega do escopo integral que caiba em 08/01/2027** com a capacidade confirmada. A divisão em duas etapas é decisão interna, sujeita ao aceite do Instituto; as datas por módulo serão fixadas após G3. A linha de base com uma homologação termina em 17/02/2027; a execução em duas etapas, com duas homologações, termina em 19/02/2027. Nenhuma das datas constitui aceite do Instituto.

**Dependências duras para ordenar a Fase 4:** o módulo 19 (identidade) antes de qualquer rota `/familia/**` (módulos 20–24 e 26) e, pela regra "o coração entra cedo", junto com o 18 abre a Fase 4; o 18 antes do lançamento da Área da Família; o 25 antes do 26 (a agenda da família cruza a agenda institucional); o registro de consentimento (módulo 28) antes de publicar qualquer imagem de pessoa; provedor e template aprovados antes do módulo 14.

### Gates que precisam ser resolvidos no início

1. **Acesso e identidade:** confirmar com o Instituto quem valida o vínculo responsável–aluno e entrega a credencial inicial. Para estimar, assumir provisionamento pela secretaria/coordenação após conferência presencial/documental, sem autocadastro por CPF/matrícula e sem reaproveitar a conta de funcionário. Os três primeiros lotes (rotas internas que respondiam sem login, a lista pública de embaixadores e a auditoria de segurança do sistema inteiro) foram corrigidos e publicados em 10/10/2026 (ver `memoria-tecnica/bugs/rotas-internas-abertas-sem-login-expoem-dados-pessoais.md`). O módulo 18 segue em andamento: faltam reduzir o que cada rota devolve e revisar as demais rotas públicas, com os detalhes fora deste repositório até a correção. Isso não depende da Área da Família e deve terminar antes do lançamento dela. O cliente deve aprovar o fluxo de credenciais e o impacto das rotas existentes.
2. **Conteúdo e rotina editorial:** Instituto entrega textos, fotos, horários, lista de parceiros, documentos e números de impacto com responsável pela publicação. O orçamento inclui cadastro interno mínimo para agenda, cardápio, notícias, documentos e números periódicos, porque as histórias de leitura dependem de alguém mantê-los atualizados, embora a spec deixe o desenho do CRUD fora das histórias. Assumir números de impacto informados e aprovados manualmente pelo Instituto, com período e fonte; integração automática é mudança de escopo.
3. **Consentimento e proteção:** registrar evidência/validade da autorização de imagem antes de publicar pessoa identificável; definir quem pode publicar e retirar conteúdo. Confirmar com a coordenação quais observações pedagógicas são aptas à família. Dados de crianças, contatos, justificativas e relatórios seguem `docs/SEGURANCA_E_LGPD.md`; APIs da família devolvem DTOs mínimos.
4. **WhatsApp:** decidir e contratar o provedor oficial, número remetente e template de utilidade antes do módulo 14. O prazo de aprovação externa do template não está nos 4 dias de desenvolvimento; se atrasar, desloca a entrega integral. `US-5.6` estava no backlog sem prioridade, mas entrou nesta previsão por “finalizar tudo”.
5. **Aceite e produção:** reservar responsáveis do Instituto para conferir conteúdo, vínculo de pelo menos duas famílias fictícias e autorização de passeio. Migrações Flyway novas serão progressivas; versões já aplicadas não serão editadas. Publicação e escrita em produção exigem autorização R2 separada quando o pacote estiver pronto.
6. **Dados do painel (US-13.2 e US-13.3):** o cadastro atual não tem foto do aluno nem professor; "horário" existe só como `turno`; não há registro de "conteúdos trabalhados" (o Diário é só upload de arquivo). Existem `sala`, `turno`, os indicadores de atividades (`karate`, `ballet`, `informatica`…) e as notas `avaliacao*` — a `avaliacaoPsicologico` não pode sair para a família (ver `memoria-tecnica/bugs/dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica.md`). Antes de fechar o peso do módulo 23, decidir com o Instituto o que o painel mostra: só campos existentes, ou captura nova. Captura nova — foto de criança incluída — é escopo adicional, com consentimento e LGPD, e não está nos 7 dias.

### Rastreabilidade história → módulo

Verificado em 08/10/2026 contra `docs/product/spec.md`: as 16 histórias `US-10.3`–`US-10.18`, as 8 histórias `US-13.1`–`US-13.8` e a `US-5.6` têm módulo dono; nenhuma ficou fora da estimativa. Cada história pertence a um único módulo (N:1). Mapeamento preliminar, a confirmar na Fase 3.

| Módulo | Histórias |
|---|---|
| 14 | `US-5.6` |
| 18 | Controle sem história própria: revisão das fronteiras de acesso de rotas públicas já existentes (gate 1), antes do lançamento da Área da Família |
| 19 | `US-13.1` |
| 20 | `US-13.7` |
| 21 | `US-13.6` |
| 22 | `US-13.8` |
| 23 | `US-13.2`, `US-13.3` |
| 24 | `US-13.4` |
| 25 | `US-10.8`, `US-10.9` |
| 26 | `US-13.5` |
| 27 | `US-10.3`, `US-10.4`, `US-10.6`, `US-10.11`, `US-10.16`, `US-10.17` |
| 28 | `US-10.5`, `US-10.7`, `US-10.10` |
| 29 | `US-10.12`, `US-10.13`, `US-10.14`, `US-10.15` |
| 30 | `US-10.18` |
| (1 dia) | `US-7.4`, cancelamento de cestas: publicado em produção em 09/10/2026 e na `main` do GitHub (`c2eed41`); falta a validação humana do Instituto |

### Desenho de dados proposto para o escopo novo

Modelos abaixo são **propostas para fechar antes da implementação**, não migrations existentes. PKs e FKs são explícitas; dados pessoais de conteúdo devem seguir a cifragem adotada no projeto (hashes de senha seguem Argon2). `Discente`, `FrequenciaDiscente`, `Aviso` e `User` já existem e são preservados.

| Entidade / mudança | Campos centrais (tipo) | Relação e controle |
|---|---|---|
| `responsavel_conta` | `id UUID PK`, `login VARCHAR UNIQUE`, `senha_hash VARCHAR`, `ativo BOOLEAN`, `criado_em TIMESTAMP` | Identidade separada de `users`/cargos de equipe; senha Argon2. |
| `responsavel_discente` | `responsavel_id UUID FK`, `discente_id UUID FK`, `vinculo VARCHAR`, `ativo BOOLEAN`, `validado_por UUID`, `validado_em TIMESTAMP` | N:N; PK composta; resolve vários filhos e revogação de vínculo. |
| `justificativa_falta` | `id UUID PK`, `frequencia_id UUID FK`, `turno VARCHAR`, `autor_id UUID FK`, `texto TEXT cifrado`, `anexo_ref VARCHAR NULL`, `criado_em TIMESTAMP`, `revogado_em TIMESTAMP NULL`, `revogado_por UUID NULL` | Registro original `F` permanece; estado justificado é derivado da justificativa ativa por turno; coordenação pode revogar. Reconciliar na Fase 3 com `FrequenciaDiscente.justificativa` (texto livre do professor), que a consulta de `FaltaAlertaDTO` já usa para ignorar faltas justificadas no alerta de 4 ou mais faltas. |
| `auditoria_contato` | `id UUID PK`, `discente_id UUID FK`, `autor_id UUID FK`, `campo VARCHAR`, `antes/depois TEXT cifrados`, `alterado_em TIMESTAMP`, `notificado_em TIMESTAMP NULL` | Rastreia alteração de telefone e de contato de saída; nunca registrar valores em log. |
| `documento_familia` e `autorizacao_passeio` | Documento: `id UUID PK`, `discente_id UUID FK`, `tipo VARCHAR`, `titulo VARCHAR`, `texto TEXT cifrado`, `prazo TIMESTAMP NULL`, `publicado_em TIMESTAMP`. Aceite: `id UUID PK`, `documento_id UUID FK`, `responsavel_id UUID FK`, `texto_aceito TEXT cifrado`, `aceito_em TIMESTAMP` | Snapshot imutável do texto aceito; unicidade por documento e responsável, verificação de prazo no servidor. |
| `relatorio_desenvolvimento` | `id UUID PK`, `discente_id UUID FK`, `periodo_inicio/fim DATE`, `avancos/reforcos/orientacoes TEXT cifrados`, `publicado_em TIMESTAMP NULL`, `autor_id UUID` | Só versão publicada e destinada à família sai no DTO. |
| `evento_institucional`, `rotina_turma`, `cardapio_dia` | Evento: `id UUID`, `tipo/titulo VARCHAR`, `inicio/fim TIMESTAMP`, `sala INTEGER NULL`, `publicado BOOLEAN`. Rotina: `id UUID`, `sala INTEGER`, `dia_semana SMALLINT`, `inicio/fim TIME`, `atividade VARCHAR`. Cardápio: `id UUID`, `data DATE UNIQUE`, `descricao TEXT`, `publicado BOOLEAN` | Agenda pública por período; agenda familiar filtra sala/filho. |
| `conteudo_publico`, `publicacao`, `consentimento_imagem`, `publicacao_pessoa` | Conteúdo: `id UUID`, `tipo VARCHAR`, `titulo VARCHAR`, `corpo TEXT`, `publicado_em TIMESTAMP`. Publicação: `id UUID`, `tipo VARCHAR`, `data DATE`, `foto_ref VARCHAR`, `relato TEXT`, `publicado_em TIMESTAMP`. Consentimento: `id UUID`, `discente_id UUID FK NULL`, `voluntario_id UUID FK NULL`, `vigente_ate DATE NULL`, `evidencia_ref VARCHAR`, `revogado_em TIMESTAMP NULL` (exatamente uma FK de pessoa). Associação: `publicacao_id UUID FK`, `consentimento_id UUID FK` | Conteúdo editorial sem expor cadastro interno; publicação de imagem só com consentimento vigente conferido para **todas** as pessoas identificáveis. |
| `impacto_periodo`, `prestacao_contas`, `documento_publico` | Impacto: `id UUID`, `inicio/fim DATE`, `indicador VARCHAR`, `valor NUMERIC`, `fonte VARCHAR`, `publicado_em TIMESTAMP`. Contas: `id UUID`, `inicio/fim DATE`, `categoria VARCHAR`, `recebido/distribuido NUMERIC`, `unidade VARCHAR`. Documento: `id UUID`, `categoria/titulo VARCHAR`, `arquivo_ref VARCHAR`, `publicado_em TIMESTAMP` | Somente agregados aprovados e arquivos institucionais publicados; nenhum beneficiário individual. |
| `manifestacao` | `id UUID PK`, `tipo VARCHAR`, `texto TEXT cifrado`, `recebido_em TIMESTAMP`, `status VARCHAR` | Anônima; rate limit no endpoint público; e-mail interno usa dados mínimos. |
| `aviso_destinatario` + `Aviso.visibilidade` | `aviso_id UUID FK`, `discente_id UUID FK`; `visibilidade VARCHAR` em `Aviso` | Aviso geral mantém comportamento; direcionado só aparece para responsáveis com vínculo ativo ao aluno; o `GET /aviso` público existente deve excluir direcionados. |

### Contratos externos propostos (antes do código)

Paths abaixo são relativos ao backend; o Nginx publica sob `/api/v1`. Exceto `POST /familia/auth/login`, todas as rotas `/familia/**` exigem token de família e **derivam o aluno da conta autenticada**, validando o vínculo em toda chamada. Nunca confiam em `responsavelId` enviado pelo cliente. Respostas de erro padronizadas: `400 {code,message}` para entrada inválida, `401` para sessão inválida, `403` para permissão funcional ausente, `404` para recurso inexistente ou vínculo ausente (sem revelar aluno de outra família), `409` para conflito de estado, `429` para limite público. DTOs públicos nunca contêm dados pessoais sensíveis.

| Módulo | Método e path | Request → resposta de sucesso (campos essenciais) |
|---|---|---|
| 19 | `POST /familia/auth/login` | `{login:string, senha:string}` → `200 {token:string, expiraEm:datetime}`; erro genérico `401`, sem enumeração. |
| 19 | `GET /familia/filhos` | Token → `200 [{id:UUID, nome:string, sala:int}]` apenas vínculos ativos. Provisionamento: `POST /interno/responsaveis` `{login, vinculos:[discenteId]}` → `201 {id, login, instrucoesEntrega}` para coordenação; senha temporária entregue por canal aprovado, nunca em log. |
| 20 | `POST /familia/filhos/{id}/comunicacoes` | `{tipo: MENSAGEM|ATENDIMENTO, texto:string}` → `202 {protocolo:UUID}`; encaminha por e-mail, sem caixa de mensagens interna. |
| 20 | `POST /familia/filhos/{id}/faltas/{frequenciaId}/justificativas` | `{turno:MANHA|TARDE, texto:string, anexoRef?:string}` → `201 {id, estado:JUSTIFICADA, criadoEm}`; `409` se não há falta elegível ou já foi justificada. `POST /interno/justificativas/{id}/revogar` → `200 {estado:REVOGADA}` para coordenação. |
| 20 | `PUT /familia/filhos/{id}/contato` | `{tipo:TELEFONE|CONTATO_SAIDA, valor:string}` → `200 {atualizadoEm}`; alteração de saída gera notificação à equipe/outro responsável. |
| 21 | `GET /familia/filhos/{id}/documentos` | Token → `200 [{id,tipo,titulo,prazo,estado}]`; só documentos destinados ao filho. `POST /familia/filhos/{id}/documentos/{documentoId}/autorizar` → `201 {autorizacaoId, aceitoEm}`; `409` após prazo/aceite duplicado. Cadastro interno de documento: `POST /interno/documentos-familia` `{discenteIds,tipo,titulo,texto,prazo}` → `201 {id}`. |
| 22 | `GET /familia/filhos/{id}/avisos` | Token → `200 [{id,titulo,corpo,tipo:GERAL|DIRECIONADO}]`; criação interna `POST /interno/avisos-direcionados` `{discenteIds,titulo,corpo,inicio,fim}` → `201 {id}`. |
| 23 | `GET /familia/filhos/{id}/resumo` | Token → `200 {nome,fotoRef,sala,professor,horario,frequenciaMes}`. `GET /familia/filhos/{id}/acompanhamento?mes=YYYY-MM` → `200 {frequencias,atividades,evolucao,conteudos,observacoesPublicaveis}`. |
| 24 | `GET /familia/filhos/{id}/desenvolvimento` | Token → `200 [{periodo,avancos,reforcos,orientacoes}]` (lista vazia com estado explicativo na UI). `POST /interno/desenvolvimento` `{discenteId,periodo,avancos,reforcos,orientacoes}` → `201 {id}`; publicação interna explícita. |
| 25–26 | `GET /publico/agenda?de=DATE&ate=DATE`, `GET /publico/cardapio?semana=DATE`, `GET /familia/filhos/{id}/agenda?de=DATE&ate=DATE` | `200` com eventos/rotina publicados, dias do cardápio ou compromissos filtrados pelo filho. Cadastro interno: `POST/PUT /interno/eventos`, `/interno/rotinas`, `/interno/cardapios` com campos da tabela de dados acima; `201/200 {id}`. |
| 27–29 | `GET /publico/conteudos/{tipo}`, `/publico/publicacoes?tipo=...`, `/publico/impacto?periodo=...`, `/publico/prestacoes`, `/publico/documentos` | `200` com itens publicados e agregados. `POST/PUT /interno/conteudos`, `/interno/publicacoes`, `/interno/impactos`, `/interno/prestacoes`, `/interno/documentos-publicos` → `201/200 {id}`; mídia e documento só publicados após revisão/consentimento. |
| 30 | `POST /publico/manifestacoes` | `{tipo:SUGESTAO|RECLAMACAO, texto:string}` → `202 {protocolo:UUID}`; sem login; `429` sob abuso. Consulta interna apenas por coordenação/secretaria. |
| 14 | Nenhum endpoint público novo | Mesmo gatilho da US-5.5; WhatsApp independente do envio de e-mail. Falha do provedor fica em auditoria técnica sem expor telefone. |

**Critério de encerramento:** cada história tem teste de aceite correspondente, incluindo 403/404 entre famílias, ausência de observação sensível, consentimento de imagem, assinatura após prazo, reversão de falta e rate limit. Rodar `./mvnw test --batch-mode --no-transfer-progress`, `npm run lint`, `npm run build`, `npm test`, smoke via Docker, revisão de segurança/LGPD e aceite humano antes da autorização de deploy. Atualizar status e datas reais por módulo, sem confundir previsão com entrega.

---

## MÓDULO 1: AUTENTICAÇÃO & RBAC DINÂMICO
**Peso: 🔴 GRANDE (~5-7 dias) | Status: ✅ Concluído**

> Épicos de referência: [spec.md #Épico 1](./docs/product/spec.md) e [spec.md #Épico 2](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 3](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 4](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 5](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 6](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 7](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 8](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 9](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 10](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 5 — US-5.5](./docs/product/spec.md)

### Mudança de modelo
`Discente` ganha campo novo `email_responsavel` (cifrado, `SensitiveDataConverter`) — nome snake_case pra seguir a convenção já usada em `contato_pai`/`contato_mae`/`contato_saida` no mesmo arquivo (não `emailResponsavel`, como a spec inicial cogitava). Migration `V12__Add_email_responsavel_to_discente.sql`.

### Fluxo
`FrequenciaDiscenteService.cadastrar()` passa a, ao salvar presença `F` em qualquer turno (manhã e/ou tarde), chamar `EmailService.sendEmail()` de forma assíncrona (best-effort — `EmailService` já engole falha de envio internamente, não derruba o cadastro de frequência). Sem `email_responsavel` cadastrado, a frequência é salva normalmente e nenhum envio é tentado. Sem contrato de API novo (é efeito colateral do `POST /frequenciadiscente` já existente).

### Entrega (TDD)
4 testes novos em `FrequenciaDiscenteServiceTest` (falta manhã, falta tarde, sem falta, falta sem e-mail cadastrado) — RED confirmado (erro de compilação por método inexistente) antes da implementação, GREEN depois. Suíte completa do backend: 50/50 verde. Campo "E-mail do Responsável" adicionado ao formulário de Aluno (frontend) — sem esse campo de UI a coluna nova nunca seria preenchida.

---

## MÓDULO 12: REGISTRO DE OCORRÊNCIAS DO ALUNO
**Peso: 🟡 MÉDIO (~3-4 dias) | Status: ✅ Concluído (10/08/2026)**

> Épico de referência: [spec.md #Épico 3 — US-3.7](./docs/product/spec.md)

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
**Peso: 🔴 GRANDE (~5-7 dias) | Status: ✅ Concluído (10/08/2026, revisado em 12/08/2026 e 09/10/2026)**

> Épico de referência: [spec.md #Épico 7 — US-7.4](./docs/product/spec.md)

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
| `PUT` | `/cestas/solicitacao/{id}/cancelar` | `GERENCIAR_CESTAS` | Cancela solicitação `SOLICITADA` ou `AGENDADA` → status `CANCELADA`; invalida o QR e retorna 409 para estado incompatível ou corrida perdida |
| `POST` | `/cestas/solicitacao/{id}/confirmar-entrega` | `GERENCIAR_CESTAS` | Caminho **alternativo**: confirmação manual, pelo ID → status `ENTREGUE`. Retorna 409 se já estava `ENTREGUE` ou se ainda não foi `AGENDADA` |
| `POST` | `/cestas/solicitacao/checkin/{token}` | `GERENCIAR_CESTAS` | Caminho **principal**: confirmação por token de QR Code (escaneado ou colado) → mesma lógica/mesmos 409 do endpoint acima |
| `GET` | `/cestas/solicitacoes/{id}/qrcode` | `GERENCIAR_CESTAS` | Imagem PNG do QR Code da solicitação (pra coordenação ver/baixar manualmente, mesmo sem e-mail cadastrado) |

### Riscos técnicos — como ficaram na entrega
- **Endpoint público sem proteção antiabuso → resolvido.** `POST /cestas/solicitacao` recebeu rate limit de 5 solicitações/hora por IP (`CestasSolicitacaoRateLimitFilter`, Bucket4j 8.19.0). Escopo deliberadamente cirúrgico: só este endpoint, não os demais públicos (que seguem sem proteção). Decisão, calibragem e armadilha de ordem de registro do filtro em `memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md`.
  **Correção de segurança (auditoria pré-deploy, 11/08/2026):** a chave do limite lia o primeiro elemento de `X-Forwarded-For`, que o nginx (`$proxy_add_x_forwarded_for`) **anexa** ao valor mandado pelo cliente — ou seja, o começo do header é a parte que o próprio cliente controla. O limite era burlável variando o header, e cada valor forjado abria uma entrada nova no mapa em memória (vazamento explorável, heap de 512m). Corrigido: chave agora sai de `X-Real-IP` (sobrescrito pelo nginx), fallback lê o *último* elemento do `X-Forwarded-For`, e o mapa tem teto de 10k entradas. Ver `memoria-tecnica/bugs/rate-limit-burlavel-por-x-forwarded-for-forjado.md`.
- **Payload público não pode forjar estado.** `solicitar()` zera `id`, `status`, `dataRetirada` e `entregueEm` antes de salvar — sem isso, um POST manual criaria uma cesta já `ENTREGUE`. Coberto por teste.
- **Transições concorrentes não podem sobrescrever o estado vencedor.** Validação, cancelamento e confirmação de entrega usam updates condicionais pelo status atual. Se outra operação vencer primeiro, a segunda recebe 409; o cancelamento também apaga o token de QR Code. O CRUD geral lista apenas registros com `status` nulo, zera campos internos na criação e recusa edição/exclusão de solicitações. A rota real de exclusão (`DELETE /cestas/{id}`) está protegida por `GERENCIAR_CESTAS`. Ver `memoria-tecnica/bugs/cancelamento-cesta-sobrescreve-transicao-concorrente.md`.
- **Permissão `SOLICITAR_CESTA` não foi criada** — perdeu o sentido com a correção de escopo (qualquer nível solicita, sem cadastro prévio). Validação e confirmação de entrega reaproveitam `GERENCIAR_CESTAS`.

### Fora do escopo desta entrega
- **Envio de QR Code por WhatsApp** — só por e-mail nesta entrega (mesma limitação da US-5.5/US-5.6: WhatsApp automatizado ainda não foi implementado no sistema).

### Entrega (TDD)
Backend: `CestasServiceTest` com 33 testes (os 22 da entrega original — solicitar/validar/listarAgendadas/confirmarEntrega, os 409 de dupla confirmação e de confirmação antes de agendar, payload forjado, notificação à coordenação — mais 11 novos da reintrodução do QR Code: geração de token na validação, envio de e-mail com anexo quando há `emailSolicitante`, falha de envio não derruba a validação, confirmação por token — sucesso/404/409/equivalência com o caminho por ID —, obtenção do QR Code — sucesso/sem token/inexistente) + `CestasSolicitacaoRateLimitFilterTest` (5). Suíte completa do backend verde. Frontend: página pública `/solicitarcesta` (fora do `HashRouter`, URL limpa, com campo de e-mail do solicitante) + tela interna `/app/cestas/solicitacoes` com três blocos ("Pendentes de validação", "Confirmar entrega via QR Code" — scanner de câmera embutido ou colar o código — e "Aguardando retirada", com botões "Ver QR Code" e "Confirmar Entrega"). E2E (suíte mockada): 49/49 verde, sem regressão. Verificação viva adicional via Docker com envio real de e-mail (QR Code em anexo confirmado no log do `EmailService` e na imagem renderizada). Lint e `npm run build` OK.

> **Cancelamento (09/10/2026):** acrescentados testes de serviço para os estados aceitos/recusados, isolamento do CRUD geral e corridas com validação/entrega; testes JPA das atualizações condicionais; testes MockMvc das permissões; e três fluxos Playwright com dados sintéticos, incluindo recuperação após 409. Smoke pré-deploy aprovado: backend 135/135, frontend 60/60, lint, build, Docker Compose e varredura de segredos — 12 gates, 0 falhas.

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
**Peso: 🟡 MÉDIO (4 dias, estimativa) | Status: ⬜ Pendente**

> Épico de referência: [spec.md #Épico 5 — US-5.6](./docs/product/spec.md)

Decisão do cliente (11/08/2026): registrado originalmente como backlog. A previsão integral de 08/10/2026 inclui sua execução neste módulo.
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

> Épico de referência: [spec.md #Épico 11 — US-11.1](./docs/product/spec.md)

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

> Épico de referência: [spec.md #Épico 1 — US-1.5](./docs/product/spec.md)

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

## MÓDULO 17: OCORRÊNCIAS TÉCNICAS
**Peso: 🟢 PEQUENO (~1-2 dias) | Status: ✅ Concluído (30/08/2026)**

> Épico de referência: [spec.md #Épico 12 — US-12.1](./docs/product/spec.md)

### Mudança de modelo
Entidade `OcorrenciaTecnica` nova (migration `V17`): `titulo`, `categoria` (enum `BUG`, `INCIDENTE`, `MANUTENCAO`, `DECISAO_TECNICA`, `SEGURANCA`), `severidade` (enum `BAIXA`, `MEDIA`, `ALTA`), `descricao` (TEXT), `resolvido` (boolean), `autorLogin`, `dataOcorrencia`, `criadoEm`. Diferente de `Ocorrencia` (US-3.7, sobre alunos), aqui os campos usam camelCase normal (Hibernate `CamelCaseToUnderscoresNamingStrategy` de sempre) — o underscore em `matricula_discente`/`autor_login`/`data_ocorrencia`/`criado_em` era um caso isolado daquela entidade, não um padrão do projeto a repetir. Sem `SensitiveDataConverter`: dado técnico interno do sistema, não é dado pessoal sujeito à LGPD.

### Contratos API
| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| `POST` | `/ocorrencias-tecnicas` | `hasRole("TECH")` | Cria ocorrência; autor extraído do token (não do payload), `resolvido` sempre nasce `false` mesmo se o payload tentar forjar `true` |
| `GET` | `/ocorrencias-tecnicas` | `hasRole("TECH")` | Lista todas, ordem cronológica decrescente (`dataOcorrencia` desc, `criadoEm` desc como desempate) |
| `PUT` | `/ocorrencias-tecnicas/{id}/alternar-resolvido` | `hasRole("TECH")` | Alterna `resolvido` (true↔false); 404 se o id não existir |

**Autorização deliberadamente mais restrita que as demais telas exclusivas do TECH:** `hasRole("TECH")` puro, não `hasAnyRole("ADM", "TECH")` — decisão explícita do dono do projeto de manter esta tela fora do alcance até do ADM, ao contrário de Permissões/Calendário/Arquivo Morto (que TECH e ADM dividem).

### UI
Card "Ocorrências Técnicas" em `Config.jsx`, controlado por um estado `isTech` próprio (`role === 'TECH'` exato) — deliberadamente **não** reaproveita o `isAdm` já existente (que inclui TECH), porque aqui o ADM não pode ver o card. Tela de lista com filtro por título/descrição, categoria e status (Pendente/Resolvido), badge de severidade colorido (verde/laranja/vermelho) e badge de status clicável (alterna resolvido/pendente na hora). Formulário de criação simples (sem edição — só criar e listar, mesma restrição de escopo já usada em `Ocorrencia`/US-3.7). Rotas `/app/ocorrencias-tecnicas` e `/app/ocorrencias-tecnicas/criar`, `role="TECH"`.

### Entrega (TDD)
Backend: `OcorrenciaTecnicaServiceTest` (7 testes: cadastro válido associa autor/timestamp, payload não consegue forjar `resolvido=true` de saída, falta de título/descrição retorna 400, listagem delega pro repositório ordenado, alternar resolvido de false→true, alternar com id inexistente retorna 404) + `OcorrenciaTecnicaRepositoryTest` (2, `@DataJpaTest` contra H2, valida ordenação cronológica e desempate por `criadoEm` — mesmo padrão de `OcorrenciaRepositoryTest`). Suíte completa do backend: 106/106 verde. Frontend: `tests/ocorrencias-tecnicas.spec.js` (2: lista renderiza dados mockados, criação registra via POST com o fluxo real de navegação lista→form pra não cair em `about:blank` no `navigate(-1)` do form) + 1 teste novo em `tech-role.spec.js` (card visível pro TECH) + 1 teste novo em `config.spec.js` (card ausente pro ADM, prova negativa da exclusividade). Suíte E2E completa: 56/56 verde. Lint e build OK.

### Origem
Pedido do dono do projeto, para dar ao cargo TECH (recém-criado no Módulo 16) um lugar de registrar achados técnicos do sistema — muitos deles originados de sessões de trabalho com IA/agente técnico, como a própria correção do bug do hash Argon2 corrompido via SSH nesta mesma sessão (ver `memoria-tecnica/` se aplicável, ou o histórico desta sessão).

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
| `OcorrenciaTecnica` | `id` (UUID) | `titulo`, `categoria`, `severidade`, `descricao` (não cifrado — dado técnico, não LGPD), `resolvido`, `autorLogin`, `dataOcorrencia`, `criadoEm` |

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
| V17 | Criação da tabela `ocorrencia_tecnica` (Módulo 17 — Ocorrências Técnicas) |
