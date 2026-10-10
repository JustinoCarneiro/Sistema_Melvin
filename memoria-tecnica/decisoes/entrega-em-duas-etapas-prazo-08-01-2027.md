---
tipo: decisao
data: 2026-10-08
status: Ativa
---

# Entrega em duas etapas: núcleo até 08/01/2027, restante até 19/02/2027

## Contexto
Em 08/10/2026 o Instituto fixou 08/01/2027 como prazo máximo para todo o escopo aberto: as 16
histórias novas do site (US-10.3 a US-10.18), as 8 da Área da Família (US-13.1 a US-13.8), a US-5.6
(WhatsApp) e o fechamento do cancelamento de cestas (US-7.4). A capacidade é uma pessoa conduzindo
o desenvolvimento com agentes de IA.

Aplicada ao pé da letra, a fórmula do playbook OndaDev 3.0 (seção 7: Fase 2 + soma dos módulos no
limite superior do peso + 2 dias de Fase 5) dá **85 dias úteis** para esse escopo, contra **59**
disponíveis de 09/10/2026 a 08/01/2027. Término calculado: 17/02/2027, déficit de 26 dias úteis.
Agentes de IA não entram como capacidade extra e não se soma reserva por cima, porque o método já
assume desenvolvedor solo com agentes.

A conta completa está na seção "Evolução 08/10/2026" do `ROADMAP.md`. Esta nota guarda só a decisão
de ordem, porque o `ROADMAP.md` é reescrito com frequência por outras sessões.

## Decisão
O dono do projeto decidiu em 08/10/2026 executar em duas etapas, por prioridade e dependência, em
vez de prometer o escopo inteiro para 08/01.

**Etapa 1, o núcleo: 52 dias úteis, termina em 28/12/2026 e deixa 7 dias úteis de folga até
08/01/2027.** Soma Fase 2 (2), revisão e validação do cancelamento de cestas (1), Fase 5 (2) e
estes módulos (47):
- 18 Revisão de fronteiras de acesso e regressões de segurança (7), antecipado porque não depende do portal;
- 19 Identidade e vínculo de responsáveis (7);
- 20 Comunicação da família, faltas e contatos (7);
- 21 Documentos da família e autorização de passeio (7);
- 22 Avisos direcionados (4);
- 23 Painel e acompanhamento do aluno (7);
- 27 Navegação e páginas institucionais (4);
- 30 Canal público de sugestões e reclamações (4).

**Etapa 2, o restante: 33 dias úteis de módulos + 2 dias de homologação, com conclusão prevista em 19/02/2027:**
- 14 Notificação de falta via WhatsApp (4);
- 24 Relatórios de desenvolvimento (4);
- 25 Agenda institucional, rotina e cardápio (7);
- 26 Agenda da família (4);
- 28 Espaços, equipe, notícias e consentimento de imagem (7);
- 29 Transparência, prestação de contas e documentos públicos (7).

Critério da divisão: o núcleo é o que destrava a Área da Família (a identidade do módulo 19 vem
antes de qualquer rota de família, e os módulos 18 e 19, de maior risco, abrem a Fase 4 pela regra
"o coração entra cedo"), mais o menu e o canal de sugestões, que respondem direto ao pedido da
cliente. A etapa 2 junta o que depende de conteúdo e rotina editorial do Instituto (agenda,
cardápio, notícias, indicadores e relatórios pedagógicos precisam de alguém mantendo toda semana),
de fornecedor externo (WhatsApp: provedor e aprovação de template; já era backlog não priorizado
pela cliente em 11/08/2026) ou de outro módulo (a agenda da família, 26, depende da institucional, 25).

**Isto ainda não é compromisso com o Instituto.** A ordem está decidida internamente; o prazo da
etapa 2 (19/02/2027, incluindo sua homologação) precisa ser apresentado ao Instituto e aceito por ele. Se o Instituto exigir
tudo em 08/01, o caminho é aumentar a capacidade humana ou cortar pelo menos 26 dias úteis de
escopo. Por exemplo, tirar os módulos 14, 24, 25, 26 e um entre 28 e 29 fecha exatamente 59 dias,
sem nenhuma folga.

## Consequências
- **Menu da etapa 1.** A US-10.3 lista itens cujas páginas ficam na etapa 2 (Nossos Espaços e
  Equipe no módulo 28, Agenda no 25, Transparência no 29). Na etapa 1 o menu só pode mostrar itens
  com página pronta, ou marcar os demais como "em breve"; decidir isso no protótipo da Fase 2 e
  submeter ao Instituto. O botão "Doar" mantém o destaque atual em qualquer cenário.
- **Painel da família.** A US-13.2 prevê atalhos para Professores, Diretoria, Secretaria, Projetos
  e Nossos Espaços; os que dependem de páginas da etapa 2 (Equipe, Nossos Espaços) entram só depois.
- **Duas homologações.** Uma Fase 5 por etapa acrescenta 2 dias à linha de base de 85 dias:
  87 dias no total, término em 19/02/2027 em vez de 17/02.
- **A folga de 7 dias é a única margem.** Não é reserva da fórmula; é a diferença entre a janela e
  o núcleo. O que mais provavelmente a consome é o módulo 23: o cadastro atual não tem foto do
  aluno, professor nem "conteúdos trabalhados" (gate 6 do `ROADMAP.md`), e captura nova de dados
  estoura os 7 dias do módulo. Atraso do Instituto na entrega de conteúdo e no aceite também a consome.
- **Revisão dos pesos.** Ao concluir os módulos 18 e 19 (14 dias de peso), comparar os dias reais
  com o peso usando o timesheet de `docs/METRICAS-PROJETO.md`. Se o ritmo real divergir, recalcular
  e renegociar a data da etapa 2, e não absorver o desvio em silêncio.
- **O módulo 18 não espera o portal.** Trata de rotas públicas já existentes e segue como correção
  separada e antecipada (R2, com TDD). O 1º lote foi publicado em 10/10/2026; o restante segue
  pendente, com os detalhes fora do repositório público até a correção.
- A numeração dos módulos é a do `ROADMAP.md` em 08/10/2026. Se ele for renumerado, valem os nomes
  desta nota.

## Ligado a
- [[rate-limit-apenas-solicitacao-cesta]]: o módulo 30 precisa do mesmo padrão de rate limit desde o primeiro dia.
- [[dashboard-ranking-sem-restricao-de-papel-expoe-avaliacao-psicologica]]: a avaliação psicológica não pode chegar à família (módulo 23).
