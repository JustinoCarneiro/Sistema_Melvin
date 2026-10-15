---
tipo: decisao
data: 2026-10-14
status: Ativa
---

# Decisões de 14/10/2026: Área da Família, Transparência, WhatsApp, nota psicológica e atribuição dos prazos

## Contexto
Para fechar a Fase 1 (gate G1 do `ROADMAP.md`: "decisões ainda abertas na spec") das evoluções de 08/10/2026
(Épicos 10 e 13, US-5.6), o dono do projeto, Marcos, respondeu em 14/10/2026 às perguntas que
travavam o desenho. Esta nota guarda as respostas **e o porquê de cada uma**, para que um
questionamento futuro (do Instituto, de uma auditoria ou de uma sessão nova) encontre a
justificativa, não só o resultado. A spec (`docs/product/spec.md`) guarda o critério de aceite; esta
nota guarda a razão.

Quem decide é o dono do projeto. A pessoa de referência do Instituto para conteúdo e testes é a
administração (item 2). Nada aqui foi publicado em produção.

## Decisão

### 1. Acesso dos responsáveis (US-13.1): cadastro presencial, sem autocadastro
A coordenação e a administração cadastram cada responsável **depois de conferir o documento
pessoalmente** e entregam o login inicial. Não existe autocadastro.

Por quê:
- O portal mostra dados de crianças e permite **agir**: justificar falta, trocar telefone, autorizar passeio.
- Autocadastro validado por dados que outras pessoas sabem (CPF, matrícula, data de nascimento)
  deixaria quem não é o responsável ver os dados da criança ou autorizar um passeio.
- Conferir o documento é a única checagem confiável. O Instituto já faz isso na matrícula, e dados de
  criança têm proteção reforçada na LGPD.
- O custo é um cadastro por família, e qualquer pessoa da coordenação ou da administração pode fazê-lo.

Caminho de evolução, se o cadastro virar gargalo: **convite por link no e-mail cadastrado**, ainda
confirmado pela coordenação. Autocadastro aberto não é o caminho.

### 2. Pessoa de referência do Instituto: a administração
A pessoa de referência do Instituto para conteúdo e testes é a administração. Distinção a manter:
a aprovação dos números da Transparência é da administração (item 5), e a aprovação dos relatórios de
desenvolvimento é da coordenação (item 4).

### 3. Painel "Meu Filho" completo (US-13.2 e US-13.3)
Com foto, professor e conteúdos trabalhados. A autorização de imagem **já está assinada na
matrícula** (equipe e alunos), então não é restrição para este uso.
- **Foto:** campo novo na ficha do aluno, com upload reaproveitando o `UploadSeguro` (validação por
  conteúdo, não só por nome/tipo declarado).
- **Professor:** sai do cruzamento `Voluntario.funcao` + `salaUm`/`salaDois` com `Discente.sala`, **sem
  cadastro novo**. Antes de desenhar, conferir em produção **só por contagem** (sem ler dados) se esses campos estão
  preenchidos. Essa conferência ainda não foi feita.
- **Conteúdos trabalhados:** registro novo (sala + data + texto curto), lançado pelo professor por dia
  ou por semana.

Critério: reaproveitar o que já existe (cruzamento para o professor, `UploadSeguro` para a foto) e só
criar registro novo onde não há dado (conteúdos trabalhados). **Impacto:** a captura nova (foto e conteúdos) é
o item que o `ROADMAP.md` (gate 6) já apontava como o que estoura os 7 dias do módulo 23. O módulo 23
**aumenta e precisa ser reestimado ao desenhar** (Fase 3). Esta nota não fixa o novo peso.

### 4. Desenvolvimento (US-13.4): só relatório escrito e aprovado; psicológica nunca
A família vê **só relatórios escritos e aprovados pela coordenação**, com registro de quem aprovou. A
avaliação psicológica **nunca** vai à família, em nenhuma tela nem resposta de API.

Por quê:
- Nota solta, sem contexto, gera ansiedade e comparação entre crianças. O relatório dá contexto.
- A aprovação evita publicar algo sensível sem revisão, e o registro de quem aprovou permite
  responsabilizar e corrigir.
