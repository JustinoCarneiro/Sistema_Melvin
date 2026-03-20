# 👋 Sistema Melvin (Instituto Social Melvin)

Sistema de gestão de alunos, voluntários e recursos para o Instituto Social Melvin, desenvolvido com foco em segurança, escalabilidade e facilidade de uso.

## 🚀 Tecnologias

O projeto utiliza uma stack moderna e robusta:

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Spring Boot 3.3.4](https://spring.io/projects/spring-boot) + [Java 21](https://www.oracle.com/java/technologies/downloads/#java21)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **Segurança**: Spring Security + JWT + Argon2
- **Infraestrutura**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📂 Estrutura do Projeto

A estrutura foi desenhada para separar claramente as responsabilidades de cada camada:

```text
sistema-melvin/
├── frontend/                # Aplicação Frontend (SPA)
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizáveis
│   │   ├── pages/           # Páginas principais da aplicação
│   │   ├── services/        # Camada de integração com API e Auth
│   │   ├── hooks/           # Hooks personalizados para lógica React
│   │   └── site/            # Componentes específicos do site público
│   └── Dockerfile           # Configuração de container para o frontend
├── sistema/                 # API Backend (Spring Boot)
│   ├── src/main/java/br/com/melvin/sistema/
│   │   ├── controller/      # Endpoints (REST Controllers)
│   │   ├── model/           # Entidades JPA (Domínio)
│   │   ├── repository/      # Camada de Persistência (Spring Data)
│   │   ├── services/        # Lógica de negócio e orquestração
│   │   ├── security/        # Filtros, JWT e Configuração de Segurança
│   │   ├── dto/             # Objetos de Transferência de Dados
│   │   └── config/          # Bean configurations e propriedades
│   ├── src/main/resources/  # application.properties e recursos estáticos
│   └── pom.xml              # Gerenciamento de dependências Maven
├── postgres/                # Configurações do Banco de Dados
├── docker-compose.yml       # Orquestração de todos os serviços (App, DB)
├── .env                     # Variáveis de ambiente e segredos (NÃO COMMITAR)
└── start.sh                 # Script para inicialização simplificada via Docker
```

---

## 🛡️ Critérios de Segurança

A segurança é tratada como prioridade no Sistema Melvin, utilizando padrões de mercado:

### 1. Autenticação e Autorização
- **JWT (JSON Web Tokens)**: A autenticação é *stateless* (sem estado no servidor), utilizando tokens JWT para validar sessões.
- **RBAC (Role-Based Access Control)**: O acesso é controlado por papéis específicos (`ADM`, `DIRE`, `COOR`, `PROF`, `ASSIST`, `PSICO`, `AUX`). Cada endpoint possui restrições granulares de acesso.
- **Spring Security**: Filtros customizados validam cada requisição antes de chegar à lógica de negócio.

### 2. Proteção de Dados
- **Hashing de Senhas (Argon2)**: As senhas são armazenadas utilizando o algoritmo **Argon2**, atualmente um dos mais robustos contra ataques de força bruta e rainbox tables.
- **CORS (Cross-Origin Resource Sharing)**: Configurado de forma restrita para permitir apenas origens autorizadas (especificadas via variável de ambiente).
- **Env Vars (Secrets)**: Nenhuma credencial ou segredo (como a `JWT_SECRET`) está *hardcoded*. Todas são injetadas via Docker através de um arquivo `.env` seguro.

### 3. Integridade e Validação
- **Input Validation (Jakarta Validation)**: Todos os dados que entram na API são validados (tamanho, formato, presença) antes do processamento.
- **Network Isolation**: No ambiente Docker, o banco de dados PostgreSQL não fica exposto para a rede externa, sendo acessível exclusivamente pelo backend (quando executado via Docker Compose).

### 4. Infraestrutura
- **Resource Limits**: Containers Docker possuem limites de memória configurados para evitar ataques de DoS (Denial of Service) por consumo excessivo de recursos.
- **Upload Security**: Limites rígidos de tamanho de arquivo (10MB) e diretórios de destino controlados para uploads.

## 🛠️ Scripts de Automação

O projeto inclui scripts em Bash para facilitar o dia a dia e o deploy:

- **`deploy.sh`**: Realiza o build e deploy local via Docker Compose:
    - Sobe o banco, compila o Java e inicia o Frontend.
- **`backup.sh`**: Gestão de Backups:
    - Gera um dump compactado (`.sql.gz`) do banco de dados.
    - Mantém apenas os últimos 7 dias de backups automaticamente.
- **`deploy-remote.sh`**: Deploy em um clique:
    - Sincroniza o código local com o servidor Ubuntu via `rsync`.
    - Executa o `deploy.sh` remotamente via `ssh`.

---

## 🚀 Como Executar e Desenvolver

### 1. Configuração Inicial
1.  Certifique-se de ter o **Docker** instalado.
2.  Adicione o domínio ao seu arquivo `/etc/hosts` (opcional para desenvolvimento):
    `127.0.0.1 institutomelvin.org`
3.  Configure o arquivo `.env` (baseado no `.env.example`). O sistema já está configurado para usar **URLs relativas** (`/api`), o que permite alternar entre HTTP e HTTPS sem alterar o código.

### 2. Inicialização
Para subir o ambiente completo:
```bash
chmod +x *.sh
./deploy.sh
```
Acesse em: **[http://institutomelvin.org:3000](http://institutomelvin.org:3000)**

### 3. Desenvolvimento (Hot Reload)
- **Frontend**: Qualquer alteração na pasta `frontend/` reflete instantaneamente no navegador (via Vite Proxy).
- **Backend**: Alterações na pasta `sistema/` exigem rodar o `./deploy.sh` novamente para recompilar o JAR.

---

## 🔍 Troubleshooting (Dicas)

### Erro 502 Bad Gateway em Produção
Se o servidor Nginx retornar erro 502, verifique no arquivo `/etc/nginx/sites-enabled/institutomelvin.org`:
- O `proxy_pass` deve usar **`http`** (e não `https`) para falar com o container Docker internamente:
  `proxy_pass http://localhost:8443/;`
- A barra `/` no final é essencial para o roteamento correto da API.

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto.
2. Crie uma **branch** para sua funcionalidade (`git checkout -b feature/NovaFuncionalidade`).
3. Faça o **commit** de suas mudanças (`git commit -m 'feat: Adiciona funcionalidade X'`).
4. Envie para o repositório remoto (`git push origin feature/NovaFuncionalidade`).
5. Abra um **Pull Request**.

---

Desenvolvido com ❤️ para o **Instituto Social Melvin**
