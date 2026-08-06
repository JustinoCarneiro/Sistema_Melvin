import { test, expect } from './fixtures';

const ALUNOS_MOCK = [
  {
    matricula: '2026001',
    nome: 'Aluno Relatório',
    status: 'true',
    sala: 1,
    turno: 'manha',
    avaliacaoPresenca: 8.0,
    avaliacaoParticipacao: 7.5,
    avaliacaoComportamento: 9.0,
    avaliacaoRendimento: 8.5,
    avaliacaoPsicologico: null,
  },
];

const FREQUENCIAS_MOCK = [
  {
    matricula: '2026001',
    data: '2026-06-02',
    presenca_manha: 'P',
    presenca_tarde: null,
    sala: 1,
    justificativa: null,
  },
  {
    matricula: '2026001',
    data: '2026-06-03',
    presenca_manha: 'F',
    presenca_tarde: null,
    sala: 1,
    justificativa: null,
  },
  {
    matricula: '2026001',
    data: '2026-06-04',
    presenca_manha: 'FJ',
    presenca_tarde: null,
    sala: 1,
    justificativa: 'Atestado médico',
  },
];

const DIAS_NAO_LETIVOS_MOCK = [
  {
    id: 'uuid-feriado-1',
    data: '2026-06-05',
    descricao: 'Dia do Meio Ambiente',
  }
];

test.describe('Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/discente*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ALUNOS_MOCK) });
    });

    // Frequência geral (chamada ao entrar na aba Frequência)
    await page.route('**/frequenciadiscente', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FREQUENCIAS_MOCK) });
    });

    // Dias Não Letivos
    await page.route('**/dias-nao-letivos*', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DIAS_NAO_LETIVOS_MOCK) });
    });
  });

  test('deve carregar a página na visão de Desempenho', async ({ page }) => {
    await page.goto('/#/app/relatorios');

    await expect(page.locator('h2', { hasText: 'Relatórios' })).toBeVisible();
    await expect(
      page.locator('[class*="tr_body"]').filter({ hasText: 'Aluno Relatório' })
    ).toBeVisible();
  });

  test('deve exibir traço para avaliação nula no modo Desempenho', async ({ page }) => {
    await page.goto('/#/app/relatorios');

    // A última coluna (Psico.) deve exibir '-' para valor null
    const row = page.locator('tr[class*="tr_body"]').filter({ hasText: 'Aluno Relatório' });
    await expect(row).toBeVisible();
    // Psicológico é a 7ª coluna (índice 6)
    await expect(row.locator('td').nth(6)).toHaveText('-');
  });

  test('deve alternar para a aba Frequência e exibir filtros de mês e ano', async ({ page }) => {
    await page.goto('/#/app/relatorios');

    await page.locator('button', { hasText: 'Frequência' }).click();

    // Filtros de mês e ano aparecem
    await expect(page.locator('select').filter({ hasText: 'Janeiro' })).toBeVisible();
    await expect(page.locator('select').filter({ hasText: '2026' })).toBeVisible();

    // Tabela de frequência exibe o aluno
    await expect(page.locator('td', { hasText: 'Aluno Relatório' })).toBeVisible();
  });

  test('deve exibir P, F e FJ nas células corretas na visão de Frequência', async ({ page }) => {
    await page.goto('/#/app/relatorios');
    await page.locator('button', { hasText: 'Frequência' }).click();

    // Fixa mês/ano em Junho/2026: os dados mockados são desse período, mas a tela
    // abre por padrão no mês/ano corrente (varia com a data real), então sem isso
    // o teste quebra sozinho assim que o calendário sai de junho/2026.
    await page.locator('select').filter({ hasText: 'Janeiro' }).selectOption({ value: '5' });
    await page.locator('select').filter({ hasText: '2026' }).selectOption({ value: '2026' });

    const row = page.locator('tr[class*="tr_body"]').filter({ hasText: 'Aluno Relatório' });
    await expect(row).toBeVisible();

    // Junho de 2026 → dia 2 = Presença, dia 3 = Falta, dia 4 = Falta Justificada
    // Colunas: 0=Nome, 1=Matrícula, então dia N está na coluna 1+N
    await expect(row.locator('td').nth(3)).toHaveText('P');   // 02/06
    await expect(row.locator('td').nth(4)).toHaveText('F');   // 03/06
    await expect(row.locator('td').nth(5)).toHaveText('FJ');  // 04/06
  });

  test('deve exibir FDS e FER nos dias não letivos omitindo a presença', async ({ page }) => {
    await page.goto('/#/app/relatorios');
    await page.locator('button', { hasText: 'Frequência' }).click();

    // Mesmo motivo do teste anterior: fixa o mês/ano pra não depender da data real.
    await page.locator('select').filter({ hasText: 'Janeiro' }).selectOption({ value: '5' });
    await page.locator('select').filter({ hasText: '2026' }).selectOption({ value: '2026' });

    const row = page.locator('tr[class*="tr_body"]').filter({ hasText: 'Aluno Relatório' });
    await expect(row).toBeVisible();

    // Junho de 2026
    // 05/06 é Sexta, mas cadastramos como Feriado no MOCK!
    // 06/06 é Sábado e 07/06 é Domingo.
    await expect(row.locator('td').nth(6)).toHaveText('FER'); // 05/06
    await expect(row.locator('td').nth(7)).toHaveText('FDS'); // 06/06 (Sábado)
    await expect(row.locator('td').nth(8)).toHaveText('FDS'); // 07/06 (Domingo)
  });

  test('deve chamar o endpoint correto ao exportar frequência', async ({ page }) => {
    // Intercepta o export antes de navegar para capturar a requisição
    await page.route('**/frequenciadiscente/export*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from([]),
      });
    });

    await page.goto('/#/app/relatorios');
    await page.locator('button', { hasText: 'Frequência' }).click();

    const exportReq = page.waitForRequest(req => req.url().includes('/frequenciadiscente/export'));
    await page.locator('button', { hasText: 'Exportar' }).click();

    const req = await exportReq;
    expect(req.url()).toContain('mes=');
    expect(req.url()).toContain('ano=');
  });

  test('deve incluir o mês selecionado na URL de exportação de frequência', async ({ page }) => {
    await page.route('**/frequenciadiscente/export*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from([]),
      });
    });

    await page.goto('/#/app/relatorios');
    await page.locator('button', { hasText: 'Frequência' }).click();

    // Seleciona Agosto (índice 7 → backend recebe mes=8)
    await page.locator('select').filter({ hasText: 'Janeiro' }).selectOption({ value: '7' });

    const exportReq = page.waitForRequest(req => req.url().includes('/frequenciadiscente/export'));
    await page.locator('button', { hasText: 'Exportar' }).click();

    const req = await exportReq;
    expect(req.url()).toContain('mes=8');
  });
});