- A avaliação psicológica é dado sensível de saúde de criança e é de uso da equipe.
- Ressalva honesta: a lei **não proíbe** mostrar notas pedagógicas à família. Isso é uma
  **recomendação**; a base forte (LGPD, dado de saúde de criança) é só a nota psicológica. Se o Instituto
  quiser mostrar notas pedagógicas depois, não há impedimento legal, só a razão pedagógica acima.

### 5. Números da Transparência (US-10.13): valores enviados pelo Instituto, aprovados pela administração
O Instituto envia os valores prontos, **com período e fonte**, e a administração os aprova antes de
publicar. **Sem cálculo automático.**

Por quê:
- O sistema só tem parte dos dados (alunos ativos, cestas, doações). Refeições e famílias atendidas
  por projeto não estão registradas de forma confiável.
- Número errado em página pública custa credibilidade ao Instituto.
- Contagem pequena por categoria pode identificar uma família; a revisão humana antes de aprovar é
  também a barreira de privacidade.
- Cabe no escopo estimado sem aumentá-lo (conteúdo informado, não integração de agregação).

Depois, indicadores do sistema podem entrar **pré-calculados para aprovação**, nunca publicados
direto. Isso é mudança de escopo futura, não faz parte desta entrega.

### 6. WhatsApp (US-5.6, módulo 14): fica para depois, sem prioridade
O Instituto forneceu um número de telefone para isso; **ele não é registrado neste repositório** (o repo é público). Não
existe configuração do lado da Meta. Faltam:
- conta Meta Business;
- registro do número (confirmação por SMS ou ligação; em geral o número não pode estar ativo no
  WhatsApp comum ao mesmo tempo);
- aprovação do template de mensagem.

Decisão: fica para depois, sem prioridade agora. Contexto: os três passos acima são externos ao
desenvolvimento, e o aviso de falta por e-mail (US-5.5) já está em produção.

### 7. Nota psicológica: só PSICO e COOR a veem, em todos os lugares
Até 10/10/2026 a restrição valia só para o ranking do painel. Passa a valer em **todo lugar**:
ficha do aluno (`GET /discente/matricula/{m}`, que também alimenta a tela Rendimento), resposta de
cadastro e edição do aluno (`POST`/`PUT /discente`) e planilha Excel de alunos.

Como ficou:
- Para quem não é `PSICO` nem `COOR`, a chave `avaliacaoPsicologico` é **omitida** da resposta (não zerada); a tela
  Rendimento esconde a linha quando a chave não vem. Para `PSICO`/`COOR` a chave vem sempre, mesmo
  com valor nulo (senão a Psicologia não conseguiria lançar a primeira nota).
- No Excel, a coluna fica vazia e a média usa as quatro notas pedagógicas, com o cabeçalho "Média
  Pedagógica" (a "Média Geral" de cinco notas segue para `PSICO`/`COOR`).
- Quem não vê a nota também **não a grava**: `alterarAvaliacoes` só aplica a nota psicológica se a
  pessoa tem `EDITAR_AVALIACAO_PSICO` **e** é `PSICO`/`COOR`. Sem isso, a tela (que não mostra o campo)
  enviaria a avaliação sem a nota e apagaria a existente.
- A regra mora em `NotaPsicologicaAcesso`, a mesma fonte usada pelo painel.

**Impacto:** na configuração de produção de 14/10/2026, `ADM`, `DIRE` e `TECH` tinham a permissão
`EDITAR_AVALIACAO_PSICO` e viam/editavam a nota. **Passam a não ver nem editar.** Isso é intencional,
não regressão; quem precisar da nota deve ser `PSICO` ou `COOR`.

Por quê: a nota psicológica é dado sensível de saúde de criança (ver item 4). Restringir só o painel
deixava a mesma nota aberta a outros cargos em outras telas, o que esvaziava a restrição. Detalhes
técnicos e histórico em [[dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica]].

### 8. Prazos: 08/01/2027 e as duas etapas são meta do Marcos, não prazo do cliente
O 08/01/2027 e as datas das duas etapas (núcleo e restante) foram definidos pelo dono do projeto
como meta interna de planejamento. **O Instituto não impôs prazo** e não há aceite de datas a
pedir a ele. A postura combinada é "vamos trabalhando e entregando o mais rápido e seguro possível".

