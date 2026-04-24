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
│   │   ├── hooks/           # usePermissions, useAlunos, useVoluntarios
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
├── docker-compose.yml       # Orquestração de todos os serviços (Produção)
├── docker-compose.dev.yml   # Orquestração para DESENVOLVIMENTO (Frontend com HMR)
├── .env                     # Variáveis de ambiente e segredos (NÃO COMMITAR)
├── dev.sh                   # Script para iniciar ambiente de desenvolvimento com HMR
└── deploy.sh                # Script para build e deploy de produção
```

---

## 🔢 Padrão de Matrícula

O sistema utiliza um padrão numérico para matrículas geradas automaticamente:

- **Alunos**: `[Ano][XXX]` (Ex: `2026001`, `2026002`) - 7 dígitos, sequência reiniciada anualmente.
- **Voluntários**: `[Ano][XXX]` (Ex: `2026001`) - Segue o mesmo padrão dos alunos, mas em tabela separada.
- **Legacy**: Matrículas de 8 dígitos (como `20247001`) são preservadas para compatibilidade de registros antigos.

---

## ⚙️ Ambiente de Desenvolvimento

Para facilitar o desenvolvimento, o projeto conta com um ambiente otimizado com **Hot Module Replacement (HMR)** no frontend:

### 1. Inicialização Rápida
O script `dev.sh` configura o ambiente de desenvolvimento com Hot Reload (HMR) no frontend:

```bash
chmod +x dev.sh
./dev.sh
```

### 2. Acessos
- **Frontend (HMR)**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8443](http://localhost:8443)
- **Credenciais de Teste (Admin)**: `20247001` / `admin`

---

## 🛡️ Critérios de Segurança

A segurança é tratada como prioridade no Sistema Melvin, utilizando padrões de mercado:

### 1. Autenticação e Autorização
- **JWT (JSON Web Tokens)**: A autenticação é *stateless* utilizando tokens JWT para validar sessões.
- **RBAC Dinâmico (ACL)**: O acesso não é mais estático por cargos. O sistema agora possui um sistema de permissões dinâmicas onde o Administrador decide, via interface, quais cargos podem:
    - Ver/Editar Alunos e Rendimentos.
    - Gerenciar Voluntários e Frequências.
    - Gerenciar Cestas, Embaixadores, Amigos e Avisos.
    - Exportar Relatórios e Dados Sensíveis.
- **Spring Security**: Filtros validam dinamicamente se o cargo do usuário possui a permissão necessária para o recurso solicitado.

### 2. Proteção de Dados
- **Hashing de Senhas (Argon2)**: As senhas são armazenadas utilizando o algoritmo **Argon2**, atualmente um dos mais robustos contra ataques de força bruta e rainbox tables.
- **CORS (Cross-Origin Resource Sharing)**: Configurado de forma restrita para permitir apenas origens autorizadas (especificadas via variável de ambiente).
- **Env Vars (Secrets)**: Nenhuma credencial ou segredo (como a `JWT_SECRET`) está *hardcoded*. Todas são injetadas via Docker através de um arquivo `.env` seguro.

### 3. Integridade e Validação
- **Input Validation (Jakarta Validation)**: Todos os dados que entram na API são validados (tamanho, formato, presença) antes do processamento.
- **Network Isolation**: No ambiente Docker, o banco de dados PostgreSQL não fica exposto para a rede externa, sendo acessível exclusivamente pelo backend (quando executado via Docker Compose).

### 3. Integrações de Pagamento e Notificações (Amigos do Melvin)
- **Stripe (Motor Financeiro)**: A plataforma integra com a Stripe via SDK nativo. Para testes locais, é recomendada a ferramenta `stripe-cli` para simular webhooks de pagamentos de assinaturas.
- **E-mails Automáticos**: Disparos transacionais (`spring-boot-starter-mail`) configurados no background via `@Async` para não penalizar a performance.
- **Validação Anti-Fraude**: Endpoints de Webhooks bloqueiam tentativas sem a assinatura validada (`Stripe-Signature`).

---

## 🧪 Testes e Qualidade

O projeto conta com uma suíte de testes automatizados:

### 1. Frontend (End-to-End - Cypress)
Os testes de ponta-a-ponta simulam a interação do usuário e validam o novo padrão de matrícula:

- **Discentes (`discentes.cy.js`)**: Valida o novo padrão `2026001`.
- **Voluntários (`voluntarios.cy.js`)**: Valida o novo padrão numérico.
- **Frequências (`frequencias.cy.js`)**: Testa a chamada escolar para as novas matrículas.
- **Autenticação (`auth.cy.js`)**: Valida login e redirecionamentos.
- **Permissões (`permissao.cy.js`)**: Valida a interface de configuração de permissões (CRUD de Regras).
- **Lógica de Permissões UI (`dynamic_permissions_ui.cy.js`)**: Valida se botões ("Editar", "Novo", "Exportar") e menus somem/aparecem corretamente ao trocar as permissões dos perfis.

**Como executar:**
```bash
cd frontend
npm run cypress:run  # Headless (Console)
npm run cypress:open # Interativo (Navegador)
```

### 2. Backend (Testes Unitários e de Integração - JUnit 5)
Focados na lógica de negócio e integridade dos serviços:

- **DiscenteServiceTest**: Valida regras críticas de negócio para alunos.
- **CestasServiceTest**: Cobre a lógica de criação, alteração e remoção de doações de cestas.
- **AmigoMelvinServiceTest**: Testes para a gestão de parceiros e amigos do Melvin.
- **DiarioServiceTest**: Valida a lógica de manipulação de arquivos de diário.
- **AvisoServiceTest**: Garante a integridade na gestão de avisos.
- **TokenServiceTest**: Valida a geração e verificação de tokens JWT de segurança.
- **SistemaApplicationTests**: Garante que o contexto do Spring Boot é carregado corretamente.

**Como executar:**
```bash
cd sistema
./mvnw test
```

---

## 🛠️ Scripts de Automação

O projeto inclui scripts em Bash para facilitar o dia a dia e o deploy:

- **`dev.sh`**: Ambiente de Desenvolvimento (Hot Reload):
    - Sobe o banco e o backend.
    - Frontend em modo dev com auto-refresh.
- **`deploy.sh`**: Ambiente de Produção:
    - Uso Local: `./deploy.sh` (Sobe containers otimizados em modo detach).
    - Uso Remoto: `./deploy.sh remote` (Sincroniza arquivos via rsync e executa o deploy no servidor).
- **`backup.sh`**: Gestão de Backups:
    - Gera um dump compactado (`.sql.gz`) do banco de dados.
    - Mantém apenas os últimos 7 dias de backups automaticamente.
- **`monitor_melvin.sh`** (servidor): Monitoramento de saúde do backend:
    - Registra uso de memória do container a cada hora em `/var/log/melvin_monitor.log`.
    - Detecta ocorrências de `OutOfMemoryError` automaticamente.
    - Reinicia o backend preventivamente se a memória ultrapassar 85%.

---

## 🚀 Como Executar (Produção)

### 1. Configuração Inicial
1. Certifique-se de ter o **Docker** instalado.
2. Configure o arquivo `.env` (baseado no `.env.example`). Certifique-se de adicionar as novas variáveis necessárias para o módulo "Amigos do Melvin":

```env
# Módulo de Doações (Stripe)
VITE_STRIPE_PUBLIC_KEY=pk_test_...         # Chave pública para o Frontend
STRIPE_API_KEY=sk_test_...                 # Chave secreta para o Backend
STRIPE_WEBHOOK_SECRET=whsec_...            # Segredo para validar Webhooks

