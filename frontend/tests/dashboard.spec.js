import { test, expect } from './fixtures';

// Dados compartilhados nos mocks
const RANKING_MOCK = [
  { matricula: '2026001', nome: 'Aluno Crítico', mediaGeral: 4.5 },
  { matricula: '2026002', nome: 'Aluno Top', mediaGeral: 9.5 },
];
const ALERTAS_COM_FALTAS = [{ matricula: '2026001', nome: 'Aluno Crítico', quantidade: 6 }];

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
    await page.goto('/#/app/adm');

    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Top' }).first()).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Crítico' }).first()).toBeVisible();
  });

  test('deve recarregar ranking ao mudar o filtro de categoria', async ({ page }) => {
    await page.goto('/#/app/adm');
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

    await page.goto('/#/app/adm');
    await expect(page.locator('h3', { hasText: 'Destaques' })).toBeVisible();

    for (const categoria of categorias) {
      const req = page.waitForRequest(r => r.url().includes(`sortBy=${categoria}`));
      await page.locator('select[class*="selectFilter"]').selectOption({ value: categoria });
      await req;
    }
  });
});
