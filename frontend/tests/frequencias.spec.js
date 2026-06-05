import { test, expect } from './fixtures';

test.describe('Frequências (Attendance)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/discente*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { matricula: '2026001', nome: 'Aluno 1', status: 'true', sala: 1, turno: 'manha' },
          { matricula: '2026002', nome: 'Aluno 2', status: 'true', sala: 1, turno: 'tarde' }
        ])
      });
    });
    
    await page.route('**/api/frequenciadiscente/alertas-faltas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { matricula: '2026001', quantidade: 5 },
          { matricula: '2026002', quantidade: 5 }
        ])
      });
    });
  });

  test('should register student attendance and show alerts', async ({ page }) => {
    await page.goto('/#/app/frequencias/alunos');
    
    // Select morning
    await page.locator('select').first().selectOption({ value: 'manha' });
    
    const row = page.locator('[class*="tr_body"]').first();
    await expect(row.locator('[title*="5 faltas"]')).toBeVisible();
    await expect(row.locator('[title*="5 faltas"]').locator('text=5')).toBeVisible();
    
    await row.locator('select').selectOption({ label: 'P' }); // Or value: 'P'

    await page.route('**/api/frequenciadiscente*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        route.fulfill({ status: 200, body: '{}' });
      } else {
        route.continue();
      }
    });

    await page.locator('button', { hasText: 'Salvar Chamada' }).click();
  });
});
