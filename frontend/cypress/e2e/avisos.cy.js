describe('Avisos (Notificações)', () => {
  beforeEach(() => {
    const role = 'ADM';
    const matricula = 'adm_test';
    
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute role check
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/aviso', {
      statusCode: 200,
      body: [
        { id: '1', titulo: 'Aviso Teste', corpo: 'Corpo do aviso', status: true, data_inicio: '2024-03-20' }
      ]
    }).as('getAvisos');

    cy.visit('/#/app/avisos');
    cy.wait('@getAvisos');
  });

  it('should list avisos', () => {
    cy.contains('Aviso Teste').should('be.visible');
  });

  it('should navigate to create aviso', () => {
    cy.contains('Criar novo aviso').click();
    cy.url().should('include', '/app/avisos/criar');
  });
});
