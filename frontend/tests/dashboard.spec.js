import { test, expect } from './fixtures';

test.describe('Dashboard Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/dashboard/ranking*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ matricula: '2026001', nome: 'Aluno Crítico', mediaGeral: 4.5 }]) });
    });
    
    await page.route('**/frequenciadiscente/alertas-faltas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ matricula: '2026001', quantidade: 6 }]) });
    });
    
    await page.route('**/frequenciadiscente/2026*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('should display the excessive absences card with correct data', async ({ page }) => {
    await page.goto('/#/app/adm');
    await expect(page.locator('h3', { hasText: 'Faltas Excessivas' })).toBeVisible();
    await expect(page.locator('li', { hasText: 'Aluno Crítico' }).first()).toBeVisible();
    await expect(page.locator('text=6 faltas')).toBeVisible();
  });
});
