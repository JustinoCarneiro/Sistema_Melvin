// Ferramenta de geração de assets do Manual do Sistema (não faz parte da suíte de testes).
// Sobe o vite dev server local, injeta cookies de autenticação e mocka as respostas de API
// (mesmo mecanismo de tests/fixtures.js) pra capturar prints reais das telas com dados
// fictícios de exemplo — sem depender de backend/Postgres rodando e sem expor dado real.
//
// Uso: node scripts/capture-manual-screenshots.mjs

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src/app/features/Manual/assets');
const PORT = 5183;
const BASE = `http://localhost:${PORT}`;
const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSJ9.fake_signature_manual_screenshots';

fs.mkdirSync(OUT_DIR, { recursive: true });

// --- Dados fictícios de exemplo (nenhum dado real de aluno/voluntário/doador) ---

const ALUNOS = [
    { matricula: '2026012', nome: 'Beatriz Souza Lima', nome_pai: 'Carlos Souza', nome_mae: 'Marta Lima', status: 'true', sala: 1, turno: 'MANHA', ingles: true, karate: false, informatica: true, musica: false, teatro: false, ballet: true, futsal: false, artesanato: false },
    { matricula: '2026013', nome: 'Gabriel Oliveira Santos', nome_pai: 'Roberto Santos', nome_mae: 'Fernanda Oliveira', status: 'true', sala: 2, turno: 'TARDE', ingles: false, karate: true, informatica: false, musica: true, teatro: false, ballet: false, futsal: true, artesanato: false },
    { matricula: '2026014', nome: 'Larissa Costa Almeida', nome_pai: 'Paulo Almeida', nome_mae: 'Juliana Costa', status: 'true', sala: 1, turno: 'MANHA', ingles: true, karate: false, informatica: true, musica: false, teatro: true, ballet: false, futsal: false, artesanato: true },
    { matricula: '2026015', nome: 'Pedro Henrique Ferreira', nome_pai: 'Marcos Ferreira', nome_mae: 'Renata Silva', status: 'true', sala: 3, turno: 'MANHA', ingles: false, karate: false, informatica: false, musica: false, teatro: false, ballet: false, futsal: true, artesanato: false },
    { matricula: '2026016', nome: 'Yasmin Rodrigues Pinto', nome_pai: 'André Pinto', nome_mae: 'Camila Rodrigues', status: 'true', sala: 2, turno: 'TARDE', ingles: true, karate: false, informatica: false, musica: true, teatro: false, ballet: true, futsal: false, artesanato: false },
];

const ALUNO_DETALHE = {
    matricula: '2026012', nome: 'Beatriz Souza Lima', contato: '(11) 98888-1234', data: '2016-04-12',
    endereco: 'Rua das Flores, 120', bairro: 'Jardim Esperança', cidade: 'São Paulo', sexo: 'FEMININO',
    email: 'contato.exemplo@email.com', status: true, sala: 1, turno: 'MANHA',
    nome_pai: 'Carlos Souza', nome_mae: 'Marta Lima', contato_pai: '(11) 98888-1234', contato_mae: '(11) 97777-4321',
    contato_saida: 'Marta Lima (mãe)', email_responsavel: 'responsavel.exemplo@email.com',
    ingles: true, karate: false, informatica: true, musica: false, teatro: false, ballet: true, futsal: false, artesanato: false,
    avaliacaoRendimento: 4.5, avaliacaoPsicologico: 3.5,
};

const ALERTAS_FALTAS = [{ matricula: '2026015', quantidade: 4 }];

const OCORRENCIAS = [
    { id: 'a1', categoria: 'PEDAGOGICA', descricao: 'Apresentou dificuldade na atividade de leitura desta semana; combinado reforço com a professora.', autor_login: '2024001', data_ocorrencia: '2026-08-18' },
    { id: 'a2', categoria: 'COMPORTAMENTAL', descricao: 'Ótima participação e colaboração durante a atividade em grupo.', autor_login: '2024001', data_ocorrencia: '2026-08-11' },
];

