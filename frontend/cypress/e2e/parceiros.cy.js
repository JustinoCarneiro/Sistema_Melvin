describe('Partners (Embaixadores & Amigos)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    // Clear cookies and use the global login command
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute with the specific test matricula
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/embaixador', {
      statusCode: 200,
      body: [{ id: 1, nome: 'Embaixador 1', instagram: '@instateste', contato: '123456', email: 'teste@teste.com', status: true }]
    }).as('getEmbaixadores');

    cy.intercept('GET', '**/amigomelvin', {
      statusCode: 200,
      body: [{ id: 1, nome: 'Amigo 1', contato: '654321', email: 'amigo@teste.com', status: true }]
    }).as('getAmigos');
  });

  it('should list partners', () => {
    cy.visit('/#/app/embaixadores');
    cy.wait('@getEmbaixadores');
    cy.get('[class*="tr_body"], [class*="card_body"]').should('contain', 'Embaixador 1');
  });
});