Por quê a correção: os registros de 08/10/2026 (`CLAUDE.md`, `ROADMAP.md`, nota de entrega em duas
etapas) diziam "prazo máximo do cliente" e "pendente: aceite do Instituto". Isso criaria, se repetido
ao Instituto, um compromisso que ninguém pediu. A ordem das etapas e a aritmética continuam válidas;
só a atribuição mudou. Ver [[entrega-em-duas-etapas-prazo-08-01-2027]].

### 9. Complemento de 14/10/2026: reestimativa do módulo 23 e desenho do módulo 19
Na mesma sessão, recomendações técnicas foram aceitas pelo dono do projeto:
- **Reestimativa:** a captura nova do painel (item 3) vira dois habilitadores sem história própria, o módulo 31 (foto do aluno, Pequeno, 2 dias) e o 32 (conteúdos trabalhados, Médio, 4 dias), e o módulo 23 continua Grande, 7 dias. Pela fórmula literal do playbook, a fórmula vai de 85 para 91 dias úteis, o núcleo de 52 para 58 (07/01/2027, 1 dia útil de folga) e o total com duas homologações de 87 para 93 (01/03/2027). O módulo 30 permanece no núcleo; movê-lo para a etapa 2 devolveria 4 dias de folga se necessário.
- **Módulo 19, token separado:** o JWT de família tem emissor, audiência e chave próprios, `sub` em UUID e cadeia de segurança própria para `/familia/**`. Motivo: o token da equipe usa um emissor e uma chave únicos com `sub` igual ao login, então um token de família no mesmo formato, com login igual a uma matrícula de equipe, autenticaria como essa pessoa, e na mesma cadeia passaria pelas regras de "qualquer logado" da equipe.
- **Módulo 19, cadastro:** login gerado pelo sistema e não derivável de CPF, matrícula ou telefone; senha temporária mostrada uma única vez, com troca obrigatória no primeiro acesso; o número do documento do responsável não é guardado, só quem conferiu e quando (minimização, LGPD); permissão dinâmica `GERENCIAR_RESPONSAVEIS` (COOR, ADM, TECH).
- **Ainda aberto:** (a) o escopo do cadastro editorial (agenda, cardápio, notícias, documentos), última pendência do gate G1; (b) a "evolução no reforço escolar" da US-13.3, que conflita com o item 4 e não tem fonte de dados (recomendação: sair do Acompanhamento e ficar com os relatórios da US-13.4).