const VOLUNTARIOS = [
    { matricula: '2024001', nome: 'Ana Paula Ribeiro', funcao: 'coordenador', email: 'ana.exemplo@institutomelvin.org', status: 'true' },
    { matricula: '2024002', nome: 'Marcos Vinícius Teixeira', funcao: 'professor', email: 'marcos.exemplo@institutomelvin.org', status: 'true' },
    { matricula: '2024003', nome: 'Juliana Martins Costa', funcao: 'psicologo', email: 'juliana.exemplo@institutomelvin.org', status: 'true' },
    { matricula: '2024004', nome: 'Rafael Nogueira Alves', funcao: 'auxiliar', email: 'rafael.exemplo@institutomelvin.org', status: 'true' },
];

const VOLUNTARIO_DETALHE = {
    matricula: '2024002', nome: 'Marcos Vinícius Teixeira', contato: '(11) 99999-2222', data: '1990-02-20',
    endereco: 'Av. Central, 500', bairro: 'Centro', cidade: 'São Paulo', sexo: 'MASCULINO', email: 'marcos.exemplo@institutomelvin.org',
    status: true, funcao: 'professor', sala1: 2, sala2: null,
    segunda: 'manha', terca: 'manha', quarta: 'integral', quinta: 'manha', sexta: 'nenhum',
};

const FREQUENCIA_VOLUNTARIO_HOJE = { presenca_manha: 'P', presenca_tarde: '', justificativa: '' };

const AVISOS = [
    { id: 'v1', titulo: 'Reunião pedagógica mensal', corpo: 'Reunião de alinhamento pedagógico na próxima sexta-feira, às 17h, na sala de professores.', status: true, data_inicio: '2026-08-20', data_final: '2026-08-29' },
    { id: 'v2', titulo: 'Campanha do agasalho', corpo: 'Doações de roupas de frio podem ser entregues na secretaria até o fim do mês.', status: true, data_inicio: '2026-08-01', data_final: '2026-08-31' },
    { id: 'v3', titulo: 'Recesso — feriado municipal', corpo: 'Não haverá atividades no dia 15/08 (feriado municipal).', status: false, data_inicio: '2026-08-10', data_final: '2026-08-15' },
];

const EMBAIXADORES = [
    { id: 'e1', nome: 'Camila Duarte', instagram: '@camila.exemplo', contato: '(11) 98765-0001', email: 'camila.exemplo@email.com', status: true },
    { id: 'e2', nome: 'Fernando Braga', instagram: '@fernando.exemplo', contato: '(11) 98765-0002', email: 'fernando.exemplo@email.com', status: true },
];

const AMIGOS_MELVIN = [
    { id: 'd1', nome: 'Mariana Alves Pereira', contato: '(11) 98765-1111', email: 'mariana.exemplo@email.com', valorMensal: 50.0, status: 'ACTIVE', mesesContribuindo: 6, dataInicio: '2026-02-01T10:00:00', diaPreferido: '10', mensagem: 'Feliz em ajudar o Instituto!' },
    { id: 'd2', nome: 'Ricardo Nunes Barbosa', contato: '(11) 98765-2222', email: 'ricardo.exemplo@email.com', valorMensal: 100.0, status: 'ACTIVE', mesesContribuindo: 12, dataInicio: '2025-08-01T10:00:00', diaPreferido: '5', mensagem: '' },
    { id: 'd3', nome: 'Patrícia Gomes Rocha', contato: '(11) 98765-3333', email: 'patricia.exemplo@email.com', valorMensal: 30.0, status: 'PENDING', mesesContribuindo: 0, dataInicio: '2026-08-15T10:00:00', diaPreferido: '15', mensagem: '' },
    { id: 'd4', nome: 'Eduardo Lima Cardoso', contato: '(11) 98765-4444', email: 'eduardo.exemplo@email.com', valorMensal: 50.0, status: 'INACTIVE', mesesContribuindo: 3, dataInicio: '2026-05-01T10:00:00', diaPreferido: '20', mensagem: '' },
];

