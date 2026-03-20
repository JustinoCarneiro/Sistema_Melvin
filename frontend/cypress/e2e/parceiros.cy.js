describe('Partners (Embaixadores & Amigos)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    cy.setCookie('token', 'fake_token');
    cy.setCookie('role', role);
    cy.setCookie('login', matricula);

    // Mock for PrivateRoute
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/embaixador', {
      statusCode: 200,
      body: [{ id: 1, nome: 'Embaixador 1', status: true }]
    }).as('getEmbaixadores');

    cy.intercept('GET', '**/amigomelvin', {
      statusCode: 200,
      body: [{ id: 1, nome: 'Amigo 1', status: true }]
    }).as('getAmigos');
  });

  it('should list partners', () => {
    cy.visit('/#/app/embaixadores');
    cy.wait('@getEmbaixadores');
    cy.get('tr.tr_body').should('contain', 'Embaixador 1');
  });
});
