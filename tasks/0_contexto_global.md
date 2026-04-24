# 0_CONTEXTO_GLOBAL - SISTEMA MELVIN

## 1. STACK TECNOLÓGICA PRINCIPAL
- **Backend**: Java 21 + Spring Boot 3.3.4 (Maven).
- **Frontend**: React + Vite + TypeScript (SPA).
- **Banco de Dados**: PostgreSQL (Rodando em Docker).
- **Segurança**: Spring Security + JWT + Argon2 (Hashing).
- **Infraestrutura**: Docker & Docker Compose (Linux-based).

## 2. DIRETRIZES DE SINTAXE E PADRÕES
- **NÃO ALTERAR SINTAXE EXISTENTE**: O padrão de código atual deve ser mantido rigorosamente.
- **Backend**:
    - Usar Padrão Controller -> Service -> Repository.
    - Endpoints RESTful (Cuidado: `/cestas` e `/diarios` plural, `/aviso` singular).
    - Validação de entrada com Jakarta Validation.
- **Frontend**:
    - Componentes funcionais com Hooks.
    - Estilização via CSS Modules (SASS/SCSS).
    - Integração via `services/` (uso de `http.js` como base).

## 3. REGRAS DE NEGÓCIO CRÍTICAS
- **Matrículas (7 dígitos)**: `[Ano][XXX]` (Ex: 2026001).
- **Segurança RBAC**: Permissões são dinâmicas via banco de dados (Regra de Permissões).
- **Ambiente**: Otimizado para Linux. Scripts `.sh` devem manter permissões de execução.

## 4. AMBIENTE DE DESENVOLVIMENTO
- API: `http://localhost:8443`
- Frontend: `http://localhost:3001`
- Admin Padrão: `20247001` / `admin`