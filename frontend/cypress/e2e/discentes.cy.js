describe('Discentes Management', () => {
  const matricula = '20247001';
  const role = 'ADM';

  beforeEach(() => {
    cy.clearCookies();
    cy.login(role, matricula);
    
    // Override specific students for this test
    cy.intercept('GET', '**/api/discente', {
      statusCode: 200,
      body: [{ matricula: '20240001', nome: 'João Silva', status: 'true', sala: 1, turno: 'manha' }]
    }).as('getAlunos');
  });

  it('should list students', () => {
    cy.visit('/#/app/alunos');
    cy.wait('@getAlunos');
    cy.get('tr[class*="tr_body"]').should('contain', 'João Silva');
  });
});