const CESTAS = [
    { id: 'c1', operacao: 'ENTRADA', nome: '', rede: 'Rede Central', tipo: 'ALIMENTO', peso: '35', dataEntrega: '2026-08-20', responsavel: 'Ana Paula Ribeiro', lider_celula: '', pastor_rede: 'Pastor Emerson', itens_doados: 'Cestas básicas variadas', frequencia: '', voluntario: false, cpf: '', contato: '' },
    { id: 'c2', operacao: 'SAIDA', nome: 'Beneficiário Exemplo 1', rede: 'Rede Central', tipo: 'ALIMENTO', peso: '8', dataEntrega: '2026-08-22', responsavel: 'Rafael Nogueira Alves', lider_celula: 'Célula Vida Nova', pastor_rede: '', itens_doados: 'Cesta básica', frequencia: 'AVULSA', voluntario: false, cpf: '111.111.111-11', contato: '(11) 90000-0001' },
    { id: 'c3', operacao: 'SAIDA', nome: 'Beneficiário Exemplo 2', rede: 'Rede Sul', tipo: 'VESTUARIO', peso: '5', dataEntrega: '2026-08-18', responsavel: 'Ana Paula Ribeiro', lider_celula: 'Célula Esperança', pastor_rede: '', itens_doados: 'Roupas de frio', frequencia: 'RECORRENTE', voluntario: true, cpf: '222.222.222-22', contato: '(11) 90000-0002' },
];

const CESTAS_SOLICITACOES_PENDENTES = [
    { id: 's1', nomeSolicitante: 'Roberto Lima (Supervisor)', nivelSolicitante: 'SETOR', nome: 'Beneficiário Exemplo 3', lider_celula: 'Célula Renovo', rede: 'Rede Central' },
    { id: 's2', nomeSolicitante: 'Simone Alves (Líder de Célula)', nivelSolicitante: 'CELULA', nome: 'Beneficiário Exemplo 4', lider_celula: 'Célula Restauração', rede: 'Rede Sul' },
];

const CESTAS_SOLICITACOES_AGENDADAS = [
    { id: 's3', nomeSolicitante: 'Marcelo Souza (Líder de Área)', nivelSolicitante: 'AREA', nome: 'Beneficiário Exemplo 5', lider_celula: 'Célula Vida Nova', rede: 'Rede Central', dataRetirada: '2026-08-29' },
];

const PERMISSOES = [
    { nomeRegra: 'VISUALIZAR_ALUNOS', rolesPermitidas: ['ADM', 'DIRE', 'COOR', 'PROF', 'ASSIST', 'PSICO'] },
    { nomeRegra: 'CADASTRAR_ALUNO', rolesPermitidas: ['ADM', 'COOR', 'DIRE', 'ASSIST'] },
    { nomeRegra: 'GERENCIAR_FREQUENCIA', rolesPermitidas: ['ADM', 'DIRE', 'COOR', 'PROF'] },
    { nomeRegra: 'EDITAR_RENDIMENTO', rolesPermitidas: ['ADM', 'DIRE', 'COOR'] },
    { nomeRegra: 'EDITAR_AVALIACAO_PSICO', rolesPermitidas: ['PSICO'] },
    { nomeRegra: 'GERENCIAR_VOLUNTARIOS', rolesPermitidas: ['ADM'] },
    { nomeRegra: 'GERENCIAR_CESTAS', rolesPermitidas: ['ADM', 'DIRE', 'AUX'] },
    { nomeRegra: 'GERENCIAR_EMBAIXADORES', rolesPermitidas: ['ADM', 'DIRE'] },
    { nomeRegra: 'GERENCIAR_AMIGOS', rolesPermitidas: ['ADM', 'DIRE'] },
    { nomeRegra: 'GERENCIAR_AVISOS', rolesPermitidas: ['ADM'] },
    { nomeRegra: 'VISUALIZAR_RELATORIOS', rolesPermitidas: ['ADM', 'DIRE', 'COOR', 'PROF', 'ASSIST', 'PSICO'] },
];

