describe('Voluntários Management', () => {
  const matricula = '20247001';
  const role = 'ADM';

  beforeEach(() => {
    cy.clearCookies();
    cy.login(role, matricula);
    
    // Override specific volunteers for this test
    cy.intercept('GET', '**/api/voluntario', {
      statusCode: 200,
      body: [{ matricula: 'V001', nome: 'Voluntário 1', status: 'true', funcao: 'professor' }]
    }).as('getVoluntarios');
  });

  it('should list volunteers', () => {
    cy.visit('/#/app/voluntarios');
    cy.wait('@getVoluntarios');
    cy.get('tr[class*="tr_body"]').should('contain', 'Voluntário 1');
  });
});
