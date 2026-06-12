import { test, expect } from './fixtures';

test.describe('Dias Não Letivos (Calendário de Exceções)', () => {
  test.beforeEach(async ({ page }) => {
    // Mockando os endpoints da API que acabamos de criar no backend
    await page.route('**/dias-nao-letivos*', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '123e4567-e89b-12d3-a456-426614174000', data: '2026-11-02', descricao: 'Finados' }
          ]),
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
      } else if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 200, contentType: 'text/plain', body: 'Removido com sucesso!' });
      } else {
        route.continue();
      }
    });
  });

  // ATENÇÃO: Os testes abaixo usam .skip() temporariamente pois a tela React de
  // Cadastro de Feriados no Frontend ainda NÃO foi implementada nesta sessão.
  // Quando a UI for construída, remova o ".skip" para habilitá-los.

  test('deve carregar a tela de calendário e exibir os feriados cadastrados', async ({ page }) => {
    await page.goto('/#/app/config/calendario');

    // Valida títulos e tabelas da futura interface
    await expect(page.locator('h1', { hasText: 'Calendário de Exceções' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Finados' })).toBeVisible();
    await expect(page.locator('td', { hasText: '02/11/2026' })).toBeVisible();
  });

  test('deve permitir adicionar um novo dia não letivo', async ({ page }) => {
    await page.goto('/#/app/config/calendario');

    // Fluxo de preenchimento do formulário
    await page.locator('input[type="date"]').fill('2026-12-25');
    await page.locator('input[type="text"]').fill('Natal');
    
    // Intercepta e aguarda a requisição POST simulando a gravação
    const postReq = page.waitForRequest(req => req.url().includes('/dias-nao-letivos') && req.method() === 'POST');
    await page.locator('button', { hasText: 'Adicionar' }).click();
    await postReq;
  });

  test('deve permitir remover um dia não letivo existente', async ({ page }) => {
    await page.goto('/#/app/config/calendario');

    const deleteReq = page.waitForRequest(req => req.url().includes('/dias-nao-letivos/123e4567-e89b-12d3-a456-426614174000') && req.method() === 'DELETE');
    
    page.on('dialog', dialog => dialog.accept());
    // Clica no botão de lixeira correspondente ao feriado 'Finados'
    const row = page.locator('tr', { hasText: 'Finados' });
    await row.locator('button').click();
    
    await deleteReq;
  });
});
