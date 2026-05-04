# Sistema Melvin — Apresentação para o Instituto

*Instituto Social Melvin — Plataforma Digital de Gestão*
*Documento de Apresentação | Versão 2.0 — Maio/2026*

---

## Bem-vindo à Plataforma Melvin

A Plataforma Digital do Instituto Social Melvin foi criada com um único propósito: **simplificar a gestão do instituto para que a equipe possa focar no que realmente importa — as pessoas**.

Neste documento, apresentamos de forma clara e objetiva tudo o que o sistema já oferece ao Instituto.

---

## 1. O que é o Sistema Melvin?

É uma plataforma web acessada pelo navegador, com segurança de nível bancário, que centraliza em um único lugar:

- ✅ O cadastro e acompanhamento de **todas as crianças atendidas**
- ✅ A gestão dos **voluntários e professores**
- ✅ O registro de **presença e frequência** de alunos e voluntários
- ✅ O controle de **doações e cestas básicas**
- ✅ O programa de **doações mensais recorrentes** (Amigos do Melvin)
- ✅ A gestão dos **embaixadores e parceiros** do Instituto
- ✅ O disparo de **comunicados e avisos** para toda a equipe
- ✅ A atualização do **site público** do Instituto

---

## 2. Segurança: os dados das famílias estão protegidos

A segurança dos dados das crianças e famílias atendidas é tratada como **prioridade absoluta** no sistema. As proteções em vigor são:

### 🔐 Acesso com Senha Pessoal
Cada voluntário e coordenador tem sua própria matrícula e senha para entrar no sistema. Ninguém acessa o sistema sem autorização.

### 🔒 Senhas Criptografadas (Nível Governamental)
As senhas nunca são salvas como texto legível. O sistema usa um algoritmo de proteção de senhas chamado **Argon2** — o mesmo padrão recomendado por organismos de segurança internacionais — que torna as senhas ilegíveis mesmo para a equipe técnica.

### 🛡️ Banco de Dados Isolado
O banco de dados onde ficam os registros das crianças e famílias está em uma camada de rede completamente separada da internet. Um atacante externo não consegue alcançá-lo diretamente.

### 💾 Backup Automático Diário
Um sistema automático gera cópias de segurança do banco de dados todos os dias. As cópias são mantidas por 30 dias, garantindo que o instituto nunca perca seu histórico em caso de falha de hardware.

---

## 3. Gestão de Alunos

### Cadastro Completo
Cada aluno tem um perfil com informações pessoais, dados dos responsáveis e informações de saúde e contato.

### Matrícula Automática
Ao cadastrar um novo aluno, o sistema gera automaticamente um número de matrícula único e padronizado por ano (ex: `2026001`), sem necessidade de controle manual em planilhas.

### Fila de Espera
Quando não há vagas disponíveis, a criança pode ser cadastrada no sistema com o status **"Em Espera"**. Assim que abrir uma vaga, basta alterar o status para Ativo — sem perder os dados já inseridos.

### Prevenção de Duplicatas
O sistema detecta automaticamente tentativas de cadastrar um aluno que já existe, evitando registros duplicados que confundem os relatórios.

### Painel Unificado do Aluno
Em um único clique, a coordenação visualiza tudo sobre um aluno: dados pessoais, boletim de notas, histórico de frequência e quais aulas extras (Karatê, Ballet, Informática) ele participa.

---

## 4. Gestão de Voluntários

### Múltiplas Atividades
Um professor voluntário não precisa ficar limitado a uma única atividade. O sistema permite que um mesmo voluntário seja registrado em múltiplas turmas e disciplinas ao mesmo tempo — refletindo a realidade do trabalho voluntário.

### Fila de Espera para Voluntários
Assim como os alunos, voluntários interessados podem ser cadastrados no sistema como "Em Espera" enquanto não há posição disponível.

---

## 5. Frequência e Ponto Eletrônico

O papel acabou. O registro de presença é feito diretamente no sistema, de forma rápida e organizada.

- **Para Alunos:** A chamada é registrada por sala e data, com opção de Presente (`P`), Falta (`F`) ou Falta Justificada (`FJ`) — para manhã e tarde separadamente.
- **Para Voluntários:** O mesmo sistema de ponto é aplicado para os voluntários em seus turnos.
- **Auto-registro:** O próprio voluntário pode registrar sua presença pelo sistema, na sua área pessoal.
- **Alertas de Ausência:** O sistema identifica automaticamente alunos com alto índice de faltas para que a coordenação possa agir.

