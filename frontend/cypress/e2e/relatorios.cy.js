describe('Relatórios (Reporting)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    cy.setCookie('token', 'fake_token');
    cy.setCookie('role', role);
    cy.setCookie('login', matricula);

    // Mock for PrivateRoute
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/discente', {
      statusCode: 200,
      body: [{ matricula: '20240001', nome: 'Aluno Relatório', status: 'true' }]
    }).as('getAlunos');
  });

  it('should load reports page', () => {
    cy.visit('/#/app/relatorios');
    cy.wait('@getAlunos');
    cy.get('h2').contains('Relatórios').should('be.visible');
    cy.get('tr.tr_body').should('contain', 'Aluno Relatório');
  });
});