### 10. Decisões de 15/10/2026: acesso de voluntário desligado, M2, B2 e B1
Quatro recomendações técnicas foram aceitas pelo dono do projeto, cada uma com a justificativa abaixo, para responder a questionamentos futuros.
- **Voluntário desligado perde o acesso à equipe (corrigido no código, sem deploy).** Desligar só marcava `status = "false"` e o usuário seguia habilitado, então a pessoa continuava entrando com o cargo antigo. Regra: voluntário de mesma matrícula com status diferente de `"true"` (nulo também) torna a conta inativa; conta sem voluntário (administrativa ou técnica) segue ativa. No login, a conta inativa responde como matrícula inexistente, com a mesma mensagem de senha errada, para não revelar que existe; a cada requisição o filtro recusa o token de quem foi desligado. O status do voluntário é a única fonte, então reativar reabre o acesso sem mexer no usuário. **Por quê:** quem não tem mais vínculo com o Instituto não deve ler dados de crianças (princípio do menor privilégio e encerramento de acesso no desligamento, LGPD); coordenação desligada também lia a nota psicológica. **Cuidado de rollout (feito):** um status errado passaria a bloquear quem trabalha, então a lista de desligados com login foi conferida; em 15/10/2026 o dono do projeto confirmou que as 10 contas são de pessoas que realmente saíram. **Junto:** cargo ausente em `User.getAuthorities()` deixa de cair em `ROLE_DIRE`; um cargo novo esquecido no mapa ficaria com privilégio alto sem aviso, e agora fica sem nenhum. Ver [[voluntario-desligado-continuava-logando]].
- **M2, conteúdos trabalhados com publicação imediata.** Fica como está nesta versão. **Por quê:** o conteúdo é de sala ("trabalhamos frações"), e a aprovação prévia cria uma fila que tira a agilidade que justifica o recurso; o risco real é o professor citar o nome de uma criança, e isso já tem três freios (aviso na tela, remoção imediata e registro de autoria), com visibilidade só para as famílias da própria sala. **Reavaliar** após 30 dias de uso real ou no primeiro incidente.
- **B2, regra única de "falta justificada" (a implementar antes do módulo 20).** Uma falta é justificada se o registro é `FJ`, `J` ou `JUSTIFICADA`, ou se tem justificativa preenchida (a regra que o alerta de quatro faltas já usa). Fica num só lugar (`FrequenciaMesService`), Relatórios passa a consumir a mesma regra e um teste cruza as duas. **Por quê:** se a família vê "justificada" e a coordenação vê "falta", vira conflito e desconfiança; o módulo 20 passa a criar justificativas (estado novo, sem apagar o `F` original, decisão de 06/10). Não foi conferido como Relatórios classifica hoje; a conta pode estar no frontend.
- **B1, professores do painel filtrados pelo turno do aluno (decisão revista no mesmo dia).** A recomendação inicial era mostrar os professores da sala sem filtro, partindo de que o voluntário não guarda turno. Estava errada: o voluntário guarda a disponibilidade de segunda a sexta (`manha`, `tarde`, `integral` ou `nenhum`). Regra aceita pelo dono do projeto em 15/10/2026: o professor da sala aparece se algum dia for `integral` ou do turno do aluno; sem nenhuma informação de disponibilidade (vazia ou só `nenhum`) ou com turno do aluno desconhecido, ninguém é escondido. **Por quê:** a maioria dos alunos é da tarde (74 de 103 ativos em 14/10/2026), e sem filtro um professor só da manhã apareceria no painel da maioria; e 2 dos 6 professores ativos não tinham disponibilidade preenchida, então exigir o dado sumiria com eles. Implementação em `TurnoDoProfessor` (branch `feat/area-da-familia`). A administração deve preencher a disponibilidade dos professores para o filtro valer para todos.

## Consequências
- **Módulo 19 (identidade):** precisa de tela de cadastro de responsável para coordenação e
  administração (com vínculo ao(s) aluno(s)), no lugar de qualquer fluxo de autocadastro. Nenhuma rota
  pública de criação de conta de família.
- **Módulos 23, 31 e 32 (painel):** o 23 segue em 7 dias (resumo, professor por cruzamento,
  frequência, atividades e leitura dos conteúdos); foto e conteúdos trabalhados viram os habilitadores
  31 (2 dias) e 32 (4 dias), ver item 9. Foto de criança só sai por rota autenticada com vínculo ativo.
- **Módulo 24 (relatórios):** o relatório precisa de estado "aprovado" com autor e data da aprovação
  antes de aparecer à família, e não pode incluir a nota psicológica.
- **Módulo 29 (Transparência):** precisa de cadastro simples de números com período, fonte e aprovação
  pela administração; sem consulta agregada ao banco.
- **Módulo 14 (WhatsApp):** permanece na etapa 2 e sem prioridade; não iniciar até os três passos da
  Meta serem feitos.
- **O que NÃO fazer:** autocadastro de responsável; exibir nota psicológica à família ou a cargo que não
  seja `PSICO`/`COOR`; publicar número da Transparência sem aprovação; gravar o número de telefone do
  WhatsApp, ou qualquer dado pessoal, em arquivo versionado; pedir ao Instituto aceite de datas.
- **Fora do que foi decidido (pendente):** a exportação da frequência em Excel segue por "Visualizar
  Relatórios"; a decisão do Instituto sobre ela continua aberta.

## Ligado a
- [[entrega-em-duas-etapas-prazo-08-01-2027]]: atribuição dos prazos corrigida (item 8).
- [[dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica]]: extensão da regra da nota psicológica (item 7).
- [[rate-limit-apenas-solicitacao-cesta]]: o canal público de sugestões (módulo 30) segue precisando do mesmo padrão.
