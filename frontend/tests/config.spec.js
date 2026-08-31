import { test, expect } from './fixtures';

test.describe('Config & Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/voluntario/matricula/*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ matricula: '20247001', nome: 'Admin User', email: 'admin@melvin.org', funcao: 'administrador' })
      });
    });
  });

  test('should display profile information', async ({ page }) => {
    await page.goto('/#/app/config');
    await expect(page.locator('h3', { hasText: 'Meu Perfil' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Admin User' })).toBeVisible();
  });

  test('ADM não deve ver o card de Ocorrências Técnicas (exclusivo do TECH)', async ({ page }) => {
    await page.goto('/#/app/config');
    await expect(page.locator('h3', { hasText: 'Meu Perfil' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Ocorrências Técnicas' })).not.toBeVisible();
  });

  test('should allow marking auto-frequency', async ({ page }) => {
    await page.goto('/#/app/config');
    // Using nth(0) or .first() to match the first select if there are multiple, or select Option by its value directly
    await page.locator('select[name="presenca_manha"]').selectOption({ value: 'P' });
    
    await page.route('**/frequenciavoluntario*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: '{}' });
    });

    await page.locator('button', { hasText: 'Confirmar Presença' }).click();
  });
});
