import { test, expect } from './fixtures';

test.describe('Voluntários Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/voluntario', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ matricula: '2026001', nome: 'Voluntário 1', status: 'true', funcao: 'professor' }])
      });
    });
  });

  test('should list volunteers', async ({ page }) => {
    await page.goto('/#/app/voluntarios');
    await expect(page.locator('[class*="tr_body"], [class*="card_body"]').filter({ hasText: 'Voluntário 1' })).toBeVisible();
  });
});
