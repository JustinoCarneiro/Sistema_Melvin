describe('Diário de Acompanhamento', () => {
  beforeEach(() => {
    const role = 'ADM';
    const matricula = 'adm_test';
    const alunoMatricula = '20240001';
    
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute role check
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    // Mock student data
    cy.intercept('GET', `**/discente/matricula/${alunoMatricula}`, {
      statusCode: 200,
      body: { matricula: alunoMatricula, nome: 'Aluno Teste', status: 'true' }
    }).as('getAluno');

    // Mock existing diario
    cy.intercept('GET', `**/diarios/captura/${alunoMatricula}`, {
      statusCode: 200,
      body: { fileName: 'diario_existente.pdf', filePath: '/path/to/file' }
    }).as('getDiario');

    cy.visit(`/#/app/aluno/editar/${alunoMatricula}`);
    cy.wait(['@getAluno', '@getDiario']);
  });

  it('should show the existing diario filename', () => {
    cy.get('span[class*="filename"]').should('contain', 'diario_existente.pdf');
  });

  it('should allow downloading the diario', () => {
    cy.intercept('GET', '**/diarios/download/**', {
      statusCode: 200,
      body: 'file content'
    }).as('downloadDiario');

    cy.get('button[title="Baixar Diário"]').click();
    cy.wait('@downloadDiario');
  });

  it('should allow selecting a new file', () => {
    // Note: Testing actual drag-and-drop/upload is complex with mocks, 
    // but we can verify the element exists and is interactable.
    // Target the specific dropzone area, avoiding the wrapper
    cy.get('div[class*="_dropzone_"]').first().scrollIntoView().should('be.visible');
  });
});
