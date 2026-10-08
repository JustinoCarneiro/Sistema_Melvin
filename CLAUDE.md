@AGENTS.md

# 📘 CLAUDE.md — Especificação Viva do Sistema Melvin

> **Última atualização:** 08/10/2026
> **Fase atual:** Fase 5 (Produção)
> **Metodologia:** OndaDev — versão em `ONDA_VERSION`. Contrato de trabalho em `AGENTS.md`.

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

## 3. Épicos

Títulos abaixo; histórias de usuário completas e critérios de aceite BDD em
`docs/product/spec.md`. Changelog de mudanças de escopo: §7.

1. Autenticação e Sessão
2. RBAC Dinâmico (Permissões)
3. Gestão de Discentes (Alunos)
4. Gestão de Voluntários
5. Frequência (Ponto Eletrônico)
6. Amigos do Melvin (Doações — Stripe)
7. Cestas Básicas, Embaixadores e Avisos
8. Dashboard e Relatórios
9. Diário e Rendimento
10. Site Institucional (Público)
11. Central de Ajuda (Manual do Sistema)
12. Ocorrências Técnicas
13. Área da Família (Portal do Responsável)

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
| 26/08/2026 | Manual do Sistema (US-11.1) implementado e publicado em produção | — (evolução, sem retorno de fase) | Botão "Manual do Sistema" em Configurações, visível a qualquer cargo, abrindo `/app/manual` com passo a passo por funcionalidade e prints reais das telas (capturados via Playwright com dados fictícios, mesmo mecanismo de mock das suítes E2E). Feature 100% frontend, sem contrato de API novo — ver ROADMAP.md Módulo 15. Deploy em produção verificado via smoke test (health check, carregamento do site, login com mensagem UTF-8 correta). |
| 27/08/2026 | Cargo técnico TECH (US-1.5) criado para separar acesso de manutenção/suporte técnico da administração real do Instituto | — (evolução, sem retorno de fase) | `UserRole.TECH` (ordinal 10, migration V16 para o check constraint de `users.role`) com acesso equivalente ao ADM em tudo, inclusive telas exclusivas (Permissões, Calendário de Exceções, Arquivo Morto, registro/redefinição de login). `PermissaoService` espelha automaticamente TECH em qualquer regra dinâmica que já libere ADM, inclusive regras já existentes em produção antes do TECH existir. Rotulado como "Suporte Técnico" nas telas (Header, cadastro de Voluntário — função "tecnico"). Backend e E2E completos revalidados (0 regressão). |
| 30/08/2026 | Ocorrências Técnicas (US-12.1) — módulo novo, exclusivo do cargo TECH | — (evolução, sem retorno de fase) | Pedido do dono do projeto: registrar achados técnicos do sistema (bugs, incidentes, decisões, manutenção, segurança) — muitos vindos de sessões de trabalho com IA, como a própria correção do bug do hash Argon2 corrompido via SSH nesta mesma sessão. Entidade `OcorrenciaTecnica` nova (migration V17), sem cifragem (dado técnico, não pessoal). Acesso restrito a `hasRole("TECH")` — deliberadamente sem ADM, ao contrário das demais telas exclusivas do TECH. Card novo em Configurações controlado por estado `isTech` dedicado (não reaproveita o `isAdm` que inclui TECH). Documentado no Manual do Sistema com prints reais. Backend: 9 testes novos (`OcorrenciaTecnicaServiceTest` 7, `OcorrenciaTecnicaRepositoryTest` 2 — suíte completa 106/106 verde). Frontend: 4 testes E2E novos (lista, criação, card exclusivo em Config visível pro TECH e ausente pro ADM). |
| 08–09/10/2026 | Cancelamento de solicitação de cesta (US-7.4), nas duas telas: "Pendentes de validação" e "Aguardando retirada" | — (evolução + correção pré-deploy, sem retorno de fase) | Pedido do cliente: cancelar solicitações ainda não validadas, e cancelar agendamentos quando o beneficiário não comparece na data de retirada. `StatusCesta.CANCELADA` já existia no enum desde a V14 mas estava morto — fechado com `cancelar(UUID id)` em `CestasService` e `PUT /cestas/solicitacao/{id}/cancelar`, aceitando `SOLICITADA` ou `AGENDADA` e recusando estados incompatíveis com 409. A revisão pré-deploy encontrou uma corrida entre validar, cancelar e confirmar entrega; as três transições passaram a usar updates condicionais no banco, e o cancelamento invalida o QR. O CRUD geral foi isolado em registros com `status` nulo e não consegue mais editar ou excluir solicitações; a rota real `DELETE /cestas/{id}` passou a exigir `GERENCIAR_CESTAS`. A regra padrão dessa permissão inclui `COOR`, coerente com o aceite e com a regra já ativa em produção. Sem migration e sem motivo de cancelamento. Botão "Cancelar" com confirmação nas duas listas. Cobertura inclui serviço, JPA, autorização MockMvc e dois fluxos Playwright com dados sintéticos. |
| 08/10/2026 | Cliente propôs reestruturação do site institucional e um portal para famílias; levantamento concluído e formalizado em spec | — (evolução, sem retorno de fase) | **Origem:** cliente enviou proposta de nova estrutura de menu/conteúdo do site público e de uma área exclusiva para responsáveis, em texto colado via WhatsApp, ao longo de várias mensagens. Levantamento conduzido em múltiplas rodadas de pergunta e resposta (autorização de imagem, escopo do canal de sugestões, mecanismo de autenticação de responsável, entre outros), com verificação de fidelidade linha a linha contra as mensagens originais da cliente antes de formalizar. **Decisões tomadas:** autorização de uso de imagem já existe assinada (equipe e alunos) na matrícula; "Comunicação com o Instituto" da Área da Família vira e-mail, não mensageria interna (não existe chat/ticket em nenhum épico); justificativa de falta pelo responsável atualiza a frequência automaticamente como estado novo "falta justificada" (auditável, reversível pela coordenação, sem apagar o registro original do professor); autorização de passeio é assinatura eletrônica simples (clique autenticado, com texto exato gravado); Canal de Sugestões e Reclamações é público e anônimo, sem login, e precisa de rate limit antiabuso desde o lançamento (hoje só `/cestas/solicitacao` tem essa proteção no sistema); botão "Doar" mantém destaque visual separado do menu, como já é hoje. **Formalizado em `docs/product/spec.md`:** Épico 10 (Site Institucional) ganhou 16 US novas (US-10.3 a US-10.18) cobrindo menu reorganizado, O Instituto, Nossos Espaços, Projetos e Atividades, Equipe, Agenda, Cardápio, Notícias e Registros, Projetos e Parceiros, Estrutura Organizacional/Organograma, Transparência Melvin, Prestação de Contas Simplificada, Documentos Institucionais, Como Ajudar, Contato e Canal de Sugestões. Épico novo **13 — Área da Família (Portal do Responsável)** criado com 8 US (US-13.1 a US-13.8): autenticação de responsável, painel do filho, acompanhamento, desenvolvimento, agenda pessoal, documentos com autorização de passeio, comunicação com o Instituto e avisos direcionados. **Status:** tudo em Backlog, nada implementado. Sem módulo/peso no `ROADMAP.md` ainda — Épico 13 em particular tem gargalo único (US-13.1, autenticação de responsável é pré-requisito de todo o resto do épico) e superfície de risco nova (R2: escrita externa em cadastro real de aluno pela primeira vez no sistema). Próximo passo é blueprint técnico (Fase 3) antes de qualquer estimativa de prazo. |


## Diretivas de Gestão (Jira)

O quadro Jira do projeto (board `MEL` em `ondaenterprise.atlassian.net`) é uma
**projeção do status**, não a fonte da verdade — essa continua sendo este
`CLAUDE.md` + `ROADMAP.md`. A spec muda primeiro aqui; o board é acertado depois,
à mão na UI ou com `scripts/jira_sync.py` para lotes pontuais — **nunca disparado
automaticamente por edição de doc** (isso recriava issues em duplicata). Não há
mais Trello. Credenciais de API do Jira em `.env.jira`, fora do controle de
versão. Exclusão de issue exige confirmação explícita.
