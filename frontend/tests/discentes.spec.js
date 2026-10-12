import { test, expect } from './fixtures';

test.describe('Discentes Management', () => {
  test.beforeEach(async ({ page }) => {
    // Override specific students for this test
    await page.route('**/discente*', route => {
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

    await page.route('**/frequenciadiscente/alertas-faltas*', route => {
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
    const getAlunosPromise = page.waitForResponse(response => response.url().includes('/discente'));
    const getAlertasPromise = page.waitForResponse(response => response.url().includes('/frequenciadiscente/alertas-faltas'));

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

  test('sem Gerenciar Frequência a lista de alunos carrega e não consulta os alertas de faltas', async ({ page }) => {
    const alertasRequests = [];
    page.on('request', request => {
      if (request.url().includes('/frequenciadiscente/alertas-faltas')) alertasRequests.push(request.url());
    });
    await page.context().addCookies([{ name: 'role', value: 'ASSIST', domain: 'localhost', path: '/' }]);
    await page.route('**/permissoes/minhas*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(['VISUALIZAR_ALUNOS']) });
    });

    await page.goto('/#/app/alunos');

    await expect(page.locator('tr').filter({ hasText: 'João Silva' })).toBeVisible();
    await page.waitForTimeout(800);
    expect(alertasRequests).toHaveLength(0);
  });

  // US-3.3: "Deletar" apaga dados pessoais de forma irreversível; "Inativa" só desativa.
  const alunoMock = {
    matricula: '2026001', nome: 'João Silva', data: '2015-06-20', sexo: 'M', cor: 'Parda',
    nacionalidade: 'Brasileira', endereco: 'Rua A, 10', bairro: 'Centro', cidade: 'Fortaleza',
    sala: 1, turno: 'manha', status: 'true'
  };

  async function abrirEdicaoDoAluno(page, chamadas) {
    await page.route('**/discente/matricula/2026001', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(alunoMock) }));
    await page.route('**/discente/2026001', route => {
      chamadas.push(route.request().method());
      return route.fulfill({ status: 200, body: 'ok' });
    });
    await page.route('**/diarios/**', route => route.fulfill({ status: 404, body: 'nao encontrado' }));
    await page.goto('/#/app/aluno/editar/2026001');
    await expect(page.locator('input[name="nome"]')).toHaveValue('João Silva');
  }

  test('should warn that Deletar is irreversible and point to Inativa', async ({ page }) => {
    await abrirEdicaoDoAluno(page, []);
    const aviso = page.locator('[role="alert"]').filter({ hasText: 'irreversível' });

    await page.selectOption('select[name="status"]', 'false');
    await expect(aviso).toHaveCount(0);

    await page.selectOption('select[name="status"]', 'deletar');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText('Inativa');
    await expect(aviso).toContainText('eliminação de dados');
  });

  test('should not send the deletion when the confirmation is dismissed', async ({ page }) => {
    const chamadas = [];
    const dialogos = [];
    page.on('dialog', dialog => { dialogos.push(dialog.message()); dialog.dismiss(); });
    await abrirEdicaoDoAluno(page, chamadas);

    await page.selectOption('select[name="status"]', 'deletar');
    await page.getByRole('button', { name: 'Salvar Dados' }).click();

    await expect.poll(() => dialogos.length).toBe(1);
    expect(dialogos[0]).toContain('irreversível');
    expect(chamadas).not.toContain('DELETE');
  });

  test('should send the deletion after the confirmation is accepted', async ({ page }) => {
    const chamadas = [];
    const dialogos = [];
    page.on('dialog', dialog => { dialogos.push(dialog.message()); dialog.accept(); });
    await abrirEdicaoDoAluno(page, chamadas);

    await page.selectOption('select[name="status"]', 'deletar');
    await page.getByRole('button', { name: 'Salvar Dados' }).click();

    await expect.poll(() => chamadas.filter(m => m === 'DELETE').length).toBe(1);
    expect(dialogos[0]).toContain('irreversível');
  });

});
