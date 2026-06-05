import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://maps.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
  });

  test('should load the home page and have title', async ({ page }) => {
    await page.goto('/#/');
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Transformando' }).first()).toBeVisible();
    await expect(page.locator('h1', { hasText: 'histórias com amor' }).first()).toBeVisible();
  });
  
  test('should navigate to "Mais Sobre Nós"', async ({ page }) => {
    await page.goto('/#/maissobrenos');
    await expect(page).toHaveURL(/.*\/maissobrenos/);
  });

  test('should navigate to "Embaixadores"', async ({ page }) => {
    await page.goto('/#/embaixadores');
    await expect(page).toHaveURL(/.*\/embaixadores/);
    await expect(page.locator('h1', { hasText: 'Seja um' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Embaixador' }).first()).toBeVisible();
    await expect(page.locator('text=Quero ser um embaixador!').first()).toBeVisible();
  });

  test('should navigate to "Amigos Melvin"', async ({ page }) => {
    await page.goto('/#/amigos-do-melvin');
    await expect(page).toHaveURL(/.*\/amigos-do-melvin/);
    await expect(page.locator('h1', { hasText: 'Amigos do' }).first()).toBeVisible();
  });

  test('should navigate to "Doações"', async ({ page }) => {
    await page.goto('/#/doacoes');
    await expect(page).toHaveURL(/.*\/doacoes/);
  });
});
