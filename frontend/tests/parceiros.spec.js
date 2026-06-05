import { test, expect } from './fixtures';

test.describe('Partners (Embaixadores & Amigos)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/embaixador', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nome: 'Embaixador 1', instagram: '@instateste', contato: '123456', email: 'teste@teste.com', status: true }])
      });
    });
    
    await page.route('**/amigomelvin', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nome: 'Amigo 1', contato: '654321', email: 'amigo@teste.com', status: true }])
      });
    });
  });

  test('should list partners', async ({ page }) => {
    await page.goto('/#/app/embaixadores');
    await expect(page.locator('[class*="tr_body"], [class*="card_body"]').filter({ hasText: 'Embaixador 1' })).toBeVisible();
  });
});
