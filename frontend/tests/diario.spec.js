import { test, expect } from './fixtures';

test.describe('Diário de Acompanhamento', () => {
  test.beforeEach(async ({ page }) => {
    const alunoMatricula = '2026001';
    
    await page.route(`**/discente/matricula/${alunoMatricula}`, route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ matricula: alunoMatricula, nome: 'Aluno Teste', status: 'true' })
      });
    });

    await page.route(`**/diarios/captura/${alunoMatricula}`, route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fileName: 'diario_existente.pdf', filePath: '/path/to/file' })
      });
    });
  });

  test('should show the existing diario filename', async ({ page }) => {
    await page.goto('/#/app/aluno/editar/2026001');
    await expect(page.locator('span[class*="filename"]').filter({ hasText: 'diario_existente.pdf' }).first()).toBeVisible();
  });

  test('should allow downloading the diario', async ({ page }) => {
    await page.route('**/diarios/download/**', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: 'file content' });
    });

    await page.goto('/#/app/aluno/editar/2026001');
    await page.locator('button[title="Baixar Diário"]').first().click();
  });

  test('should allow selecting a new file', async ({ page }) => {
    await page.goto('/#/app/aluno/editar/2026001');
    await expect(page.locator('div[class*="_dropzone_"]').first()).toBeVisible();
  });
});
