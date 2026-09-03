# Métricas do Projeto — sistema_melvin

> Registro de coleta para a **Análise de KPIs de Fechamento** (metodologia Onda, seção 14).
> Padrão e catálogo: `docs/METRICAS-KPI.md`. Prompt da análise: `docs/PROMPT-ANALISE-KPI.md`.
>
> **Regra de dado sensível:** só o *custo/hora interno da empresa* fica fora deste arquivo — no
> sibling privado `<projeto>-docs-privados/` ou informado na hora da análise. Todo o resto
> (datas, valor do contrato, comissão, timesheet, esperas) mora aqui, versionado com o projeto.
>
> ⚠ **2026-09-02:** blocos 1–2 ainda por reconstruir; bloco 3 semeado com a estimativa
> retroativa por proxy de commit — o registro real por sessão **começa a partir daqui**. Panorama
> entre projetos: `onda-starter/historico-projetos/PANORAMA-KPI.md`.

---

## 1. Kickoff — preencher na Fase 0

| Campo | Valor |
|---|---|
| Nome / slug | sistema_melvin / `sistema-melvin` |
| Valor do contrato (bruto) | **pro bono** (Instituto Social Melvin — ONG; confirmado 2026-09-02). Onda cobre só a infra (VPS + domínio, ~R$ 860/ano — ver `onda-propostas/clientes/instituto-melvin/`). |
| Moeda | BRL |
| Canal | indicação / social — n/a |
| Comissão de plataforma % | `<__% ou n/a>` |
| Taxa de saque % | `<__% ou n/a>` |
| Regime tributário | `<Simples ~6% / MEI fixo / PJ / n/a>` |
| Valor/hora alvo (referência) | `<R$ ___/h>` |
| Custo/hora interno | **não aqui** — ver sibling privado / informar na análise |
| Data — aceite da proposta | `<AAAA-MM-DD>` |
| Data — início do prazo (gatilho contratual) | `<AAAA-MM-DD>` |
| Data — limite contratual | `<AAAA-MM-DD>` |
| Data — entrega real | `<AAAA-MM-DD ou "em curso">` |
| Deploy / hospedagem | `<Vercel / VPS Coolify / ...>` (conta de quem: `<cliente / Onda>`) |

## 2. Peso dos módulos — copiar do `ROADMAP.md` quando existir (Fase 3)

| Módulo | Peso | Dias estimados |
|---|---|---|
| `<M01 ...>` | `<Pequeno/Médio/Grande>` | `<1-2 / 3-4 / 5-7>` |

Σ dias estimados: `<__>`

## 3. Timesheet — uma linha por sessão (Fase 4)

**A partir de 2026-09-02: uma linha por sessão de trabalho** (data · fase 0–5 · horas · nota).
Sendo pro bono, o objetivo do registro aqui é medir o **custo de manutenção por ano** para decidir
a cada renovação se compensa manter. A linha `(est. retroativa)` abaixo é proxy de commit
(detalhe em `onda-starter/historico-projetos/estimativas-horas-2026-09-02.md`).

| Data | Fase (0–5) | Horas | Nota |
|---|---|---|---|
| _(primeira entrada real aqui)_ | | | |

Σ real registrada: **0 h** (começa agora)
Σ **(est. retroativa por proxy de commit)**: **~93 h piso · ~116–135 h central · ~162 h teto** — 155 commits, 81 sessões, **diluídos entre jul/2024 e set/2026** (~40–60 h/ano de manutenção)

## 4. Log de espera / impedimento (Fase 4)

Abrir um episódio sempre que o trabalho **parar por causa externa** (não conta pausa própria).

| Início | Fim | Motivo | O que destrava |
|---|---|---|---|
| `<AAAA-MM-DD>` | `<AAAA-MM-DD ou "aberto">` | `<cliente / terceiro / técnico / interno>` | `<condição p/ retomar>` |

Σ dias em espera: `<__>`   ·   nº de episódios: `<__>`

## 5. Mudanças de escopo (espelho do changelog do `CLAUDE.md`)

| Mudança | Data | Peso equivalente | Aditivo faturado |
|---|---|---|---|
| `<...>` | `<AAAA-MM-DD>` | `<P/M/G>` | `<R$ __ ou R$ 0>` |

---

*Criado na Fase 0. Mantido durante a Fase 4. Consumido pela análise de fechamento (Fase 5),
que gera `docs/ANALISE-PROJETO-<slug>.md`.*
