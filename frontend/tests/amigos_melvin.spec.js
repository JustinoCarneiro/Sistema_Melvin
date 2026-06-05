import { test, expect } from '@playwright/test';

test.describe('Amigos do Melvin - Fluxo de Doação', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://maps.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
    await page.goto('/#/amigos-do-melvin');
  });

  test('Deve renderizar a página corretamente com o título e planos', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Amigos do' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Melvin' }).first()).toBeVisible();
    await expect(page.locator('text=Programa de apoio mensal')).toBeVisible();
    await expect(page.locator('text=R$ 30').first()).toBeVisible();
  });

  test('Deve iniciar com o botão de envio desabilitado', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Quero ser amigo!' })).toBeDisabled();
  });

  test('Deve permitir selecionar plano de R$ 30 e redirecionar', async ({ page }) => {
    await page.locator('button', { hasText: 'R$ 30' }).click();

    await page.fill('input[name="nome"]', 'Teste Doador');
    await page.fill('input[name="email"]', 'teste@email.com');
    await page.fill('input[name="telefone"]', '85999999999');
    await page.fill('input[name="dia"]', '5');

    await page.locator('#terms').check({ force: true });

    await page.locator('button', { hasText: 'Quero ser amigo!' }).click();

    await expect(page).toHaveURL(/.*\/cadastroamigo/);
    await expect(page.locator('text=R$ 30').first()).toBeVisible();
  });

  test('Deve passar os dados do formulário para a tela de checkout', async ({ page }) => {
    await page.fill('input[name="nome"]', 'Maria da Silva');
    await page.fill('input[name="email"]', 'maria@email.com');
    await page.fill('input[name="telefone"]', '85988887777');
    await page.fill('input[name="dia"]', '10');

    await page.locator('#terms').check({ force: true });

    await page.locator('button', { hasText: 'Quero ser amigo!' }).click();

    await expect(page).toHaveURL(/.*\/cadastroamigo/);
    await expect(page.locator('text=Maria da Silva').first()).toBeVisible();
    await expect(page.locator('text=maria@email.com').first()).toBeVisible();
    await expect(page.locator('text=85988887777').first()).toBeVisible();
  });
});

test.describe('Amigos do Melvin - Tela de Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://maps.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
  });

  test('Deve exibir o botão de finalização desabilitado sem dados do cartão', async ({ page }) => {
    await page.goto('/#/amigos-do-melvin');

    await page.fill('input[name="nome"]', 'Doador Teste');
    await page.fill('input[name="email"]', 'teste@melvin.com');
    await page.fill('input[name="telefone"]', '85999999999');
    await page.fill('input[name="dia"]', '5');
    await page.locator('#terms').check({ force: true });
    
    await page.locator('button', { hasText: 'Quero ser amigo!' }).click();

    await expect(page).toHaveURL(/.*\/cadastroamigo/);
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('Deve exibir o botão Voltar e permitir retornar à página anterior', async ({ page }) => {
    await page.goto('/#/cadastroamigo');
    await expect(page.locator('text=Voltar').first()).toBeVisible();
    await page.locator('text=Voltar').first().click();
    await expect(page).toHaveURL(/.*\/amigos-do-melvin/);
  });
});