const DIAS_NAO_LETIVOS = [
    { id: 'f1', data: '2026-09-07', descricao: 'Feriado Nacional — Independência' },
    { id: 'f2', data: '2026-10-12', descricao: 'Feriado Nacional — Nossa Senhora Aparecida' },
];

const OCORRENCIAS_TECNICAS = [
    { id: 't1', titulo: 'Hash Argon2 corrompido via SSH', categoria: 'BUG', severidade: 'ALTA', descricao: 'O $ do formato Argon2 foi expandido pelo shell remoto ao passar por ssh com aspas duplas, corrompendo o hash gravado no banco.', resolvido: true, autorLogin: '2026009', dataOcorrencia: '2026-08-27' },
    { id: 't2', titulo: 'Mock de aviso interceptando asset de imagem', categoria: 'BUG', severidade: 'MEDIA', descricao: 'Glob amplo "**/aviso*" casava por acidente com o import de PNG do Manual, quebrando o carregamento do módulo.', resolvido: true, autorLogin: '2026009', dataOcorrencia: '2026-08-26' },
    { id: 't3', titulo: 'Revisão de logs pós-deploy do Módulo 16', categoria: 'MANUTENCAO', severidade: 'BAIXA', descricao: 'Conferência dos logs do backend após o deploy da migration V17 — nenhum erro encontrado.', resolvido: false, autorLogin: '2026009', dataOcorrencia: '2026-08-28' },
];

const RANKING = [
    { matricula: '2026012', nome: 'Beatriz Souza Lima', media: 4.8 },
    { matricula: '2026014', nome: 'Larissa Costa Almeida', media: 4.6 },
    { matricula: '2026016', nome: 'Yasmin Rodrigues Pinto', media: 4.5 },
];

// --- Helpers de mock ---

function json(body) {
    return { status: 200, contentType: 'application/json', body: JSON.stringify(body) };
}

// Qualquer requisição de módulo/asset do próprio Vite (inclusive os prints do Manual,
// que moram em /src/app/features/Manual/assets/*.png e podem casar por acidente com
// globs largos como "**/aviso*") tem que passar direto — nunca ser respondida como mock de API.
const ASSET_OU_MODULO = /\/src\/|\/node_modules\/|\/@vite\/|\/@react-refresh|\?import|\.(jsx?|mjs|css|scss|png|jpe?g|svg|gif|ico|webp)(\?|$)/;

async function mock(page, glob, response) {
    await page.route(glob, (route) => {
        if (ASSET_OU_MODULO.test(route.request().url())) return route.continue();
        route.fulfill(typeof response === 'function' ? response(route) : response);
    });
}

