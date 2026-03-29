describe('Discentes Management', () => {
  const matricula = '20247001';
  const role = 'ADM';

  beforeEach(() => {
    cy.clearCookies();
    cy.login(role, matricula);
    
    // Safety mock for role check
    cy.intercept('GET', '**/auth/role_*', { statusCode: 200, body: role }).as('roleMock');
    
    // Override specific students for this test
    cy.intercept('GET', '**/api/discente', {
      statusCode: 200,
      body: [{ matricula: '2026001', nome: 'João Silva', status: 'true', sala: 1, turno: 'manha' }]
    }).as('getAlunos');
  });

  it('should list students', () => {
    cy.visit('/#/app/alunos');
    cy.wait('@getAlunos');
    cy.get('[class*="tr_body"], [class*="card_body"]').should('contain', 'João Silva');
  });
});
