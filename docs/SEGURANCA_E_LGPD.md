# Relatório de Segurança e Conformidade à LGPD
*Instituto Social Melvin — Maio/2026*

Este documento detalha as medidas técnicas e arquiteturais adotadas no **Sistema Melvin** para garantir a segurança da informação e a estrita conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**. O sistema foi desenvolvido considerando que a instituição lida diretamente com dados de extrema sensibilidade (menores de idade, dados de saúde e informações financeiras).

---

## 1. Segurança da Informação (Proteção contra Ameaças)

A arquitetura do Sistema Melvin implementa proteção de nível bancário contra ataques cibernéticos e vazamentos:

### 🔐 Criptografia Avançada de Senhas
As senhas de acesso da equipe nunca são armazenadas em texto legível. O sistema utiliza o algoritmo **Argon2**, vencedor do prêmio *Password Hashing Competition*, amplamente recomendado por órgãos internacionais de cibersegurança. Ele é altamente resistente a ataques de força bruta, tornando as senhas indecifráveis mesmo para a equipe técnica de TI.

### 🛡️ Banco de Dados Inacessível e Isolado
Os registros das famílias, crianças e voluntários ficam armazenados em um banco de dados hospedado em uma rede fechada ("Docker Interna"). O banco não possui comunicação com a internet externa. Qualquer requisição de dados precisa obrigatoriamente passar pelas barreiras de validação da aplicação principal.

### 🔑 Controle de Acesso Dinâmico (RBAC)
O sistema impede ações indevidas da própria equipe interna. Através de um Controle de Acesso Baseado em Cargos (RBAC), a direção define restrições rigorosas e granulares (ex: "Professores podem ver chamadas, mas não podem visualizar dados médicos de alunos ou exportar relatórios"). O acesso é bloqueado diretamente no servidor caso o usuário tente "burlar" a interface gráfica.

### 🔒 Criptografia de Dados em Repouso (At-Rest)
Para garantir proteção extrema aos dados mais sensíveis (doenças, laudos, medicações, RG, contatos e renda familiar), o sistema utiliza **Criptografia Transparente AES-256-GCM** direto no banco de dados. Embora o isolamento da rede já torne uma invasão altamente improvável, implementamos essa barreira extra de prevenção: as informações são guardadas no disco em um formato criptografado ilegível. O algoritmo gera um vetor de inicialização único (IV) para cada gravação, garantindo total privacidade e tranquilidade para o Instituto, prevenindo qualquer leitura indevida.

### 💾 Recuperação de Desastres (Disaster Recovery)
Em caso de falha de hardware, erro humano ou perda de servidor, o histórico da ONG não é perdido. Um script automatizado no servidor realiza **Backups Diários** blindados de todo o banco de dados, guardando versões de recuperação dos últimos 30 dias de forma criptografada.

---

## 2. Conformidade Estrutural com a LGPD

O sistema foi arquitetado em torno dos pilares centrais da Lei Geral de Proteção de Dados: **Minimização, Transparência, Finalidade e Direito ao Esquecimento**.

### ⚖️ Minimização de Dados e Prevenção de Vazamento (Art. 6º, III)
Para evitar a exposição desnecessária de dados sensíveis (saúde, endereço, filiação, remuneração), a plataforma foi refatorada para utilizar o padrão arquitetural de *Data Transfer Objects* (DTOs). 
Isso significa que, nas listas públicas do sistema que trafegam diariamente na internet (como a lista geral de alunos ou de voluntários), o servidor envia apenas **dados estritamente necessários** (como Nome, Matrícula e Status). Prontuários e identificadores sensíveis ficam "presos" em um cofre no servidor e só são revelados especificamente quando a coordenação clica para editar o perfil individual de uma criança.

### 🗑️ Direito ao Esquecimento vs. Prestação de Contas (Art. 18, VI)
A LGPD exige que o cidadão tenha o direito de ter seus dados apagados. Porém, a ONG precisa prestar contas quantitativas a auditores e financiadores. O Sistema Melvin resolve esse dilema com a arquitetura de **Soft Delete e Anonimização Irreversível**:
1. Quando uma família solicita a exclusão ou a criança encerra seu ciclo, ela não é "deletada" agressivamente para não quebrar as tabelas estatísticas do instituto.
2. O sistema altera o status para *Inativo*.
3. Simultaneamente, um algoritmo varre os dados sensíveis daquela criança (doenças, alergias, medicações, endereço e telefones dos pais) e os **sobrescreve de forma irrevogável** pela palavra `"Anonimizado"`.
Desta forma, o Instituto obedece à LGPD, protegendo a criança, mas mantém vivo o histórico numérico ("Atendemos 100 alunos neste ano") para fins de prestação de contas governamental.

### ✅ Coleta de Consentimento Explícito (Amigos do Melvin)
A área pública de doações exige o consentimento livre, inequívoco e informado do doador. Antes de avançar para a tela de pagamento, o usuário é obrigado, via sistema, a preencher uma caixa de seleção ("*checkbox*") que legaliza o uso de seus dados para contato institucional e indica claramente como ele pode revogar aquele consentimento no futuro (via WhatsApp). 

---

## 3. Segurança Financeira e Pagamentos (Stripe PCI Compliance)

O módulo de assinaturas "Amigos do Melvin" utiliza a processadora de pagamentos **Stripe**, isentando legalmente o Instituto Social Melvin do risco e da responsabilidade sobre dados de cartão de crédito:

- **PCI-DSS:** O número do cartão, CVV e validade **não tocam** nos servidores do Instituto Melvin. Eles trafegam diretamente do navegador do doador para os servidores da Stripe via canais criptografados nativos.
- **Autenticidade de Notificações (Webhooks):** Para evitar fraudadores simulando "pagamentos falsos", o servidor do Instituto valida a assinatura criptográfica de todo comunicado bancário recebido. Se o comunicado não for assinado criptograficamente com a chave secreta da Stripe (`STRIPE_WEBHOOK_SECRET`), ele é sumariamente bloqueado.

---

## Conclusão

O **Sistema Melvin** foi entregue como uma plataforma blindada, garantindo não apenas a fluidez e a praticidade administrativa para a ONG, mas também total amparo jurídico contra exposição indevida, retendo métricas de impacto de forma segura, inviolável e totalmente alinhada às normativas vigentes da proteção de dados brasileira.
