# 2. REFATORAÇÃO DE UI - FUNDAÇÃO GLOBAL E LAYOUT BASE

## 2.1. OBJETIVO
Elevar o padrão visual da plataforma Instituto Melvin para um aspecto premium, corporativo e acolhedor. Esta etapa foca na Fundação Visual (Tokens) e na casca do sistema (Navbar), utilizando a estética moderna das referências (Patchwork/Smile).

## 2.2. TOKENS DE DESIGN (PALETA PREMIUM)
A paleta antiga genérica foi descartada. Adotaremos os seguintes tokens baseados no modelo inspirativo:
- **Tipografia**: 'Inter' ou 'Open Sans' (Pesos 400, 500, 700).
- **Cores de Fundo e Superfície**:
  - `--cor-bg-principal`: #FDFCF8 (Bege ultra-suave/Off-white)
  - `--cor-bg-secundario`: #F4F1EA (Areia claro para seções de destaque)
- **Cores de Texto**:
  - `--cor-texto-forte`: #2A363B (Carvão escuro com fundo azulado para títulos)
  - `--cor-texto-corpo`: #5A666B (Cinza ardósia para leitura confortável)
- **Cores de Ação (Aderentes à logo do Melvin, mas premium)**:
  - `--cor-primaria`: #1A4D80 (Azul marinho profundo - substitui o azul elétrico antigo)
  - `--cor-secundaria`: #207556 (Verde floresta elegante - substitui o verde limão antigo)
  - `--cor-destaque`: #E29421 (Amarelo mostarda/Âmbar para call-to-actions especiais)
- **Micro-animações**:
  - `--transition-suave`: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## 2.3. DIRETRIZES DE COMPONENTIZAÇÃO (NAVBAR)
- A Barra de Navegação deve ter fundo transparente ou `var(--cor-bg-principal)`, com itens espaçados e bordas limpas.
- A responsividade móvel deve ocultar o menu em telas < 991px, exibindo o ícone de hambúrguer nativo do design.
- **Regra de Isolamento**: Nenhuma rota existente no framework ou lógica vinculada à navegação deve ser quebrada.