# Módulo de E-mail (SMTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=seu-email@gmail.com
SPRING_MAIL_PASSWORD=sua-senha-de-app
```

### 2. Inicialização
```bash
./deploy.sh
```
Acesse em: **[http://institutomelvin.org:3000](http://institutomelvin.org:3000)**

### 3. Desenvolvimento (Hot Reload)
- **Frontend**: Qualquer alteração na pasta `frontend/` reflete instantaneamente no navegador (via Vite Proxy).
- **Backend**: Alterações na pasta `sistema/` exigem rodar o `./deploy.sh` novamente para recompilar o JAR.

---

## 🔧 Notas Técnicas (Desenvolvimento)

### Compatibilidade de Serviços (Frontend)
Para garantir que os componentes de formulário (como `Aluno_forms.jsx`) funcionem corretamente tanto em criação quanto em edição, os serviços `discenteService` e `diarioService` possuem o método `.get()` como um *alias* para `.getByMatricula()`. Isso mantém a consistência da interface com o padrão de chamadas da API.

### Endpoints da API
- Os endpoints seguem padrões REST, mas atente-se: `/cestas` e `/diarios` são no plural, enquanto `/aviso` é no singular. Os testes do Cypress já estão configurados para respeitar essas rotas.

### Testando Webhooks Localmente (Stripe CLI)
Para testar a confirmação de pagamentos ("Amigos do Melvin") sem precisar de um cartão real recorrente, utilize o Stripe CLI para simular o evento `invoice.paid`:

1. Faça o login e inicie o forwarder na mesma porta do backend:
```bash
stripe login
stripe listen --forward-to localhost:8443/api/v1/webhooks/payments
```
2. O terminal retornará um **Webhook Secret** (`whsec_...`). Coloque-o no `.env` do backend.
3. Dispare o evento simulado em outro terminal:
```bash
stripe trigger invoice.paid
```
O console do backend acusará "Webhook processed" e o doador será movido para o status `ACTIVE`.

---

## 🔍 Troubleshooting (Dicas)

### Erro 502 Bad Gateway em Produção
Se o servidor Nginx retornar erro 502, verifique no arquivo `/etc/nginx/sites-enabled/institutomelvin.org`:
- O `proxy_pass` deve usar **`http`** (e não `https`) para falar com o container Docker internamente:
  `proxy_pass http://localhost:8443/;`
