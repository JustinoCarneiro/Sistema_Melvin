# Documentação Oficial: Sistema Melvin

Bem-vindo à documentação oficial e exaustiva do **Sistema Melvin**, desenvolvido para o Instituto Social Melvin. Este documento centraliza o entendimento técnico e de negócios, servindo como guia definitivo para arquitetura, fluxos de processos, módulos e regras do sistema.

---

## 1. Visão Geral da Arquitetura

O Sistema Melvin foi construído com foco em resiliência, segurança e manutenibilidade. A arquitetura segue o modelo de cliente-servidor (SPA) orquestrado em containers.

### 1.1 Stack Tecnológica
*   **Frontend:** Single Page Application (SPA) desenvolvida com **React**, empacotada pelo **Vite**, utilizando **TypeScript** para garantir tipagem estática e confiabilidade.
*   **Backend:** API RESTful construída em **Java 21** utilizando o framework **Spring Boot 3.3.x**. A arquitetura interna é baseada em Domains (Domain-Driven Design simplificado), separando lógica de negócios por entidades (Discente, Voluntário, Cestas, etc).
*   **Banco de Dados:** **PostgreSQL**, atuando como fonte única da verdade, utilizando Hibernate/JPA para mapeamento objeto-relacional.
*   **Infraestrutura:** Orquestração via **Docker** e **Docker Compose**, isolando o banco de dados da internet externa. Deploy com **Nginx** como proxy reverso.

### 1.2 Topologia de Rede e Segurança
*   **Isolamento:** O banco de dados (`postgresdb`) opera em uma rede Docker interna. Nenhuma porta sensível é exposta à rede pública em produção.
*   **Criptografia de Senhas:** O sistema utiliza o **Argon2** (padrão-ouro atual) para o *hashing* de senhas, mitigando completamente ataques de força bruta e *rainbow tables*.
*   **Sessões Stateless:** A autenticação é 100% gerenciada por tokens JWT (JSON Web Token), eliminando gargalos de sessão na memória do servidor.

---

## 2. Módulos do Sistema e Regras de Negócio Core

O Sistema Melvin é dividido em diversos "Domínios" (Módulos), cada um responsável por uma parte crucial da gestão do Instituto.

### 2.1 Módulo de Discentes (Alunos)
*   **Gestão de Cadastros:** Formulários completos para adição de crianças e adolescentes. O sistema lida ativamente com validações para impedir a inserção de "Alunos repetidos".
*   **Padrão de Matrícula:** Alunos novos recebem um número de 7 dígitos sequencial gerado pelo backend de forma automática: `[Ano][XXX]` (Ex: `2026001`). Matrículas legadas de 8 dígitos (`20247001`) são aceitas por retrocompatibilidade.
*   **Status de Vínculo:** O aluno pode estar Ativo, Inativo ou **"Em espera..."**. A opção "Em espera" é crucial para manter o cadastro de crianças interessadas enquanto não há vagas físicas disponíveis no instituto.
*   **Aulas Extras:** O cadastro do aluno possui campos para vincular a criança a múltiplas aulas extras oferecidas pelo projeto (Karatê, Informática, Dança, etc).
*   **Deleção de Registros:** Administradores têm o poder de deletar fisicamente registros de alunos (exclusão acompanhada de alertas na UI para evitar acidentes).

### 2.2 Módulo de Voluntários e Professores
*   **Múltiplas Turmas/Salas:** Diferente de sistemas escolares tradicionais que travam um professor a uma única disciplina, o Sistema Melvin permite que um Voluntário/Professor participe e gerencie **mais de uma sala** (Ex: o mesmo voluntário dá aula de Informática e Reforço).
*   **Status do Voluntário:** Segue a mesma regra dos alunos, possuindo controle de atividade e a fila de "Em espera...".
*   **Geração de Matrícula:** Voluntários também ganham uma matrícula `[Ano][XXX]`, mas armazenada e sequenciada em sua própria tabela independente dos alunos.

