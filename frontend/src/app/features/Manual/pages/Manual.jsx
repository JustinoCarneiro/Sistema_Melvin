import { useState } from 'react';
import styles from './Manual.module.scss';
import {
    FaUsersCog, FaUserCog, FaChild, FaChalkboardTeacher, FaCalendarCheck,
    FaBullhorn, FaHandshake, FaHeart, FaChartBar, FaShieldAlt, FaTools,
} from 'react-icons/fa';
import { IoBasket } from 'react-icons/io5';

import imgLogin from '../assets/login.png';
import imgDashboardAdm from '../assets/dashboard-adm.png';
import imgConfigPerfil from '../assets/config-perfil.png';
import imgConfigAdmin from '../assets/config-admin.png';
import imgPermissoes from '../assets/permissoes.png';
import imgCalendario from '../assets/calendario.png';
import imgAlunosLista from '../assets/alunos-lista.png';
import imgAlunoForm from '../assets/aluno-form.png';
import imgAlunoFrequencia from '../assets/aluno-frequencia.png';
import imgVoluntariosLista from '../assets/voluntarios-lista.png';
import imgVoluntarioForm from '../assets/voluntario-form.png';
import imgRelatorios from '../assets/relatorios.png';
import imgRendimento from '../assets/rendimento.png';
import imgCestasLista from '../assets/cestas-lista.png';
import imgCestasSolicitacoes from '../assets/cestas-solicitacoes.png';
import imgSolicitarCesta from '../assets/solicitarcesta-publico.png';
import imgAvisosLista from '../assets/avisos-lista.png';
import imgAvisoForm from '../assets/aviso-form.png';
import imgEmbaixadoresLista from '../assets/embaixadores-lista.png';
import imgAmigosMelvinLista from '../assets/amigosmelvin-lista.png';

const CARGOS = [
    { id: 'ADM', nome: 'Administrador (ADM)', resumo: 'Acesso total: todos os módulos operacionais, mais a área de Administração (arquivo morto), Permissões de Acesso e Calendário de Exceções — as duas únicas telas exclusivas do ADM.' },
    { id: 'DIRE', nome: 'Diretoria (DIRE)', resumo: 'Mesmo nível de acesso operacional do ADM (Alunos, Voluntários, Frequência, Rendimento, Relatórios, Cestas, Embaixadores, Amigos do Melvin), exceto Gerenciar Voluntários, Permissões de Acesso e Calendário de Exceções, que continuam exclusivos do ADM.' },
    { id: 'COOR', nome: 'Coordenação (COOR)', resumo: 'Alunos (visualizar, cadastrar e editar), Frequência, Rendimento, Relatórios e Registro de Ocorrências. Cestas, Embaixadores, Amigos do Melvin e Avisos dependem de permissão extra concedida pelo ADM.' },
    { id: 'PROF', nome: 'Professor (PROF)', resumo: 'Visualizar Alunos, fazer a chamada de frequência das próprias salas, registrar Ocorrências e ver Relatórios. Não cadastra nem edita o cadastro do aluno por padrão.' },
    { id: 'AUX', nome: 'Auxiliar (AUX)', resumo: 'Gerenciar Cestas Básicas (doações) por padrão. Acesso aos demais módulos depende de permissão concedida pelo ADM em Configurações → Permissões de Acesso.' },
    { id: 'PSICO', nome: 'Psicólogo (PSICO)', resumo: 'Visualizar Alunos e Relatórios; é o único cargo que edita a nota de Avaliação Psicológica na tela de Rendimento — os demais cargos veem esse campo apenas como leitura.' },
    { id: 'ASSIST', nome: 'Assistente (ASSIST)', resumo: 'Visualizar Alunos, Cadastrar/Editar Alunos e ver Relatórios.' },
    { id: 'COZI', nome: 'Cozinha (COZI)', resumo: 'Sem módulo operacional liberado por padrão. Acesso a qualquer módulo (ex.: Cestas) depende de o ADM conceder a permissão correspondente.' },
    { id: 'MARK', nome: 'Marketing (MARK)', resumo: 'Sem módulo operacional liberado por padrão. Acesso a Embaixadores, Amigos do Melvin ou Avisos, por exemplo, depende de permissão concedida pelo ADM.' },
    { id: 'ZELA', nome: 'Zeladoria (ZELA)', resumo: 'Sem módulo operacional liberado por padrão. Acesso depende de permissão concedida pelo ADM.' },
];