- A barra `/` no final é essencial para o roteamento correto da API.

### Erro 504 Gateway Time-out (Crônico)
Se as páginas públicas (Embaixadores, Sobre Nós) ou o login passarem a retornar `504 Gateway Time-out` após semanas de uptime, a causa é **exaustão de memória heap da JVM**.

**Causa-raiz**: O container Docker do backend tem limite de 1GB. Sem flags explícitos, a JVM auto-calcula o heap máximo como apenas ~247MB (1/4 do limite), que é insuficiente para Spring Boot + Hibernate + Argon2 em operação contínua.

**Solução aplicada (Dockerfile)**:
```dockerfile
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```

**Diagnóstico rápido**:
```bash
# Verificar heap do processo rodando
docker exec backend-melvin cat /proc/1/cmdline | tr '\0' ' '

# Verificar uso de memória atual
docker stats --no-stream backend-melvin

# Verificar se houve OOM
docker logs backend-melvin 2>&1 | grep -i "OutOfMemoryError"

# Consultar histórico de monitoramento
cat /var/log/melvin_monitor.log | tail -48
```

### ⚠️ Backup do Banco (Cuidado com Prune)
O script de backup mensal (`/root/scripts/backup_postgres.sh`) **não deve** conter `docker system prune -a -f` ou `docker volume prune -f`, pois esses comandos podem remover imagens e volumes de containers em operação. A limpeza adequada é feita via `find` removendo apenas dumps antigos (> 30 dias).

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto.
2. Crie uma **branch** para sua funcionalidade (`git checkout -b feature/NovaFuncionalidade`).
3. Faça o **commit** de suas mudanças (`git commit -m 'feat: Adiciona funcionalidade X'`).
4. Envie para o repositório remoto (`git push origin feature/NovaFuncionalidade`).
5. Abra um **Pull Request**.

---

Desenvolvido com ❤️ para o **Instituto Social Melvin**
