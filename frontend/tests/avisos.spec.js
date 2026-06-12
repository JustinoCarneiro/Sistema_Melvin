import { test, expect } from './fixtures';

test.describe('Avisos (Notificações)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/aviso', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', titulo: 'Aviso Teste', corpo: 'Corpo do aviso', status: true, data_inicio: '2024-03-20' }
        ])
      });
    });
  });

  test('should list avisos', async ({ page }) => {
    await page.goto('/#/app/avisos');
    await expect(page.locator('text=Aviso Teste')).toBeVisible();
  });

  test('should navigate to create aviso', async ({ page }) => {
    await page.goto('/#/app/avisos');
    await page.locator('button', { hasText: 'Criar Aviso' }).click();
    await expect(page).toHaveURL(/.*\/app\/avisos\/criar/);
  });
});
