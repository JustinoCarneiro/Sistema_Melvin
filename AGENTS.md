# Sistema Melvin - Contrato canônico de trabalho

## Objetivo

Sistema de gestão do Instituto Melvin (voluntários, alunos, avisos, cestas
básicas, pagamentos via Stripe). Em produção; Fase 5 da metodologia OndaDev
(manutenção e evolução). Versão da metodologia adotada: `ONDA_VERSION`.

## Mapa do repositório

| Caminho | Finalidade |
| --- | --- |
| `CLAUDE.md` | Espec Viva: stack, arquitetura, resumo de épicos, máquina de estados, convenções, changelog de escopo. |
| `docs/product/spec.md` | Histórias de usuário completas e critérios de aceite BDD. |
| `ROADMAP.md` | Módulos, pesos e estado de entrega. |
| `sistema/` | Backend Java 21 + Spring Boot 3 (Maven). |
| `frontend/` | SPA React + Vite + TypeScript. |
| `memoria-tecnica/` | Bugs cabeludos e decisões fora da spec; consulte antes de investigar. |
| `docs/` | Design system, segurança/LGPD, KPIs, documentação técnica. |
| `docs/SEGURANCA_E_LGPD.md` | Classificação de dados pessoais e controles. |
| `scripts/jira_sync.py` | Sincronização pontual de issues no board Jira `MEL`; nunca automática. |
| `design/` | `DESIGN.md` e tokens visuais do projeto. |
| `.agents/`, `.claude/` | Skills e hooks dos agentes. |
| `docker-compose*.yml` | PostgreSQL, backend, frontend e Nginx. |

## Autoridade da informação

| Assunto | Fonte canônica | Papel das demais fontes |
| --- | --- | --- |
| Escopo, histórias e aceite | `CLAUDE.md` | Jira (board `MEL`) apenas reflete o status. |
| Ordem técnica e progresso | `ROADMAP.md` | Jira é projeção visual. |
| Decisão de arquitetura | `memoria-tecnica/decisoes/` | — |
| Dados pessoais e LGPD | `docs/SEGURANCA_E_LGPD.md` | Nenhuma tarefa pode contrariar esta classificação. |
| Código e histórico versionado | Git | GitHub registra PRs, revisão e CI. |
| Trabalho externo | Jira/GitHub | Nunca sobrescreve a verdade local sem decisão explícita. |

Jira é uma projeção do status, nunca o bloqueio da edição local. A spec muda
primeiro nos arquivos locais; o board `MEL` é acertado depois, à mão na UI ou
com `scripts/jira_sync.py` para lotes pontuais — **nunca disparado
automaticamente por edição de doc**. Exclusões de issue exigem confirmação
explícita.

## Comandos verificados

```bash
# Backend (Java 21 + Maven)
cd sistema && ./mvnw test --batch-mode --no-transfer-progress

# Frontend (React + Vite)
cd frontend && npm ci
cd frontend && npm run lint
cd frontend && npm run build
cd frontend && npm test            # Playwright E2E

# Ambiente local
docker compose config
docker compose up -d
```

## Fronteiras e convenções

- **Diretiva Primária:** não altere a sintaxe ou o comportamento de código
  existente sem um teste que justifique a quebra (ciclo TDD).
- Backend: Controller → Service → Repository, DDD simplificado por domínio.
- Frontend: componentes funcionais + Hooks; CSS Modules (SCSS); camada
  `services/` sobre `http.js` (axios).
- Migrations Flyway são só para a frente; nunca editar uma migration já aplicada.
- Matrícula: `[Ano][XXX]` de 7 dígitos; legadas de 8 dígitos preservadas.
- Documentação em português claro; nomes técnicos no idioma da tecnologia.
- Mudanças pequenas, revisáveis e testadas. Consulte `memoria-tecnica/bugs/`
  antes de investigar bug não trivial e registre causa-raiz reutilizável.

## Segurança e classes de risco

Dados de alunos e voluntários são PII sob LGPD (`docs/SEGURANCA_E_LGPD.md`).
Nunca versione, exiba em log ou cole em prompt: tokens, chaves de API, senhas,
hashes de credencial, dados pessoais reais ou exports. Use `.env` local
(`.env`, `.env.jira` não são versionados).

| Nível | Exemplos | Regra |
| --- | --- | --- |
| R0 | Leitura, docs, testes locais | Executar e validar normalmente. |
| R1 | Código, dependência, schema, migration, CI, configuração compartilhada | Declarar impacto, testar e pedir revisão de diff. |
| R2 | Produção, Stripe/cobrança, credenciais, PII, deploy, exclusão e escrita externa | Exigir autorização explícita e alvo confirmado. |

## Definition of Done

1. atende a uma história ou escopo escrito com critérios de aceite verificáveis;
2. executa os testes que existem (backend `mvnw test`; frontend `lint` + `build`
   + Playwright) e reporta o resultado;
3. atualiza `CLAUDE.md`, `ROADMAP.md` ou `memoria-tecnica/` quando o contrato mudou;
4. não introduz segredo, credencial ou PII no repositório;
5. passa por revisão proporcional ao risco e deixa um diff compreensível;
6. registra handoff com mudanças, validações, decisões, riscos e pendências.

Não afirme que testes, CI, deploy ou sincronização passaram sem evidência.

## Revisão e handoff entre agentes

Claude, Codex e Antigravity seguem este arquivo como núcleo comum. Um autor por PR; o outro
revisa o diff quando o risco (R1/R2) exige e recebe o mínimo suficiente
(contrato, diff, logs de teste), sem reanálise completa do repositório. Quando a
cota de um agente acaba, o outro assume por handoff — protocolo na metodologia
OndaDev 3.0 (`ONDA_VERSION`).

Síntese de handoff:

```text
Escopo: …
Mudanças: …
Validações executadas e resultado: …
Decisões/ADRs: …
Riscos, bloqueios e próximos passos: …
```