const SECOES = [
    {
        id: 'perfis',
        titulo: 'Perfis de Acesso',
        icone: <FaUsersCog />,
        quemUsa: 'Todos os cargos',
        resumo: 'O Sistema Melvin tem 10 cargos (roles). O que cada um vê no menu e pode fazer em cada tela depende de duas coisas: o cargo em si (algumas telas, como Permissões e Calendário de Exceções, são exclusivas de ADM) e das Permissões de Acesso configuráveis (tela em Configurações → Permissões de Acesso, só ADM), que definem quais cargos ativam cada funcionalidade dinâmica — como Gerenciar Cestas ou Editar Rendimento.',
        passos: [
            { texto: 'Todo cargo, ao entrar em Configurações, sempre vê seu próprio perfil e a Auto Frequência — isso não depende de nenhuma permissão, é igual para todo mundo.' },
            { texto: 'O que muda entre os cargos é o menu lateral (quais módulos aparecem) e quais botões de ação (Adicionar, Editar, Exportar...) ficam visíveis dentro de cada tela.' },
        ],
        tabelaCargos: true,
    },
    {
        id: 'login',
        titulo: 'Login e Acesso',
        icone: <FaUserCog />,
        quemUsa: 'Todos os cargos',
        resumo: 'Tela inicial do sistema. O acesso é sempre por matrícula (não por e-mail).',
        passos: [
            { texto: 'Acesse a "Área do voluntário" e informe sua Matrícula e Senha.', imagem: { src: imgLogin, legenda: 'Tela de login — acesso por matrícula e senha.' } },
            { texto: 'Se a matrícula ou a senha estiverem erradas, o sistema mostra "Matrícula ou senha inválida" — não avança para o dashboard.' },
            { texto: 'Esqueceu a senha? Não há redefinição automática por e-mail: procure um administrador para redefinir sua senha em Voluntários → editar seu cadastro → "Acesso ao Sistema" → "Redefinir Senha".' },
            { texto: 'Ao entrar, você é levado direto para o dashboard do seu cargo (ex.: um Professor vai para o dashboard de Professor).' },
        ],
    },
    {
        id: 'dashboard',
        titulo: 'Dashboard (Início)',
        icone: <FaChartBar />,
        quemUsa: 'Todos os cargos',
        resumo: 'Painel de leitura (sem formulários) com a visão geral do dia: frequência, avisos e destaques de alunos.',
        passos: [
            { texto: 'A tela é a mesma para todos os cargos — o que muda é a URL/atalho de cada um (ex.: /app/coor, /app/prof). Mostra Frequência do Dia por sala/turno, ranking de "Destaques" e "Atenção Necessária" (por média, presença, participação, comportamento, rendimento ou psicológico) e "Faltas Excessivas (Mês)".', imagem: { src: imgDashboardAdm, legenda: 'Dashboard — visão geral do instituto no dia.' } },
            { texto: 'Use o seletor no card "Destaques" para trocar o critério do ranking (Média Geral, Presença, Participação, Comportamento, Rendimento ou Psicológico).' },
        ],
    },
    {
        id: 'meu-perfil',
        titulo: 'Meu Perfil e Auto Frequência',
        icone: <FaCalendarCheck />,
        quemUsa: 'Todos os cargos',
        resumo: 'Tela de Configurações (menu → "Configurações"). Reúne seus dados cadastrais, o registro da sua própria presença do dia e, só para ADM, os atalhos administrativos do sistema — incluindo este Manual.',
        passos: [
            { texto: 'O card "Meu Perfil" mostra seus dados pessoais e institucionais (somente leitura) e os dias da semana em que você atua como voluntário (M = manhã, T = tarde).', imagem: { src: imgConfigPerfil, legenda: 'Configurações — Meu Perfil e Auto Frequência (visão de um Professor).' } },
            { texto: 'No card "Auto Frequência", selecione sua presença de Manhã e/ou Tarde (Presente / Falta / Falta Justificada / N/A), preencha a Justificativa se necessário, e clique em "Confirmar Presença". Pode ser refeito no mesmo dia — o sistema atualiza o registro em vez de duplicar.' },
            { texto: 'Se seu cargo for ADM, aparece também o card "Administração (Arquivo Morto)", com atalhos para os cadastros desativados de cada módulo e para as telas de Permissões de Acesso e Calendário de Exceções.', imagem: { src: imgConfigAdmin, legenda: 'Configurações — card de Administração, visível apenas para o cargo ADM.' } },
        ],
    },
    {
        id: 'alunos',
        titulo: 'Alunos',
        icone: <FaChild />,
        quemUsa: 'ADM, Diretoria, Coordenação, Professor, Assistente, Psicólogo (visualização); cadastro/edição por padrão em ADM, Coordenação, Diretoria e Assistente',
        resumo: 'Cadastro completo dos alunos do instituto, com dados pessoais, familiares, de saúde, diário de acompanhamento e ocorrências.',
        passos: [
            { texto: 'Em "Alunos", use a busca por nome/matrícula e os filtros de Turno e Sala/Oficina. O botão "Em espera" alterna entre a lista de matriculados e a fila de espera. Quem tem permissão de cadastro vê também "Exportar" (gera .xlsx) e "Adicionar Aluno".', imagem: { src: imgAlunosLista, legenda: 'Lista de Alunos, com filtros e ações no cabeçalho.' } },
            { texto: 'Um ícone de alerta ao lado do nome indica quantas faltas o aluno teve no mês — ajuda a identificar quem precisa de atenção antes de abrir o relatório completo.' },
            { texto: 'Ao abrir "Editar Aluno" (ou "Adicionar Aluno"), preencha os blocos Informações Pessoais, Informações Institucionais (situação da matrícula, sala, turno), Informações Familiares (pai, mãe e contexto familiar — inclui o e-mail do responsável usado no aviso automático de falta) e Outras Informações & Saúde. É possível anexar o "Diário de Acompanhamento" em PDF.', imagem: { src: imgAlunoForm, legenda: 'Formulário de Aluno — edição completa do cadastro.' } },
            { texto: 'Quem tem a permissão "Gerenciar Ocorrências" (por padrão: Professor, Coordenação, Diretoria e ADM) vê, ao final do formulário em modo edição, o bloco de Ocorrências: registra uma nova (categoria Comportamental ou Pedagógica + descrição + data) e consulta o histórico completo, do mais recente para o mais antigo.' },
            { texto: 'Para excluir um aluno, mude "Situação Matrícula" para "Deletar" e salve — os dados sensíveis (contato, saúde) são anonimizados de forma irreversível e o registro estatístico é preservado, conforme a LGPD.' },
        ],
    },
    {
        id: 'frequencia-alunos',
        titulo: 'Frequência de Alunos (Chamada)',
        icone: <FaCalendarCheck />,
        quemUsa: 'ADM, Diretoria, Coordenação, Professor (por padrão)',
        resumo: 'Chamada diária de presença por sala e turno.',
        passos: [
            { texto: 'Acesse pelo botão "Frequências" na lista de Alunos. Escolha a Data, o Turno e a Sala — para Professores e Auxiliares, a lista de salas já vem limitada às salas em que atuam.', imagem: { src: imgAlunoFrequencia, legenda: 'Chamada de frequência — presença por sala e turno.' } },
            { texto: 'Marque a Presença de cada aluno (Presente / Falta / Falta Justificada) e, se necessário, uma Justificativa, depois clique em "Salvar Chamada".' },
            { texto: 'Se um aluno for marcado com falta (manhã ou tarde) e tiver e-mail de responsável cadastrado, o sistema envia automaticamente um e-mail avisando a família no mesmo dia — sem nenhuma ação extra de quem faz a chamada.' },
        ],
    },
    {
        id: 'rendimento',
        titulo: 'Rendimento e Avaliações',
        icone: <FaChartBar />,
        quemUsa: 'Leitura: ADM, Diretoria, Coordenação, Professor, Assistente, Psicólogo. Edição de Rendimento: ADM/Diretoria/Coordenação (por padrão). Edição da Avaliação Psicológica: só Psicólogo.',
        resumo: 'Avaliação do aluno em 5 categorias, por estrelas de 1 a 5.',
        passos: [
            { texto: 'Acesse pelo ícone de estrela na lista de Alunos. Presença, Participação, Comportamento e Rendimento Escolar ficam editáveis para quem tem a permissão "Editar Rendimento"; a Avaliação Psicológica só é editável pelo cargo Psicólogo — para os demais aparece com o rótulo "Apenas Leitura".', imagem: { src: imgRendimento, legenda: 'Tela de Rendimento — avaliação por estrelas, com a Avaliação Psicológica somente leitura para quem não é Psicólogo.' } },
            { texto: 'Clique nas estrelas para pontuar cada categoria e finalize em "Salvar Avaliações". Cada bloco é salvo de forma independente: sem a permissão de um deles, o outro continua sendo atualizado normalmente.' },
        ],
    },
    {
        id: 'relatorios',
        titulo: 'Relatórios',
        icone: <FaChartBar />,
        quemUsa: 'ADM, Diretoria, Coordenação, Professor, Assistente, Psicólogo',
        resumo: 'Relatório de Desempenho (notas) e de Frequência mensal, com exportação em Excel.',
        passos: [
            { texto: 'Alterne entre as abas "Desempenho" e "Frequência" no topo da tela. Filtre por nome, Sala/Oficina e, na aba Frequência, por Mês e Ano.', imagem: { src: imgRelatorios, legenda: 'Relatórios — aba Desempenho, com filtros por sala e turno.' } },
            { texto: 'A aba Frequência mostra uma matriz com todos os dias do mês por aluno, já cruzando com o Calendário de Exceções (feriados/recessos não contam como falta).' },
            { texto: 'O botão "Exportar" (quando disponível para o seu cargo) baixa a planilha .xlsx equivalente ao que está sendo exibido na tela.' },
        ],
    },
    {
        id: 'voluntarios',
        titulo: 'Voluntários',
        icone: <FaChalkboardTeacher />,
        quemUsa: 'Todos os cargos de equipe (visualização); cadastro/edição/acesso ao sistema por padrão só em ADM',
        resumo: 'Cadastro da equipe de voluntários (professores, coordenação, auxiliares etc.) e da liberação de acesso ao sistema.',
        passos: [
            { texto: 'Na lista, filtre por Função e alterne "Em espera" para ver quem ainda não foi efetivado. O botão "Frequências" leva à chamada da função selecionada.', imagem: { src: imgVoluntariosLista, legenda: 'Lista de Voluntários, com filtro por função.' } },
            { texto: 'No formulário, preencha os dados pessoais, a Função, as salas atribuídas (Sala 1/Sala 2, para professores) e os Dias de Voluntariado (manhã/tarde/integral por dia da semana).', imagem: { src: imgVoluntarioForm, legenda: 'Formulário de Voluntário, incluindo o bloco "Acesso ao Sistema".' } },
            { texto: 'O bloco "Acesso ao Sistema", visível apenas a quem gerencia voluntários, cria a matrícula/senha de acesso ("Criar Acesso") ou redefine a senha de quem já tem login ("Redefinir Senha"). Trocar a Função aqui também atualiza o cargo (role) do usuário automaticamente.' },
        ],
    },
    {
        id: 'frequencia-voluntarios',
        titulo: 'Frequência de Voluntários',
        icone: <FaCalendarCheck />,
        quemUsa: 'ADM e Diretoria sempre; Coordenação para Professores/Auxiliares/Psicólogos/Assistentes',
        resumo: 'Chamada de presença da equipe, uma tela por função (Professores, Auxiliares, Coordenadores etc.), no mesmo padrão da chamada de Alunos.',
        passos: [
            { texto: 'Acesse pelo botão "Frequências" na lista de Voluntários (com uma função selecionada) ou pelo atalho da função específica. Escolha a data, marque Presença de Manhã e de Tarde para cada voluntário e clique em "Salvar Chamada".' },
        ],
    },
    {
        id: 'cestas',
        titulo: 'Cestas Básicas e Doações',
        icone: <IoBasket />,
        quemUsa: 'ADM, Diretoria, Auxiliar (por padrão)',
        resumo: 'Controle do fluxo de doações (entradas e saídas) e o processo completo de solicitação de cesta por líderes da igreja, com agendamento e confirmação de entrega.',
        passos: [
            { texto: 'A tela "Fluxo de Doações" mostra o total arrecadado, entregue e o saldo em estoque, com filtros por Operação (Entrada/Saída), Tipo e Data. O botão "Solicitações" leva à fila de pedidos recebidos pelo formulário público.', imagem: { src: imgCestasLista, legenda: 'Fluxo de Doações — entradas, saídas e saldo em estoque.' } },
            { texto: 'Qualquer líder da hierarquia da igreja (célula, setor, área, distrito ou rede) pode solicitar uma cesta para um membro de célula pelo link público /solicitarcesta, sem precisar de login.', imagem: { src: imgSolicitarCesta, legenda: 'Formulário público de solicitação de cesta — sem necessidade de login.' } },
            { texto: 'Em "Solicitações de Cestas", a coordenação valida cada pedido definindo a Data de Retirada ("Validar") — o pedido passa para "Aguardando retirada" e, se o solicitante informou e-mail, ele já recebe automaticamente o QR Code de retirada por e-mail.', imagem: { src: imgCestasSolicitacoes, legenda: 'Solicitações de Cestas — validação, QR Code e confirmação de entrega.' } },
            { texto: 'Na retirada, confirme a entrega de duas formas: o caminho principal é escanear (ou colar o texto) do QR Code em "Confirmar entrega via QR Code"; se o QR Code não estiver disponível, use "Confirmar Entrega" por nome, na lista de "Aguardando retirada" — esse caminho alternativo nunca fica bloqueado.' },
            { texto: 'Uma cesta já confirmada como entregue não pode ser confirmada de novo (nem por QR Code, nem manualmente) — o sistema recusa e mostra quando ela já foi entregue, evitando dupla contagem.' },
        ],
    },
    {
        id: 'avisos',
        titulo: 'Avisos',
        icone: <FaBullhorn />,
        quemUsa: 'ADM (por padrão)',
        resumo: 'Comunicados internos exibidos no Dashboard de todos os usuários enquanto estiverem no período de vigência.',
        passos: [
            { texto: 'Em "Avisos", veja os avisos cadastrados e use "Criar Aviso" para um novo, ou o ícone de edição para alterar um existente.', imagem: { src: imgAvisosLista, legenda: 'Lista de Avisos.' } },
            { texto: 'Preencha Título, Descrição, Data de Início, Data de Término e Status (Ativo/Inativo), depois "Salvar Aviso". Só avisos com Status "Ativo" e dentro do período aparecem no Dashboard.', imagem: { src: imgAvisoForm, legenda: 'Formulário de novo Aviso.' } },
        ],
    },
    {
        id: 'embaixadores',
        titulo: 'Embaixadores',
        icone: <FaHandshake />,
        quemUsa: 'ADM e Diretoria (por padrão)',
        resumo: 'Cadastro dos embaixadores/parceiros que aparecem na página pública do site institucional.',
        passos: [
            { texto: 'A lista mostra Nome, Instagram, Contato e Email; o ícone de edição abre o cadastro completo.', imagem: { src: imgEmbaixadoresLista, legenda: 'Lista de Embaixadores.' } },
            { texto: 'No formulário, edite os dados, a foto (arraste ou clique para enviar) e o Status (Ativo/Inativo — só embaixadores ativos aparecem no site).' },
        ],
    },
    {
        id: 'amigos-melvin',
        titulo: 'Amigos do Melvin (Doações Recorrentes)',
        icone: <FaHeart />,
        quemUsa: 'ADM e Diretoria (por padrão)',
        resumo: 'Gestão dos apoiadores com assinatura mensal via Stripe — cadastro, doação única e de itens são feitos pelo doador no site público; aqui a equipe acompanha e administra.',
        passos: [
            { texto: 'A lista mostra cada doador com email, CPF, valor mensal, dia preferido, status da assinatura (Ativo/Pendente/Cancelado) e meses de contribuição — o ícone de presente indica marcos de recompensa (3, 6 ou 12 meses).', imagem: { src: imgAmigosMelvinLista, legenda: 'Gestão de Amigos do Melvin.' } },
            { texto: 'Ao editar um doador, a maior parte dos dados é somente leitura (vêm do Stripe); o CPF pode ser corrigido manualmente. "Cancelar Assinatura no Stripe" encerra a cobrança recorrente tanto no Stripe quanto no sistema, e dispara um e-mail de encerramento ao doador.' },
        ],
    },
    {
        id: 'permissoes',
        titulo: 'Permissões de Acesso',
        icone: <FaShieldAlt />,
        quemUsa: 'Exclusivo do ADM',
        resumo: 'Painel central de RBAC dinâmico: define, por funcionalidade, quais cargos têm acesso — sem precisar mexer em código.',
        passos: [
            { texto: 'Cada linha é uma funcionalidade (ex.: "Gerenciar Cestas Básicas") e cada coluna um cargo. Marque ou desmarque a caixa para liberar ou revogar o acesso daquele cargo àquela funcionalidade.', imagem: { src: imgPermissoes, legenda: 'Configurações de Permissões — matriz funcionalidade × cargo.' } },
            { texto: 'Clique em "Salvar Alterações" para aplicar. A mudança vale tanto para o que aparece no menu de cada cargo quanto para a validação no servidor — não é só uma questão visual.' },
        ],
    },
    {
        id: 'administracao',
        titulo: 'Administração (Arquivo Morto e Calendário)',
        icone: <FaTools />,
        quemUsa: 'Exclusivo do ADM',
        resumo: 'Atalhos para os cadastros desativados de cada módulo e para o calendário de dias não letivos, dentro de Configurações.',
        passos: [
            { texto: 'Os botões "Alunos Desativados", "Voluntários Desativados", "Embaixadores", "Amigos Melvin" e "Avisos" abrem a listagem de registros inativos de cada módulo (ver card de Administração na seção "Meu Perfil e Auto Frequência" acima).' },
            { texto: 'Em "Calendário de Exceções", cadastre feriados e recessos (Data + Descrição): esses dias deixam de contar como falta nos relatórios de frequência.', imagem: { src: imgCalendario, legenda: 'Calendário de Exceções — feriados e recessos que não contam como falta.' } },
        ],
    },
];

