# Design System — Instituto Social Melvin
*Guia de Identidade Visual | Versão 1.0 — Maio/2026*

---

## 1. Visão Geral do Design

O Sistema Melvin adota duas linguagens visuais complementares:

| Contexto | Estilo | Filosofia |
|---|---|---|
| **Site Público** | *Watercolor Dream* — Orgânico, lúdico e acolhedor | Transmitir calor humano, inclusão e leveza para visitantes e doadores |
| **Sistema Interno** | *Glassmorphism Premium* — Limpo, funcional e profissional | Priorizar legibilidade, produtividade e clareza para a equipe operacional |

---

## 2. Paleta de Cores

### 2.1 Cores Primárias da Marca (Tailwind Tokens)

| Token | Valor HSL | Hex Aproximado | Uso |
|---|---|---|---|
| `melvin-red` | `hsl(0 85% 55%)` | `#E63946` | CTAs principais, botões de ação, logotipo |
| `melvin-red-dark` | `hsl(0 85% 40%)` | `#B22A33` | Hover de botões, gradientes |
| `melvin-blue` | `hsl(217 85% 45%)` | `#1A6DD1` | Links, destaques informativos |
| `melvin-blue-dark` | `hsl(217 85% 30%)` | `#0F4A8A` | Contraste de texto sobre azul |
| `melvin-green` | `hsl(100 65% 50%)` | `#5DBF3F` | Sucesso, badges ativos, natureza |
| `melvin-green-dark` | `hsl(100 75% 35%)` | `#3A8C22` | Texto sobre fundo verde |
| `melvin-yellow` | `hsl(45 100% 50%)` | `#FFB800` | Alertas, recompensas, destaques |
| `melvin-yellow-dark` | `hsl(40 95% 40%)` | `#C78600` | Texto sobre fundo amarelo |
| `melvin-text` | `hsl(220 35% 25%)` | `#2A363B` | Texto principal forte |

### 2.2 Cores do Sistema Interno (CSS Custom Properties)

| Variável | Valor | Uso |
|---|---|---|
| `--cor-bg-principal` | `#FDFCF8` | Fundo geral das páginas |
| `--cor-bg-secundario` | `#F4F1EA` | Fundo de seções alternadas |
| `--cor-texto-forte` | `#2A363B` | Títulos e cabeçalhos |
| `--cor-texto-corpo` | `#5A666B` | Texto de corpo e descrições |
| `--cor-primaria` | `#1A4D80` | Azul institucional (admin header) |
| `--cor-secundaria` | `#207556` | Verde institucional |
| `--cor-destaque` | `#E29421` | Dourado para destaques e ícones |
| `--accent-primary` | `#217346` | Verde das tabelas e ações do admin |
| `--accent-secondary` | `#F29F05` | Amarelo para ícones de rendimento |
| `--bg-color` | `#f1f5f3` | Background geral do painel |
| `--text-main` | `#1e293b` | Texto principal do admin |
| `--text-muted` | `#64748b` | Texto secundário/placeholders |

### 2.3 Cores Legadas (SASS — compatibilidade)

| Variável | Valor | Contexto |
|---|---|---|
| `$cor-primaria` | `#217346` | Verde principal original |
| `$cor-secundaria` | `#F29F05` | Dourado original |
| `$cor-texto` | `#333333` | Texto legado |
| `$cor-fundo` | `#f5f5f5` | Fundo legado |
| `$cor-erro` | `#C70039` | Mensagens de erro |

### 2.4 Gradientes

| Nome | Valor | Uso |
|---|---|---|
| Botão Login | `linear-gradient(135deg, #cf4848 0%, #b93636 100%)` | Botão principal da tela de login |
| Header Tabela | `linear-gradient(135deg, #217346 0%, #2a8f57 100%)` | Cabeçalho das tabelas do admin |
| Blobs decorativos | `rgba(207, 72, 72, 0.08)` / `rgba(79, 170, 116, 0.1)` | Manchas de fundo (blur 80px) |

---

## 3. Tipografia

A tipografia é um pilar central da identidade do Instituto Melvin. O site público e o sistema interno utilizam famílias tipográficas completamente distintas, cada uma cuidadosamente escolhida para reforçar a linguagem visual do seu contexto.

### 3.1 Fontes do Site Público — Identidade "Watercolor Dream"

