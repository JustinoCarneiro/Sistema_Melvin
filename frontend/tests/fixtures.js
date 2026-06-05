import { test as base } from '@playwright/test';

// Cria um test fixture estendido
export const test = base.extend({
  page: async ({ page, context }, use) => {
    // Log all requests that are being mocked to debug MIME type error
    await page.route('**/*', async (route) => {
      // Pass through but log
      await route.continue();
    });
    
    // 1. Injeta os cookies de autenticação (similar ao cy.login do support/commands.js)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjIzNzQwMzk2MjN9.fake_signature'; // Expirará em 2045
    const matricula = '20247001';
    const role = 'ADM';

    await context.addCookies([
      { name: 'token', value: token, domain: 'localhost', path: '/' },
      { name: 'role', value: role, domain: 'localhost', path: '/' },
      { name: 'login', value: matricula, domain: 'localhost', path: '/' }
    ]);

    // 2. Mocks Globais e Bloqueios (similar ao support/e2e.js)
    // Block Google Maps script to avoid crashes
    await page.route('https://maps.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));

    // Global intercepts
    await page.route('**/api/dashboard/**', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: '[]' });
    });
    await page.route('**/api/frequenciadiscente/**', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: '{}' });
    });
    await page.route('**/api/aviso*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: '[]' });
    });
    
    // Dynamic Permissions
    await page.route('**/api/permissoes/minhas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(['EDITAR_RENDIMENTO', 'GERENCIAR_FREQUENCIA', 'CADASTRAR_ALUNO', 'EDITAR_AVALIACAO_PSICO'])
      });
    });

    // Unified role requests
    await page.route('**/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: 'ADM' });
    });
    await page.route('**/api/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: 'ADM' });
    });
    
    // Profile request
    await page.route('**/voluntario/matricula/*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ matricula: '20247001', nome: 'Mock User', funcao: 'administrador' })
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
