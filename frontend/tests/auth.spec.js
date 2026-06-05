import { test, expect } from '@playwright/test';

test.describe('Authentication & RBAC', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.route('https://maps.googleapis.com/**', route => route.fulfill({ status: 200, body: '' }));
    await page.route('**/api/permissoes/minhas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  const performLogin = async (page, role, matricula) => {
    const admToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjIzNzQwMzk2MjN9.fake';
    const auxToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwNSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjIzNzQwMzk2OTF9.fake';
    
    await page.route('**/auth/login*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          token: matricula === '20247001' ? admToken : auxToken, 
          role: role 
        })
      });
    });

    await page.route('**/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'text/plain', body: role });
    });
    
    await page.route('**/api/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'text/plain', body: role });
    });

    await page.fill('input[name="matricula"]', matricula);
    await page.fill('input[name="senha"]', matricula === '20247001' ? 'admin' : '123456');
    await page.locator('button[type="submit"]').click();
  };

  test('should show error message with invalid credentials', async ({ page }) => {
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGEERROR:', err));
    page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));
    await page.route('**/auth/login*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Matrícula ou senha incorreta' })
      });
    });

    await page.goto('/#/login');
    await page.fill('input[name="matricula"]', 'wrong');
    await page.fill('input[name="senha"]', 'wrong');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('p', { hasText: 'incorreta' })).toBeVisible();
  });

  test('should redirect to ADM dashboard after ADM login', async ({ page }) => {
    await page.goto('/#/login');
    await performLogin(page, 'ADM', '20247001');
    await expect(page).toHaveURL(/.*\/app\/adm/);
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
  });

  test('should redirect to AUX dashboard after AUX login', async ({ page }) => {
    await page.goto('/#/login');
    await performLogin(page, 'AUX', '20247005');
    await expect(page).toHaveURL(/.*\/app\/aux/);
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
  });

  test('should logout correctly', async ({ page, context }) => {
    await context.addCookies([
      { name: 'token', value: 'fake_token', domain: 'localhost', path: '/' },
      { name: 'role', value: 'ADM', domain: 'localhost', path: '/' },
      { name: 'login', value: '20247001', domain: 'localhost', path: '/' }
    ]);
    
    await page.route('**/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'text/plain', body: 'ADM' });
    });
    
    await page.route('**/api/voluntario/matricula/*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ nome: 'Admin' }) });
    });

    await page.goto('/#/app/config');
    await expect(page.locator('h3', { hasText: 'Meu Perfil' })).toBeVisible();
    
    await page.locator('button', { hasText: 'Deslogar' }).click();
    
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