O site público utiliza exclusivamente fontes que transmitem **acolhimento, organicidade e leveza**, reforçando a estética de aquarela feita à mão:

| Fonte | Estilo | Pesos | Papel no Design | Token Tailwind |
|---|---|---|---|---|
| **Caveat** | Manuscrita (*handwritten*) | 400, 700 | **Fonte protagonista.** Usada em todos os títulos, subtítulos de seção, botões de CTA, labels decorativos e destaques emocionais. Transmite o "toque humano" da ONG. | `font-handwritten` |
| **Quicksand** | Sans-serif arredondada | 300–700 | **Fonte de corpo e apoio.** Usada em parágrafos, descrições, links do menu e textos informativos. Seus terminais arredondados harmonizam com as formas orgânicas dos blobs. | `font-body` |

> **Princípio:** Toda a comunicação visual do site público é construída com **Caveat para impacto emocional** e **Quicksand para legibilidade**, criando o contraste manuscrito × limpo que define a identidade aquarela.

**Fallback de login:** `'Caveat', 'Kalam', cursive` — a fonte Kalam serve como fallback secundário no formulário de login, mantendo o estilo manuscrito caso a Caveat não carregue.

### 3.2 Fontes do Sistema Interno — Identidade "Glass Admin"

O painel administrativo prioriza **funcionalidade, clareza e produtividade**:

| Fonte | Estilo | Pesos | Papel no Design |
|---|---|---|---|
| **Inter** | Sans-serif geométrica | 300–700 | Corpo de texto, formulários, tabelas, inputs e labels. Otimizada para leitura em telas de dados. |
| **Outfit** | Sans-serif moderna | 300–700 | Títulos de páginas, cabeçalho do header, nomes de módulos. Proporciona hierarquia visual nos painéis. |

> **Regra:** Caveat e Quicksand **nunca** aparecem no sistema interno. Inter e Outfit **nunca** aparecem no site público. A separação é intencional.

### 3.3 Fonte Auxiliar

| Fonte | Uso pontual |
|---|---|
| **Recursive** | Usada exclusivamente no resumo de dados do checkout (tela de pagamento Stripe). Fonte monospaced que exibe valores financeiros com clareza técnica. |

### 3.4 Hierarquia Tipográfica Completa

**Site Público (Watercolor Dream):**

| Elemento | Fonte | Tamanho | Peso | Cor |
|---|---|---|---|---|
| Hero principal | Caveat | 5rem–8rem | 700 | `melvin-blue` |
| Subtítulo hero | Quicksand | 4rem–7rem | 700 | `melvin-text` |
| Título de seção (h2) | Caveat | 3rem–6rem | 700 | `melvin-text` |
| Label decorativo ("Quem somos", "Momentos") | Caveat | 2rem–3rem | 400 | `melvin-blue` |
| Corpo de texto | Quicksand | 1rem–1.125rem | 400–500 | `slate-600/800` |
| Botão CTA primário | Caveat | 1.25rem–2.5rem | 600 | `white` |
| Link do menu header | Quicksand | 17px | 500 | `melvin-text` |

**Sistema Interno (Glass Admin):**

| Elemento | Fonte | Tamanho | Peso | Cor |
|---|---|---|---|---|
| Título da página (h1) | Outfit | 2.8rem | 700 | `--text-main` |
| Header barra superior | Outfit | 1.5rem | 700 | `--cor-texto-forte` |
| Corpo e formulários | Inter | 0.95rem–1rem | 400 | `--text-main` |
| Labels de tabela (thead) | Inter | 0.7rem | 700 | `white` (sobre verde) |
| Placeholders | Inter | 1rem | 400 | `--text-muted` |
| Título Login | Caveat | 1.75rem | 600 | `#2A363B` |

### 3.5 Imports das Fontes