### 2.3 Módulo Acadêmico (Frequência e Diário de Rendimento)
*   **Ponto Eletrônico (Frequência):** Controle de batida de ponto e presença, permitindo registrar a assiduidade tanto de alunos nas aulas regulares/extras, quanto dos voluntários nos seus turnos.
*   **Diário / Notas:** Professores podem lançar notas, avaliações e observações de rendimento no painel do aluno. A interface de "Visualização do Aluno" congrega todas essas informações em um único dashboard detalhado (Frequência + Notas + Dados).

### 2.4 Módulo de Assistência Social (Cestas Básicas e Doações)
*   **Controle de Inventário:** Ferramenta dedicada a monitorar a entrada e saída física de **Cestas Básicas** e donativos do Instituto.
*   **Distribuição:** Permite o registro histórico para auditar quais famílias ou alunos receberam doações e em quais datas, mantendo a transparência das ações sociais.

### 2.5 Módulo Financeiro (Amigos do Melvin)
*   **Sustentabilidade via Assinaturas:** O sistema integra de forma nativa com a **Stripe** para recebimento de doações recorrentes mensais (cartão de crédito).
*   **Validação Anti-Fraude:** Os eventos de pagamento ("Invoice Paid") são confirmados exclusivamente via *Webhooks* criptografados entre a Stripe e o backend do Melvin, impedindo que requisições forjadas ativem contas no banco de dados.

### 2.6 Módulo Institucional e Comunicação
*   **Embaixadores:** Gestão de grandes parceiros, empresas e "Embaixadores" da causa do instituto. O sistema os lista na landing page (site público) e gerencia seus perfis.
*   **Avisos (Mural):** Área administrativa para disparar comunicados para toda a equipe ou base de usuários.
*   **Atualização Dinâmica de Textos/Imagens:** O backend possui um domínio `imagem` e o frontend possui páginas de configuração onde os diretores podem atualizar textos da landing page, fotos institucionais, "logo para voltar", tudo sem precisar de um programador para mexer no código.

### 2.7 Módulo de Segurança Dinâmica (RBAC - Role-Based Access Control)
*   Diferente de permissões *hardcoded* (fixas no código), o sistema conta com uma aba de **Configurações de Permissões**.
*   O Administrador pode criar papéis e selecionar, em uma tela cheia de *checkboxes*, o que aquele cargo pode ou não pode ver/fazer. Exemplo: "Pode editar aluno", "Pode ver frequência", "Não pode excluir voluntário". 
*   O Frontend adapta os botões da tela ("Novo", "Editar") baseando-se nestas regras dinâmicas, e o Backend valida duplamente a mesma permissão em cada rota.

### 2.8 Dashboard e Relatórios
*   **Exportações:** O sistema possui uma área dedicada para exportação em lote de informações sensíveis (PDF/Excel), cujo acesso é altamente restrito no painel RBAC.
*   **Dashboard:** Uma tela inicial (HomeApp) agregadora, mostrando números rápidos como total de alunos ativos, cestas doadas e amigos do melvin registrados.

---

## 3. Fluxos Operacionais (Mapeamento de Processos)

### 3.1 O Ciclo de Vida do Aluno
1.  **Triagem:** Os pais procuram a instituição. Se não há vaga, a criança é cadastrada como "Em espera...".
2.  **Efetivação:** Abrindo a vaga, o status muda para "Ativo" e a Matrícula (`2026XXX`) é gerada.
3.  **Alocação Escolar:** O aluno é matriculado em suas turmas (Reforço, Karatê, etc).
4.  **Acompanhamento:** Ao longo do ano, Voluntários geram entradas de Frequência e Rendimento.
5.  **Apoio Social:** Caso a família tenha vulnerabilidade, lançamentos de doações são feitos no Módulo de Cestas Básicas.
6.  **Desligamento:** Ao sair do instituto, o status vai para inativo ou, em casos excepcionais (duplicação/erro), usa-se o módulo de Deletar.

