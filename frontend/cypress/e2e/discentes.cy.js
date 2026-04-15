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

    cy.intercept('GET', '**/frequenciadiscente/alertas-faltas*', {
      statusCode: 200,
      body: [{ matricula: '2026001', quantidade: 4 }]
    }).as('getAlertas');
  });

  it('should list students and show absence alerts', () => {
    cy.visit('/#/app/alunos');
    cy.wait(['@getAlunos', '@getAlertas']);
    
    // Check for correct student name
    cy.get('[class*="tr_body"]').should('contain', 'João Silva');

    // Check for alert icon and count via title attribute
    cy.get('[title*="4 faltas"]').should('be.visible').within(() => {
        cy.contains('4').should('be.visible');
    });
  });
});