---

## 6. Diário e Rendimento Acadêmico

- Professores podem anexar arquivos de avaliação (diários, boletins) diretamente ao perfil do aluno.
- A tela de Rendimento exibe de forma organizada o histórico completo de notas e desempenho de cada criança.
- O Dashboard principal exibe rankings de frequência e engajamento para uma visão rápida da situação geral das turmas.

---

## 7. Assistência Social — Cestas Básicas

O Instituto tem controle total e transparente sobre a distribuição de donativos:
- Registro de cada entrega de cesta básica com data, beneficiário e responsável.
- Histórico completo de todas as distribuições para fins de prestação de contas e auditoria.

---

## 8. Amigos do Melvin — Doações Mensais

O programa de sustentabilidade do Instituto conta com um **motor financeiro automatizado e seguro**.

### Como funciona para o doador:
1. O doador acessa o site do Instituto e escolhe um valor de doação mensal.
2. Preenche seus dados e insere o cartão de crédito de forma segura.
3. Recebe um e-mail automático de confirmação.

### Como funciona internamente:
- O sistema processa os pagamentos via **Stripe** — a maior processadora de pagamentos do mundo, usada por empresas como Amazon, Airbnb e Shopify.
- **Os dados do cartão nunca passam pelo Instituto** — vão diretamente para os servidores seguros da Stripe.
- Quando o banco aprova o pagamento, a Stripe avisa o sistema automaticamente. O doador é ativado e a confirmação é enviada por e-mail — **sem nenhuma intervenção manual** da equipe.

### Autoatendimento e Cancelamento Descomplicado:
- Se um doador precisar alterar o cartão ou cancelar a doação, ele não precisa enviar mensagem para a equipe. Ele mesmo faz isso através de um **Portal Seguro (Customer Portal)** acessado por um link recebido em seu e-mail.
- A coordenação também pode cancelar a assinatura diretamente pelo painel do Melvin com um único clique.

### Recuperação e Antifraude:
- **Retentativas Inteligentes:** Se o cartão falhar por falta de limite, o sistema não cancela na hora. Ele tenta cobrar de forma automática e inteligente (até 8 vezes) para recuperar a doação.
- **Proteção Antifraude:** O sistema possui o Stripe Radar ativado, que bloqueia automaticamente cartões suspeitos ou clonados, protegendo a reputação do Instituto.

---

## 9. Comunicação e Avisos

- A equipe de coordenação pode publicar avisos e comunicados com imagem, data de início e validade.
- Os avisos ficam visíveis para todos os usuários do sistema no painel principal.

---

## 10. Embaixadores e Parceiros

- Gestão completa de empresas e parceiros apoiadores do Instituto.
- As informações e fotos dos embaixadores são exibidas no site público automaticamente, sem necessidade de alteração no código.

---

## 11. Controle de Acesso — Quem pode fazer o quê

O Instituto tem **controle total** sobre o que cada colaborador pode acessar ou modificar, sem depender da equipe de TI para fazer ajustes.

Através de um painel de configurações simples, o Diretor define, com cliques, as permissões de cada cargo:

> *"Professores podem lançar notas, mas não podem apagar alunos."*
> *"Voluntários podem ver frequências, mas não podem exportar relatórios."*

As regras entram em vigor imediatamente e são respeitadas tanto pela interface visual (os botões somem/aparecem conforme a permissão) quanto pelo servidor (que bloqueia tentativas não autorizadas).

---

> **🚧 Próximos Passos:** Uma das melhorias planejadas para o sistema é permitir que a equipe do Instituto atualize textos e imagens do site público diretamente pelo painel, sem precisar chamar um programador. Esta funcionalidade está no roadmap de desenvolvimento.

---

## 12. Por que o Sistema Melvin é uma base sólida?

| Característica | O que significa na prática |
|---|---|
| Baseado em nuvem (Docker) | Pode ser acessado de qualquer computador, tablet ou celular |
| Backups automáticos | Zero risco de perder anos de histórico do instituto |
| Permissões granulares | Cada colaborador vê apenas o que precisa ver |
| Stripe integrado | Doações caem na conta sem trabalho manual |
| E-mails automáticos | Confirmações e comunicados saem sem ninguém fazer nada |
| Código testado | Testes automáticos garantem que novas atualizações não quebrem o que já funciona |

---

*Para dúvidas técnicas, consulte o documento `DOCUMENTACAO_TECNICA.md`.*

*Desenvolvido com ❤️ para o Instituto Social Melvin.*
