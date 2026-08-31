import { test, expect } from './fixtures';

// Ocorrências Técnicas: registro de achados técnicos do sistema (bugs, incidentes, decisões,
// manutenção, segurança), exclusivo do cargo TECH (US-1.5) — nem o ADM vê esta tela.
test.describe('Ocorrências Técnicas (TECH)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([{ name: 'role', value: 'TECH', domain: 'localhost', path: '/' }]);
    await page.route('**/auth/role_*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, body: 'TECH' });
    });
  });

  test('deve listar as ocorrências técnicas cadastradas', async ({ page }) => {
    await page.route('**/ocorrencias-tecnicas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      if (route.request().method() !== 'GET') return route.continue();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1', titulo: 'Hash Argon2 corrompido via SSH', categoria: 'BUG', severidade: 'ALTA',
            descricao: 'O $ do formato Argon2 foi expandido pelo shell remoto.', resolvido: true,
            autorLogin: '2026009', dataOcorrencia: '2026-08-27'
          },
          {
            id: '2', titulo: 'Mock de aviso interceptando asset de imagem', categoria: 'BUG', severidade: 'MEDIA',
            descricao: 'Glob amplo casou com o import de PNG do Manual.', resolvido: false,
            autorLogin: '2026009', dataOcorrencia: '2026-08-26'
          }
        ])
      });
    });

    await page.goto('/#/app/ocorrencias-tecnicas');
    await expect(page.locator('h2', { hasText: 'Ocorrências Técnicas' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Hash Argon2 corrompido via SSH' })).toBeVisible();
    await expect(page.locator('td', { hasText: 'Mock de aviso interceptando asset de imagem' })).toBeVisible();
  });

  test('deve permitir registrar uma nova ocorrência técnica', async ({ page }) => {
    await page.route('**/ocorrencias-tecnicas', route => {
      if (route.request().url().includes('.js')) return route.continue();
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
      if (route.request().method() === 'POST') {
        return route.fulfill({ status: 201, contentType: 'application/json', body: route.request().postData() });
      }
      return route.continue();
    });

    // Navega pela UI (lista -> "Nova Ocorrência"), não direto pela URL: dá ao SPA uma
    // entrada de histórico de verdade, senão o navigate(-1) do form acaba indo pra
    // about:blank (não existe "voltar" possível quando a página é aberta direto).
    await page.goto('/#/app/ocorrencias-tecnicas');
    await page.locator('button', { hasText: 'Nova Ocorrência' }).click();
    await page.waitForURL('**/#/app/ocorrencias-tecnicas/criar');

    await page.fill('input[name="titulo"]', 'Teste E2E de ocorrência técnica');
    await page.selectOption('select[name="categoria"]', 'INCIDENTE');
    await page.selectOption('select[name="severidade"]', 'BAIXA');
    await page.fill('textarea[name="descricao"]', 'Descrição de teste registrada via E2E.');
    await page.fill('input[name="data_ocorrencia"]', '2026-08-28');

    // Espera a RESPOSTA (não só o envio) do POST: o alert() só dispara depois que a promise
    // do service resolve, e o navigate(-1) só depois do alert ser fechado — esperar só o
    // envio da requisição termina o teste antes do dialog aparecer de verdade.
    const postRes = page.waitForResponse(res => res.url().includes('/ocorrencias-tecnicas') && res.request().method() === 'POST');
    page.on('dialog', dialog => dialog.accept());
    await page.locator('button', { hasText: 'Registrar Ocorrência' }).click();
    await postRes;
    await page.waitForURL('**/#/app/ocorrencias-tecnicas');
  });
});
