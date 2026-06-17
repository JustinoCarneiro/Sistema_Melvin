import { test, expect } from './fixtures';

test.describe('Discentes Management', () => {
  test.beforeEach(async ({ page }) => {
    // Override specific students for this test
    await page.route('**/api/discente*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { matricula: '2026001', nome: 'João Silva', status: 'true', sala: 1, turno: 'manha' },
          { matricula: '2026002', nome: 'Maria Tarde', status: 'true', sala: 1, turno: 'tarde' }
        ])
      });
    });

    await page.route('**/api/frequenciadiscente/alertas-faltas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ matricula: '2026001', nome: 'João Silva', quantidade: 4 }])
      });
    });
  });

  test('should list students and show absence alerts', async ({ page }) => {
    // Start tracking the requests we want to wait for
    const getAlunosPromise = page.waitForResponse(response => response.url().includes('/api/discente'));
    const getAlertasPromise = page.waitForResponse(response => response.url().includes('/api/frequenciadiscente/alertas-faltas'));

    await page.goto('/#/app/alunos');
    
    // Wait for the specific requests to finish
    await Promise.all([getAlunosPromise, getAlertasPromise]);

    // Check for correct student name
    const row = page.locator('tr').filter({ hasText: 'João Silva' });
    await expect(row).toBeVisible();

    // Check for alert icon and count via title attribute
    const alertIcon = row.locator('[title*="4 faltas"]');
    await expect(alertIcon).toBeVisible();
    await expect(alertIcon.locator('text=4')).toBeVisible();
  });

});
