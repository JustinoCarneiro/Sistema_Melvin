import { test, expect } from './fixtures';

// US-1.5: cargo técnico (TECH) tem acesso equivalente ao ADM em tudo, inclusive as telas
// exclusivas hoje travadas por role === 'ADM' no código (Config, Permissões, Calendário).
test.describe('Cargo Técnico (TECH)', () => {
  test.beforeEach(async ({ page, context }) => {
    // O fixture padrão injeta role=ADM; sobrescreve para TECH e reforça os mocks de
    // verificação de sessão que dependem do cargo (PrivateRoute chama /auth/role_*).
    await context.addCookies([{ name: 'role', value: 'TECH', domain: 'localhost', path: '/' }]);
    await page.route('**/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: 'TECH' });
    });
    await page.route('**/voluntario/matricula/*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ matricula: '2026009', nome: 'Tech User', funcao: 'tecnico' })
      });
    });
  });

  test('deve exibir o card de Administração (Arquivo Morto) em Configurações', async ({ page }) => {
    await page.goto('/#/app/config');
    await expect(page.locator('h3', { hasText: 'Administração (Arquivo Morto)' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Permissões de Acesso' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Calendário de Exceções' })).toBeVisible();
  });

  test('deve acessar a tela de Permissões de Acesso', async ({ page }) => {
    await page.route('**/permissoes', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/#/app/config/permissoes');
    await expect(page.locator('h1', { hasText: 'Configurações de Permissões' })).toBeVisible();
  });

  test('deve acessar a tela de Calendário de Exceções', async ({ page }) => {
    await page.route('**/dias-nao-letivos', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/#/app/config/calendario');
    await expect(page.locator('h1', { hasText: 'Calendário de Exceções' })).toBeVisible();
  });
});
