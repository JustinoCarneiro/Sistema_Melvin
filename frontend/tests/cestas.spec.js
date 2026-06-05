import { test, expect } from './fixtures';

test.describe('Cestas (Doações)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/cestas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', nome: 'Doador 1', cpf: '123', contato: '123', operacao: 'Doação', tipo: 'Alimento', dataEntrega: '2024-03-20' }
        ])
      });
    });
  });

  test('should list cestas correctly', async ({ page }) => {
    await page.goto('/#/app/cestas');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Doador 1')).toBeVisible();
  });

  test('should allow searching for a cesta', async ({ page }) => {
    await page.goto('/#/app/cestas');
    await page.fill('input[placeholder*="Buscar"]', 'Doador 1');
    await expect(page.locator('text=Doador 1')).toBeVisible();
  });

  test('should navigate to creation form', async ({ page }) => {
    await page.goto('/#/app/cestas');
    await page.locator('text=Novo Registro').first().click();
    await expect(page).toHaveURL(/.*\/app\/cestas\/criar/);
  });
});