### 3.2 O Fluxo de Arrecadação (Stripe)
1.  **Checkout Front:** O visitante acessa o site do Instituto e escolhe um valor de doação. Ele insere o cartão (o número do cartão *nunca* toca o backend do Melvin, vai direto para o servidor da Stripe via chave pública `pk_`).
2.  **Pré-Registro:** O sistema salva o contato da pessoa no banco com a tag `PENDING` (Aguardando Pagamento).
3.  **Webhook Backend:** A Stripe processa a cobrança do cartão. Com o dinheiro garantido, os servidores da Stripe mandam uma requisição `POST` secreta para nosso backend.
4.  **Ativação:** O backend reconhece o `POST`, valida a chave secreta `whsec_`, encontra o usuário no banco de dados e altera seu status para `ACTIVE`.

### 3.3 O Fluxo de E-mails e Notificações Transacionais
*   A aplicação usa a biblioteca `spring-boot-starter-mail` conectada ao Gmail/SMTP Institucional.
*   **Regra de Processamento Paralelo (`@Async`):** Nenhum carregamento de página do sistema fica esperando um e-mail ser enviado (o que causaria lentidão e *"loading"* infinito para o usuário). O Spring Boot empurra o envio para uma *Thread Pool* assíncrona, enviando os e-mails nos bastidores silenciosamente.

---

## 4. Manutenção, Infraestrutura e Ciclo de Vida Técnica

### 4.1 Ambiente de Desenvolvimento Ágil (HMR)
O desenvolvimento local exige agilidade:
*   Ao rodar `./dev.sh`, o banco e a API sobem. O frontend usa o **Vite Proxy** para conectar o `localhost:3001` (React) com o `localhost:8443` (Spring).
*   **HMR (Hot Module Replacement):** Qualquer alteração visual ou lógica feita no código do Frontend (ex: alterar a cor de um botão em um `.jsx`) reflete em menos de 1 segundo na tela, sem recarregar a página e sem perder os dados preenchidos nos formulários.

### 4.2 Scripts de Automação e CI/CD Manual
*   **`deploy.sh`:** Compila o `.jar` do Java e faz o build de produção estático do Frontend, levantando a arquitetura em containers finais (`docker-compose.yml`).
*   **`deploy-remote.sh`:** Conecta via SSH no servidor VPS de produção, faz **Rsync** dos arquivos do projeto local para o remoto, pulando o `node_modules` e `.git`, e comanda um deploy instantâneo na máquina alvo.

### 4.3 Saúde do Servidor e Prevenção de Quedas
O backend do Melvin, por ser robusto e rodar o Hibernate e algoritmos pesados de criptografia, gerava picos na RAM que causavam um crônico erro `504 Gateway Time-out`. As mitigações atuais são:
1.  **Limitação JVM:** O Dockerfile do Java agora obriga o Heap de Memória a não ultrapassar 512MB (`-Xms256m`, `-Xmx512m`), estabilizando o garbage collector.
2.  **`monitor_melvin.sh`:** Um daemon roda em background no servidor Linux gravando logs a cada hora. Se ele detectar a palavra "OutOfMemoryError" nos logs do container Docker, ele ativa medidas preventivas.
3.  **Proxy Reverso (Nginx):** Configurações refinadas do `proxy_pass` resolvem bloqueios e evitam os erros genéricos de `502 Bad Gateway`.

### 4.4 Políticas de Backup e Retenção (Disaster Recovery)
O arquivo `backup.sh` roda automaticamente no Cron (agendador de tarefas) do servidor Linux:
*   Extrai todos os dados críticos do Postgres para um dump (`.sql.gz`) sem travar a aplicação em andamento.
*   **Limpeza Inteligente:** Para evitar que o HD do servidor exploda em alguns meses, um comando `find` rastreia backups anteriores a 30 dias e os exclui.
*   **Cuidado com Comandos Nocivos:** É estritamente documentado não se utilizar comandos como `docker system prune` dentro dos cronjobs de backup para não deletar as imagens operacionais da aplicação no meio da madrugada.
