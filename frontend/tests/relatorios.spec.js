import { test, expect } from './fixtures';

test.describe('Relatórios (Reporting)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/discente*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ matricula: '2026001', nome: 'Aluno Relatório', status: 'true' }])
      });
    });
  });

  test('should load reports page', async ({ page }) => {
    await page.goto('/#/app/relatorios');
    await expect(page.locator('h2', { hasText: 'Relatórios' })).toBeVisible();
    
    await expect(page.locator('[class*="tr_body"], [class*="card_body"]').filter({ hasText: 'Aluno Relatório' })).toBeVisible();
  });
});
