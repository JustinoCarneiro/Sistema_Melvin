import { test, expect } from './fixtures';

// Dados compartilhados nos mocks
const RANKING_MOCK = [
  { matricula: '2026001', nome: 'Aluno Crítico', mediaGeral: 4.5 },
  { matricula: '2026002', nome: 'Aluno Top', mediaGeral: 9.5 },
];
const ALERTAS_COM_FALTAS = [{ matricula: '2026001', nome: 'Aluno Crítico', quantidade: 6 }];

async function acessarComo(page, role, { permissoes, atrasoPermissoesMs = 0 } = {}) {
  await page.context().addCookies([{ name: 'role', value: role, domain: 'localhost', path: '/' }]);
  await page.route('**/auth/role_*', route => route.fulfill({ status: 200, body: role }));
  if (permissoes) {
    await page.route('**/permissoes/minhas*', async route => {
      if (route.request().url().includes('.js')) return route.continue();
      if (atrasoPermissoesMs) await new Promise(resolve => setTimeout(resolve, atrasoPermissoesMs));
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(permissoes) });
    });
  }
  await page.goto(`/#/app/${role.toLowerCase()}`);
}

const seletorOrdenacao = 'select[class*="selectFilter"]';
const OPCOES_COM_PSICOLOGICO = ['Média Geral', 'Presença', 'Participação', 'Comportamento', 'Rendimento', 'Psicológico'];
const OPCOES_SEM_PSICOLOGICO = ['Média Pedagógica', 'Presença', 'Participação', 'Comportamento', 'Rendimento'];

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Ranking: retorna 2 alunos para todos os sortBy
    await page.route('**/dashboard/ranking*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(RANKING_MOCK),
      });
    });

    // Alertas: por padrão há 1 aluno com 6 faltas injustificadas
    await page.route('**/frequenciadiscente/alertas-faltas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ALERTAS_COM_FALTAS),
      });
    });

    // Frequência do dia (loop de salas no dashboard)
    await page.route('**/frequenciadiscente/2026*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('deve exibir card de Faltas Excessivas com dados corretos', async ({ page }) => {
    await page.goto('/#/app/adm');

    await expect(page.locator('h3', { hasText: 'Faltas Excessivas' })).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Crítico' }).first()).toBeVisible();
    await expect(page.locator('text=6 faltas')).toBeVisible();
    // Aluno sem alerta NÃO deve aparecer no card de faltas
    await expect(page.locator('.rankingList').last().locator('li', { hasText: 'Aluno Top' })).not.toBeVisible();
  });

  test('deve exibir mensagem vazia quando nenhum aluno excede o limiar de 4 faltas', async ({ page }) => {
    // Sobrescreve o mock de alertas para simular resposta vazia (nenhuma falta injustificada >= 4)
    await page.route('**/frequenciadiscente/alertas-faltas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/#/app/adm');
    await expect(page.locator('text=Nenhum alerta para o mês atual.')).toBeVisible();
  });

  test('deve exibir alunos no card de Destaques', async ({ page }) => {
    await acessarComo(page, 'PSICO');

    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Top' }).first()).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Crítico' }).first()).toBeVisible();
  });

  test('deve recarregar ranking ao mudar o filtro de categoria', async ({ page }) => {
    await acessarComo(page, 'PSICO');
    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();

    // Aguarda a requisição com sortBy=presenca disparada pela troca do select
    const novaRequisicaoPromise = page.waitForRequest(req =>
      req.url().includes('dashboard/ranking') && req.url().includes('sortBy=presenca')
    );
    await page.locator('select[class*="selectFilter"]').selectOption({ value: 'presenca' });
    
    const request = await novaRequisicaoPromise;
    expect(request.url()).toContain('sortBy=presenca');
  });

  test('deve chamar ranking com sortBy correto para cada categoria disponível', async ({ page }) => {
    const categorias = ['presenca', 'participacao', 'comportamento', 'rendimento', 'psicologico'];

    await acessarComo(page, 'PSICO');
    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();

    for (const categoria of categorias) {
      const req = page.waitForRequest(r => r.url().includes(`sortBy=${categoria}`));
      await page.locator('select[class*="selectFilter"]').selectOption({ value: categoria });
      await req;
    }
  });

  test('docente com Visualizar Relatórios vê Destaques com Média Pedagógica e sem opção Psicológico', async ({ page }) => {
    const sortBys = [];
    page.on('request', request => {
      const m = request.url().match(/dashboard\/ranking\?.*sortBy=([^&]+)/);
      if (m) sortBys.push(m[1]);
    });

    await acessarComo(page, 'PROF', { permissoes: ['VISUALIZAR_RELATORIOS'] });

    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Atenção Necessária' })).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Top' }).first()).toBeVisible();
    await expect(page.locator(seletorOrdenacao).locator('option')).toHaveText(OPCOES_SEM_PSICOLOGICO);
    expect(sortBys).toContain('media');
    expect(sortBys).not.toContain('psicologico');
  });

  test('carrega o ranking do docente mesmo quando as permissões chegam depois do painel', async ({ page }) => {
    await acessarComo(page, 'PROF', { permissoes: ['VISUALIZAR_RELATORIOS'], atrasoPermissoesMs: 1200 });

    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('li', { hasText: 'Aluno Top' }).first()).toBeVisible();
  });

  test('psicologia e coordenação veem Média Geral e a opção Psicológico, sem depender da permissão de relatórios', async ({ page }) => {
    for (const role of ['PSICO', 'COOR']) {
      await acessarComo(page, role, { permissoes: [] });

      await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();
      await expect(page.locator(seletorOrdenacao).locator('option')).toHaveText(OPCOES_COM_PSICOLOGICO);
    }
  });

  test('administração vê Destaques com Média Pedagógica e sem opção Psicológico', async ({ page }) => {
    await page.goto('/#/app/adm');

    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();
    await expect(page.locator(seletorOrdenacao).locator('option')).toHaveText(OPCOES_SEM_PSICOLOGICO);
  });

  test('cargo sem Visualizar Relatórios não consulta nem exibe o ranking', async ({ page }) => {
    const rankingRequests = [];
    page.on('request', request => {
      if (request.url().includes('/dashboard/ranking')) rankingRequests.push(request.url());
    });

    await acessarComo(page, 'COZI', { permissoes: ['GERENCIAR_FREQUENCIA'] });

    await expect(page.locator('h3', { hasText: 'Frequência do Dia' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Destaques' })).toHaveCount(0);
    await expect(page.locator('h3', { hasText: 'Atenção Necessária' })).toHaveCount(0);
    expect(rankingRequests).toHaveLength(0);
  });
});
