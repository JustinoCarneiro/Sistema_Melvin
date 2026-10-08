import { test, expect } from './fixtures';

test.describe('Cestas - Solicitações (validação, agendamento e cancelamento)', () => {
  test('cancela uma solicitação pendente de validação', async ({ page }) => {
    let solicitacoesPendentes = [
      { id: 'pend-1', nomeSolicitante: 'Solicitante Teste', nivelSolicitante: 'SETOR', nome: 'Beneficiário Pendente', lider_celula: 'Liderança Teste', rede: 'Rede Teste' }
    ];

    await page.route('**/cestas/solicitacoes', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(solicitacoesPendentes) });
    });
    await page.route('**/cestas/solicitacoes/agendadas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/cestas/solicitacao/pend-1/cancelar', route => {
      solicitacoesPendentes = [];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'pend-1', status: 'CANCELADA' })
      });
    });

    page.on('dialog', dialog => dialog.accept());

    await page.goto('/#/app/cestas/solicitacoes');
    await expect(page.locator('text=Beneficiário Pendente')).toBeVisible();

    const linha = page.getByRole('row', { name: /Beneficiário Pendente/ });
    await linha.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('text=cancelada')).toBeVisible();
    await expect(page.locator('text=Nenhuma solicitação pendente.')).toBeVisible();
  });

  test('cancela uma solicitação já agendada (beneficiário não compareceu)', async ({ page }) => {
    let agendadas = [
      { id: 'agend-1', nome: 'Beneficiário Agendado', nomeSolicitante: 'Solicitante Agendada', lider_celula: 'Liderança Agendada', rede: 'Rede Teste', dataRetirada: '2026-09-09' }
    ];

    await page.route('**/cestas/solicitacoes', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/cestas/solicitacoes/agendadas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(agendadas) });
    });
    await page.route('**/cestas/solicitacao/agend-1/cancelar', route => {
      agendadas = [];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'agend-1', status: 'CANCELADA' })
      });
    });

    page.on('dialog', dialog => dialog.accept());

    await page.goto('/#/app/cestas/solicitacoes');
    await expect(page.locator('text=Beneficiário Agendado')).toBeVisible();

    const linha = page.getByRole('row', { name: /Beneficiário Agendado/ });
    await linha.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.locator('text=cancelada')).toBeVisible();
    await expect(page.locator('text=Nenhuma cesta agendada aguardando retirada.')).toBeVisible();
  });

  test('exibe o conflito do servidor e recarrega as listas após uma corrida', async ({ page }) => {
    let carregamentosPendentes = 0;
    const pendentes = [
      { id: 'pend-race', nomeSolicitante: 'Solicitante Concorrente', nivelSolicitante: 'SETOR', nome: 'Beneficiário Concorrente', lider_celula: 'Liderança Teste', rede: 'Rede Teste' }
    ];

    await page.route('**/cestas/solicitacoes', route => {
      if (route.request().url().includes('.js')) return route.continue();
      carregamentosPendentes += 1;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(pendentes) });
    });
    await page.route('**/cestas/solicitacoes/agendadas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.route('**/cestas/solicitacao/pend-race/cancelar', route => {
      route.fulfill({
        status: 409,
        contentType: 'text/plain',
        body: 'Solicitação foi alterada por outra operação. Atualize a tela e tente novamente.'
      });
    });

    page.on('dialog', dialog => dialog.accept());

    await page.goto('/#/app/cestas/solicitacoes');
    const linha = page.getByRole('row', { name: /Beneficiário Concorrente/ });
    await linha.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByText('Solicitação foi alterada por outra operação. Atualize a tela e tente novamente.')).toBeVisible();
    await expect(page.getByText('Beneficiário Concorrente')).toBeVisible();
    await expect.poll(() => carregamentosPendentes).toBeGreaterThanOrEqual(2);
  });
});