function Manual() {
    const [ativa, setAtiva] = useState(SECOES[0].id);
    const secao = SECOES.find((s) => s.id === ativa);

    return (
        <div className={styles.body}>
            <div className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Manual do Sistema</h1>
                <p className={styles.pageSubtitle}>
                    Guia de uso do Sistema Melvin, organizado por funcionalidade. Cada seção explica quem pode
                    usar o quê e traz o passo a passo com prints reais das telas.
                </p>

                <div className={styles.layout}>
                    <nav className={styles.nav}>
                        {SECOES.map((s) => (
                            <button
                                key={s.id}
                                className={`${styles.navItem} ${ativa === s.id ? styles.navItemActive : ''}`}
                                onClick={() => setAtiva(s.id)}
                                type="button"
                            >
                                <span className={styles.navIcon}>{s.icone}</span>
                                {s.titulo}
                            </button>
                        ))}
                    </nav>

                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.icon}>{secao.icone}</span>
                            <div>
                                <h2>{secao.titulo}</h2>
                                <span className={styles.quemUsa}>Quem usa: {secao.quemUsa}</span>
                            </div>
                        </div>

                        <p className={styles.resumo}>{secao.resumo}</p>

                        {secao.tabelaCargos && (
                            <div className={styles.tabelaCargos}>
                                {CARGOS.map((c) => (
                                    <div key={c.id} className={styles.cargoRow}>
                                        <span className={styles.cargoNome}>{c.nome}</span>
                                        <span className={styles.cargoResumo}>{c.resumo}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <ol className={styles.passos}>
                            {secao.passos.map((p, idx) => (
                                <li key={idx} className={styles.passo}>
                                    <p>{p.texto}</p>
                                    {p.imagem && (
                                        <figure className={styles.figura}>
                                            <img src={p.imagem.src} alt={p.imagem.legenda} loading="lazy" />
                                            <figcaption>{p.imagem.legenda}</figcaption>
                                        </figure>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Manual;
