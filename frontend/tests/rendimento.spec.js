import { test, expect } from './fixtures';

// Decisão do Instituto (14/10/2026): a nota psicológica só é entregue a Psicologia e Coordenação.
// Para os demais cargos a API omite a chave `avaliacaoPsicologico`, e a tela não mostra a linha.
const ALUNO_SEM_NOTA_PSICOLOGICA = {
  matricula: '2026001',
  nome: 'Aluno Rendimento',
  sala: 1,
  turno: 'manha',
  avaliacaoPresenca: 8,
  avaliacaoParticipacao: 7,
  avaliacaoComportamento: 9,
  avaliacaoRendimento: 6,
};

const ALUNO_COM_NOTA_PSICOLOGICA = { ...ALUNO_SEM_NOTA_PSICOLOGICA, avaliacaoPsicologico: 4 };

const CATEGORIAS_PEDAGOGICAS = ['Presença', 'Participação', 'Comportamento', 'Rendimento Escolar'];

test.describe('Rendimento do aluno', () => {
  async function abrirRendimento(page, aluno, chamadasDeSalvar = []) {
    await page.route('**/discente/matricula/2026001', route => {
      if (route.request().url().includes('.js')) return route.continue();
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(aluno) });
    });
    await page.route('**/discente/2026001/avaliacoes', route => {
      chamadasDeSalvar.push(route.request().postDataJSON());
      route.fulfill({ status: 200, body: 'Avaliações atualizadas com sucesso.' });
    });

    await page.goto('/#/app/rendimento_aluno/2026001');
    await expect(page.getByRole('heading', { name: 'Rendimento', exact: true })).toBeVisible();
  }

  test('sem a nota psicológica na resposta, a linha "Avaliação Psicológica" não aparece', async ({ page }) => {
    await abrirRendimento(page, ALUNO_SEM_NOTA_PSICOLOGICA);

    for (const categoria of CATEGORIAS_PEDAGOGICAS) {
      await expect(page.getByRole('heading', { name: categoria, exact: true })).toBeVisible();
    }
    await expect(page.getByText('Avaliação Psicológica')).toHaveCount(0);
  });

  test('com a nota psicológica na resposta (Psicologia e Coordenação), a linha aparece', async ({ page }) => {
    await abrirRendimento(page, ALUNO_COM_NOTA_PSICOLOGICA);

    await expect(page.getByRole('heading', { name: 'Avaliação Psicológica', exact: true })).toBeVisible();
  });

  test('nota psicológica ainda não lançada (nula) continua visível para quem a recebe', async ({ page }) => {
    await abrirRendimento(page, { ...ALUNO_SEM_NOTA_PSICOLOGICA, avaliacaoPsicologico: null });

    await expect(page.getByRole('heading', { name: 'Avaliação Psicológica', exact: true })).toBeVisible();
  });

  test('ao salvar sem ver a nota psicológica, o envio não leva a nota psicológica', async ({ page }) => {
    const chamadasDeSalvar = [];
    await abrirRendimento(page, ALUNO_SEM_NOTA_PSICOLOGICA, chamadasDeSalvar);

    // O alert de sucesso precisa ser aceito dentro do próprio evento; um accept() posterior corre
    // contra o fechamento automático do diálogo e pode ficar pendurado.
    const avisoAceito = new Promise(resolve => {
      page.on('dialog', async dialog => {
        await dialog.accept();
        resolve();
      });
    });
    await page.getByRole('button', { name: 'Salvar Avaliações' }).click();
    await avisoAceito;

    expect(chamadasDeSalvar).toHaveLength(1);
    expect(chamadasDeSalvar[0]).toMatchObject({ avaliacaoRendimento: 6 });
    expect(Object.keys(chamadasDeSalvar[0])).not.toContain('avaliacaoPsicologico');
  });
});