async function applyDefaultMocks(page, role) {
    const permissoesPorRole = {
        ADM: ['VISUALIZAR_ALUNOS', 'CADASTRAR_ALUNO', 'GERENCIAR_FREQUENCIA', 'EDITAR_RENDIMENTO', 'GERENCIAR_VOLUNTARIOS', 'GERENCIAR_CESTAS', 'GERENCIAR_EMBAIXADORES', 'GERENCIAR_AMIGOS', 'GERENCIAR_AVISOS', 'VISUALIZAR_RELATORIOS', 'GERENCIAR_OCORRENCIA'],
        COOR: ['VISUALIZAR_ALUNOS', 'CADASTRAR_ALUNO', 'GERENCIAR_FREQUENCIA', 'EDITAR_RENDIMENTO', 'VISUALIZAR_RELATORIOS', 'GERENCIAR_OCORRENCIA'],
        PROF: ['VISUALIZAR_ALUNOS', 'GERENCIAR_FREQUENCIA', 'VISUALIZAR_RELATORIOS', 'GERENCIAR_OCORRENCIA'],
        AUX: ['GERENCIAR_CESTAS'],
        PSICO: ['VISUALIZAR_ALUNOS', 'EDITAR_AVALIACAO_PSICO', 'VISUALIZAR_RELATORIOS'],
        ASSIST: ['VISUALIZAR_ALUNOS', 'CADASTRAR_ALUNO', 'VISUALIZAR_RELATORIOS'],
        DIRE: ['VISUALIZAR_ALUNOS', 'GERENCIAR_FREQUENCIA', 'EDITAR_RENDIMENTO', 'GERENCIAR_CESTAS', 'GERENCIAR_EMBAIXADORES', 'GERENCIAR_AMIGOS', 'VISUALIZAR_RELATORIOS', 'GERENCIAR_OCORRENCIA'],
        TECH: [], // TECH faz bypass total em hasPermission() no frontend, não depende de regra dinâmica
        MARK: [], COZI: [], ZELA: [],
    };

    await page.route('https://maps.googleapis.com/**', (route) => route.fulfill({ status: 200, body: '' }));
    await mock(page, '**/auth/role_*', { status: 200, body: role });
    await mock(page, '**/permissoes/minhas*', json(permissoesPorRole[role] || []));
    await mock(page, '**/permissoes', json(PERMISSOES));
    await mock(page, '**/voluntario/matricula/*', json(VOLUNTARIO_DETALHE));
    await mock(page, '**/voluntario/nomesfuncoes*', json(VOLUNTARIOS.map(({ nome, funcao }) => ({ nome, funcao }))));
    await mock(page, '**/voluntario*', json(VOLUNTARIOS));
    await mock(page, '**/discente/matricula/*', json(ALUNO_DETALHE));
    await mock(page, '**/discente/*/avaliacoes', json({}));
    await mock(page, '**/discente*', json(ALUNOS));
    await mock(page, '**/frequenciadiscente/alertas-faltas*', json(ALERTAS_FALTAS));
    await mock(page, '**/frequenciadiscente*', json([]));
    await mock(page, '**/frequenciavoluntario*', json(FREQUENCIA_VOLUNTARIO_HOJE));
    await mock(page, '**/dashboard/avisos*', json(AVISOS.filter(a => a.status)));
    await mock(page, '**/dashboard/ranking*', json(RANKING));
    await mock(page, '**/dashboard/presentes*', json({ presentes: 38 }));
    await mock(page, '**/aviso*', json(AVISOS));
    await mock(page, '**/embaixador*', json(EMBAIXADORES));
    await mock(page, '**/amigomelvin*', json(AMIGOS_MELVIN));
    await mock(page, '**/cestas/solicitacoes/agendadas*', json(CESTAS_SOLICITACOES_AGENDADAS));
    await mock(page, '**/cestas/solicitacoes*', json(CESTAS_SOLICITACOES_PENDENTES));
    await mock(page, '**/cestas*', json(CESTAS));
    await mock(page, '**/ocorrencias/discente/*', json(OCORRENCIAS));
    await mock(page, '**/diarios/captura/*', { status: 404, body: '' });
    await mock(page, '**/imagens/captura/*', { status: 404, body: '' });
    await mock(page, '**/dias-nao-letivos*', json(DIAS_NAO_LETIVOS));
    await mock(page, '**/ocorrencias-tecnicas*', json(OCORRENCIAS_TECNICAS));
}

// --- Lista de capturas ---