**Site Público** (carregadas via `index.html` — primeira prioridade de render):
```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Sistema Interno** (carregadas via `index.scss` — sob demanda):
```scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
```

---

## 4. Componentes Visuais

### 4.1 Watercolor Blobs (Site Público)

Manchas orgânicas decorativas que flutuam com animação suave, criando a identidade "aquarela":

| Propriedade | Valor |
|---|---|
| `border-radius` | `60% 40% 55% 45%` (orgânico) |
| `filter` | `blur(8px)` + SVG watercolor filter |
| `mix-blend-mode` | `multiply` |
| `opacity` | `0.30` (padrão) |
| Animação | `float` — `6s ease-in-out infinite` — translação Y de 20px com rotação de 2° |
| Cores disponíveis | `melvin-red`, `melvin-blue`, `melvin-green`, `melvin-yellow` |

### 4.2 Glass Cards (Sistema Interno)

Cartões com efeito de vidro fosco (*glassmorphism*):

| Propriedade | Valor |
|---|---|
| `background` | `rgba(255, 255, 255, 0.7)` |
| `backdrop-filter` | `blur(12px)` |
| `border` | `1px solid #e2e8f0` |
| `border-radius` | `16px` |
| `box-shadow` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |

### 4.3 Botões

**CTA Principal (Site Público):**
| Propriedade | Valor |
|---|---|
| `background` | `melvin-red` |
| `color` | `white` |
| `border-radius` | `rounded-3xl` (1.5rem) ou `rounded-full` |
| `font` | Caveat, 1.25rem–2rem |
| `padding` | `px-10 py-5` |
| Hover | `scale(1.05)` + `shadow-2xl` |

**CTA Secundário (Site Público):**
| Propriedade | Valor |
|---|---|
| `background` | `melvin-green/40` |
| `color` | `melvin-text` |
| `border-radius` | `rounded-3xl` |
| Hover | `shadow-xl` + `scale(1.05)` |

**Botão Login:**
| Propriedade | Valor |
|---|---|
| `background` | `linear-gradient(135deg, #cf4848, #b93636)` |
| `border-radius` | `1rem` |
| `font` | Caveat, 1.1rem, weight 600 |
| Hover | `translateY(-2px)` + sombra vermelha expandida |

**Botão Admin (Novo Cadastro):**
| Propriedade | Valor |
|---|---|
| `border` | `2px dashed #b0d4b8` |
| `border-radius` | `14px` |
| `color` | `--accent-primary` (verde) |
| `background` | `#f8fcf9` |
| Hover | `border-color: --accent-primary` + `background: #e8f5ec` |

### 4.4 Inputs e Campos de Formulário

| Propriedade | Valor |
|---|---|
| `background` | `rgba(255, 255, 255, 0.6)` ou `#f8fafc` |
| `border` | `1.5px solid #e2e8f0` |
| `border-radius` | `1rem` (login) / `12px` (admin) |
| `height` | `3.25rem` |
| `font` | Inter, 0.95rem |
| Focus | `border-color: #cf4848` (login) ou `--accent-primary` (admin) |
| Focus shadow | `0 0 0 4px rgba(207,72,72,0.08)` (login) ou `rgba(33,115,70,0.1)` (admin) |

### 4.5 Tabelas (Sistema Interno)

| Elemento | Estilo |
|---|---|
| Container | `border-radius: 16px`, `border: 1px solid #d6e8da` |
| Cabeçalho (`thead`) | Gradiente verde `#217346 → #2a8f57`, texto branco uppercase, `letter-spacing: 0.08em` |
| Linha par | `background: #f0f7f2` |
| Linha hover | `background: #e3f0e7` |
| Célula | `padding: 1.25rem 1rem`, `font-size: 0.95rem` |
| Coluna Nome | `font-weight: 600`, `color: --accent-primary` |
| Ícone Editar | `2.5rem`, hover: `color: --accent-primary`, `scale(1.1)` |

### 4.6 Header do Admin

| Propriedade | Valor |
|---|---|
| Posição | `sticky top-0`, `z-index: 50` |
| Layout | CSS Grid: `1fr auto 1fr` |
| Altura | `4.5rem` (desktop) / `4rem` (mobile) |
| Background | `--cor-bg-principal` (`#FDFCF8`) |
| Borda inferior | `1px solid rgba(0,0,0,0.05)` |
| Título | Outfit, 1.5rem, weight 700, `letter-spacing: 0.05em` |
| Badge usuário | Pill shape (`border-radius: 9999px`), fundo azul sutil |

---

## 5. Espaçamento e Layout

### 5.1 Breakpoints Responsivos (SASS)

