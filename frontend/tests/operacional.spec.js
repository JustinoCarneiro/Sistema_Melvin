import { test, expect } from './fixtures';

test.describe('Operational Modules (Avisos & Cestas)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/aviso', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, titulo: 'Aviso Teste', status: true, data_inicio: '2024-01-01', data_final: '2024-12-31' }])
      });
    });

    await page.route('**/cestas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nome: 'Recebedor 1', tipo: 'ALIMENTO', operacao: 'SAIDA', peso: 10, dataEntrega: '2024-03-20' }])
      });
    });
  });

  test('should manage avisos', async ({ page }) => {
    await page.goto('/#/app/avisos');
    await expect(page.locator('[class*="tr_body"], [class*="card_body"]').filter({ hasText: 'Aviso Teste' }).first()).toBeVisible();
  });

  test('should manage cestas', async ({ page }) => {
    await page.goto('/#/app/cestas');
    await expect(page.locator('[class*="tr_body"], [class*="card_body"]').filter({ hasText: 'Recebedor 1' }).first()).toBeVisible();
  });
});
