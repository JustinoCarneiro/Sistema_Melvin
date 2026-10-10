import { test, expect } from './fixtures';

// A página pública deve usar só a lista pública (nome, descrição e foto dos aprovados) e nunca
// pedir a lista completa, que tem contato e e-mail e é da administração.
test.describe('Site — Embaixadores (lista pública)', () => {
  test('mostra os embaixadores da lista pública e não pede a lista completa', async ({ page }) => {
    const pedidos = [];
    page.on('request', request => {
      if (request.method() === 'GET') pedidos.push(new URL(request.url()).pathname);
    });

    await page.route('**/embaixador/publicos', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'a1', nome: 'Maria Publica', descricao: 'Apoia o projeto desde o início' },
        { id: 'a2', nome: 'Carlos Aprovado', descricao: 'Divulga o Instituto na comunidade' },
      ]),
    }));
    await page.route('**/imagens/lista', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));

    await page.goto('/#/embaixadores');

    const cartao = page.getByRole('heading', { name: 'Maria Publica' });
    await expect(cartao).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Carlos Aprovado' })).toBeVisible();
    await expect(page.getByText('Divulga o Instituto na comunidade')).toBeVisible();

    // Os cartões animam ao entrar na tela (começam com opacidade 0): depois de rolar até eles têm de ficar opacos.
    await cartao.scrollIntoViewIfNeeded();
    await expect.poll(() => cartao.evaluate(el => {
      let opacidade = 1;
      for (let n = el; n && n !== document.body; n = n.parentElement) opacidade = Math.min(opacidade, Number(getComputedStyle(n).opacity));
      return opacidade;
    })).toBe(1);

    expect(pedidos.filter(caminho => caminho.endsWith('/embaixador'))).toEqual([]);
    expect(pedidos.some(caminho => caminho.endsWith('/embaixador/publicos'))).toBe(true);
  });
});