const SHOTS = [
    { file: 'login.png', path: '/#/login', public: true },
    { file: 'dashboard-adm.png', path: '/#/app/adm', role: 'ADM' },
    { file: 'config-perfil.png', path: '/#/app/config', role: 'PROF' },
    { file: 'config-admin.png', path: '/#/app/config', role: 'ADM' },
    { file: 'permissoes.png', path: '/#/app/config/permissoes', role: 'ADM' },
    { file: 'calendario.png', path: '/#/app/config/calendario', role: 'ADM' },
    { file: 'alunos-lista.png', path: '/#/app/alunos', role: 'COOR' },
    { file: 'aluno-form.png', path: '/#/app/aluno/editar/2026012', role: 'COOR' },
    { file: 'aluno-frequencia.png', path: '/#/app/frequencias/alunos', role: 'PROF' },
    { file: 'voluntarios-lista.png', path: '/#/app/voluntarios', role: 'ADM' },
    { file: 'voluntario-form.png', path: '/#/app/voluntario/editar/2024002', role: 'ADM' },
    { file: 'relatorios.png', path: '/#/app/relatorios', role: 'COOR' },
    { file: 'rendimento.png', path: '/#/app/rendimento_aluno/2026012', role: 'COOR' },
    { file: 'cestas-lista.png', path: '/#/app/cestas', role: 'AUX' },
    { file: 'cestas-solicitacoes.png', path: '/#/app/cestas/solicitacoes', role: 'AUX' },
    { file: 'solicitarcesta-publico.png', path: '/solicitarcesta', public: true },
    { file: 'avisos-lista.png', path: '/#/app/avisos', role: 'ADM' },
    { file: 'aviso-form.png', path: '/#/app/avisos/criar', role: 'ADM' },
    { file: 'embaixadores-lista.png', path: '/#/app/embaixadores', role: 'ADM' },
    { file: 'amigosmelvin-lista.png', path: '/#/app/amigosmelvin', role: 'DIRE' },
    { file: 'ocorrencias-tecnicas-lista.png', path: '/#/app/ocorrencias-tecnicas', role: 'TECH' },
    { file: 'ocorrencia-tecnica-form.png', path: '/#/app/ocorrencias-tecnicas/criar', role: 'TECH' },
];

function waitForServer(url, timeoutMs = 90000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const tick = async () => {
            try {
                const res = await fetch(url);
                if (res.ok || res.status === 404) return resolve();
            } catch { /* ainda subindo */ }
            if (Date.now() - start > timeoutMs) return reject(new Error('Timeout esperando o dev server subir'));
            setTimeout(tick, 500);
        };
        tick();
    });
}

async function main() {
    console.log(`Subindo vite dev server em ${BASE} ...`);
    const devServer = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
        cwd: ROOT,
        stdio: 'pipe',
        env: { ...process.env },
    });
    devServer.stdout.on('data', () => {});
    devServer.stderr.on('data', (d) => process.stderr.write(d));

    try {
        await waitForServer(BASE);
        console.log('Dev server pronto. Iniciando capturas...');

        const browser = await chromium.launch();

        const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
        const shotsToRun = only ? SHOTS.filter((s) => only.includes(s.file)) : SHOTS;

        for (const shot of shotsToRun) {
            const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
            const page = await context.newPage();

            if (!shot.public) {
                await context.addCookies([
                    { name: 'token', value: FAKE_TOKEN, domain: 'localhost', path: '/' },
                    { name: 'role', value: shot.role, domain: 'localhost', path: '/' },
                    { name: 'login', value: shot.login || (shot.role === 'ADM' ? '2024001' : '2024002'), domain: 'localhost', path: '/' },
                ]);
                await applyDefaultMocks(page, shot.role);
            }

            try {
                await page.goto(BASE + shot.path, { waitUntil: 'networkidle', timeout: 20000 });
                await page.waitForTimeout(600);
                await page.screenshot({ path: path.join(OUT_DIR, shot.file), fullPage: true, timeout: 15000 });
                console.log('  ✔', shot.file);
            } catch (err) {
                console.error('  ✘', shot.file, '-', err.message);
            } finally {
                await context.close();
            }
        }

        await browser.close();
        console.log('Concluído. Prints salvos em', OUT_DIR);
    } finally {
        devServer.kill('SIGKILL');
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