| Variável | Valor | Uso |
|---|---|---|
| `$size-a` | `360px` | Mobile pequeno |
| `$size-b` | `450px` | Mobile médio |
| `$size-k` | `500px` | Mobile grande |
| `$size-c` | `690px` | Tablet portrait |
| `$size-d` | `780px` | Tablet landscape |
| `$size-e` | `880px` | Desktop pequeno |
| `$size-h` | `965px` | Desktop médio |
| `$size-f` | `1100px` | Desktop grande |
| `$size-i` | `1215px` | Widescreen |
| `$size-j` | `1350px` | Ultra-wide |

### 5.2 Comportamento Mobile (Tabelas → Cards)

Em telas ≤768px, as tabelas do admin se transformam automaticamente em cards empilhados:
- `thead` é ocultado (`display: none`)
- Cada `<tr>` vira um card com `border-radius: 16px` e `box-shadow`
- Cada `<td>` exibe um label via `::before { content: attr(data-label) }`
- Hover: `translateY(-2px)` + sombra elevada

---

## 6. Efeitos e Micro-Animações

### 6.1 Transições (CSS Custom Properties)

| Token | Valor | Uso |
|---|---|---|
| `--transition-suave` | `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Interações principais |
| `--transition-base` | `all 0.3s ease` | Animações gerais |
| `--transition-fast` | `all 0.15s ease` | Hover rápido em ícones |

### 6.2 Sombras

| Token | Valor |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)` |

### 6.3 Animações (Framer Motion — Site Público)

O site público utiliza **Framer Motion** para animações de entrada:
- **`whileInView`**: Elementos surgem ao entrar no viewport
- **Direção**: `fadeInUp` (translateY de 40px → 0) como padrão
- **Stagger**: Cards em grid usam `staggerChildren: 0.1` para entrada sequencial
- **Duração**: `0.5s–0.8s` com `ease-out`

### 6.4 Scrollbar Personalizada

| Propriedade | Valor |
|---|---|
| Largura | `8px` |
| Track | `transparent` |
| Thumb | `rgba(0, 0, 0, 0.1)`, `border-radius: 4px` |
| Thumb hover | `rgba(0, 0, 0, 0.2)` |

---

## 7. Iconografia

| Biblioteca | Uso |
|---|---|
| **Lucide React** (`react-icons/lu`) | Site público — ícones leves e orgânicos (LuHeart, LuUsers, LuLeaf, etc.) |
| **Material Design** (`react-icons/md`) | Sistema interno — ícones de ação (MdEdit, MdDelete) |
| **Ionicons** (`react-icons/io`) | Sistema interno — busca, navegação (IoMdSearch, IoMdArrowBack) |
| **Font Awesome** (`react-icons/fa`) | Badges e recompensas (FaGift, FaTrophy) |

---

## 8. Logotipos

O Instituto Social Melvin utiliza seu logotipo oficial horizontal em dois contextos:

| Contexto | Tamanho | Posição |
|---|---|---|
| Header do Site Público | Responsivo (auto-ajustável) | Canto superior esquerdo, fixo no scroll |
| Tela de Login | `120px` de largura | Centralizado acima do formulário |
| Footer do Site | Proporcional | Centralizado na seção institucional |

---

## 9. Resumo de Identidade por Contexto

### Site Público — "Watercolor Dream"
- Formas orgânicas com `border-radius` irregulares (60%/40%)
- Blobs decorativos com `mix-blend-mode: multiply`
- Tipografia manuscrita (Caveat) para acolhimento
- Cores vibrantes com opacidades suaves (10%–40%)
- Animações de entrada suaves (Framer Motion)
- Cantos ultra-arredondados (`rounded-[3rem]` a `rounded-[5rem]`)
- Backdrop blur em cards (`blur(12px)–blur(24px)`)

### Sistema Interno — "Glass Admin"
- Cards com glassmorphism (`backdrop-filter: blur`)
- Tipografia limpa e profissional (Inter + Outfit)
- Tabelas com cabeçalho gradiente verde
- Transformação responsiva de tabelas em cards mobile
- Ícones funcionais (Material Design / Ionicons)
- Paleta verde institucional (#217346) com dourado de destaque (#F29F05)
- Cantos moderados (`border-radius: 12px–24px`)

---

*Documento gerado em Maio/2026 para uso interno da equipe de design do Instituto Social Melvin.*
*Para dúvidas técnicas, consulte `DOCUMENTACAO_TECNICA.md`.*
