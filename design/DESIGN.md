# DESIGN.md — como usar os tokens do Sistema Melvin

> Criado em 14/10/2026 (Fase 2 da evolução da Área da Família). A identidade visual **já existe e está
> em produção** (congelada em maio/2026, `CLAUDE.md` §5). Este diretório não cria identidade nova: reúne
> os tokens num arquivo (`tokens.css`) e guarda o protótipo das telas novas.

## O que há aqui
| Caminho | Conteúdo |
|---|---|
| `tokens.css` | Tokens coletados de `frontend/src/index.scss`, `docs/DESIGN_SYSTEM.md` e do login atual, mais as variantes de contraste ("ajuste AA"). |
| `prototipo-familia/` | Protótipo estático e navegável da Área da Família e das telas de equipe do módulo 19. Abrir `prototipo-familia/index.html`. |

A aplicação React continua lendo os tokens de `frontend/src/index.scss`. Se um valor mudar lá, mude aqui.

## Qual linguagem visual usar em cada tela
`docs/DESIGN_SYSTEM.md` descreve duas linguagens. As telas novas seguem as que já existem:

| Tela | Linguagem | Detalhe |
|---|---|---|
| Login e troca de senha da família | Casca do login atual | Vidro fosco, blobs, título em Caveat, botão em gradiente vermelho (único lugar da Família com Caveat, como no login da equipe). |
| Portal da família (filhos, painel) | Tipografia do sistema interno (Inter + Outfit), paleta institucional | Ação principal em azul `--cor-primaria`; verde `--cor-secundaria` para frequência e sucesso; dourado só decorativo. Fundo `--cor-bg-principal`. |
| Telas de equipe (responsáveis) | "Glass Admin" | Cabeçalho do admin, cartão branco de 12px, tabela com cabeçalho verde que vira cartão no celular, ação principal em verde `--accent-primary`. |

Caveat e Quicksand não entram no portal; Inter e Outfit não entram no site público (regra do `DESIGN_SYSTEM.md`).

## Ajustes de contraste (AA) e por quê
O login atual tem trechos abaixo de 4,5:1 (texto) e as bordas de campo abaixo de 3:1. As telas novas usam
variantes mais escuras, sem trocar a paleta. Os valores estão em `tokens.css`, grupo "AJUSTE AA".

| Onde | Atual | Nas telas novas |
|---|---|---|
| Subtítulo e texto secundário | `#94a3b8` (2,56:1) | `#5A666B` (5,77:1) |
| Início do gradiente do botão de login | `#cf4848` (4,49:1) | `#c23f3f` (5,15:1) |
| Texto de erro | `#dc2626` (4,41:1) | `#b91c1c` (5,91:1) |
| Borda de campo | `#e2e8f0` (~1,2:1) | `#738089` (4,06:1) |
| Botão principal das telas de equipe | laranja `#F29F05` com texto branco (2,16:1) | verde `#217346` com texto branco (5,82:1) |
| Cabeçalho de tabela | fim do gradiente `#2a8f57` (~4:1) | `#1b5f3a` → `#217346` |

Se o Instituto preferir os valores originais no login, é decisão de identidade (e passa a exceção de acessibilidade, não regra).

## Regras de toda tela nova
- Mobile-first; saltos em 690px e 965px. Sem rolagem horizontal da página.
- Contraste de texto ≥ 4,5:1 (3:1 para texto grande); bordas de campo e foco ≥ 3:1.
- Alvo de toque ≥ 44px; foco visível (contorno de 3px); link "pular para o conteúdo".
- Cada campo com `label` associado; erro junto ao campo, ligado por `aria-describedby`, e `role="alert"` para erro de envio.
- Estados tratados em cada componente: normal, carregando, vazio, erro e sucesso.
- Movimento reduzido respeitado (`prefers-reduced-motion`).
- Uma ação principal por tela.
- Dados de exemplo sempre fictícios (nenhuma criança ou família real).

## Como verificar o protótipo
Abrir `prototipo-familia/index.html` no navegador (funciona por `file://`; as fontes vêm do Google Fonts e há
fallback). A barra escura no rodapé de cada tela troca o estado (`?estado=...`); ela e o `proto.js` são
ferramentas do protótipo e não serão portadas para a aplicação.

## Pendências de desenho (decisão do Instituto ou do dono do projeto)
- Horário do aluno: o cadastro só tem `turno` (manhã/tarde); o painel mostra o turno.
- Reativar um acesso desativado: não existe no contrato atual (só desativar).
- Aprovação do layout (G3): depois dela, o layout entra em congelamento visual.
