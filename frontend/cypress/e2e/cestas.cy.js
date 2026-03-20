describe('Cestas (Doações)', () => {
  beforeEach(() => {
    const role = 'ADM';
    const matricula = 'adm_test';
    
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute role check
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    // Mock the initial list
    cy.intercept('GET', '**/cestas', {
      statusCode: 200,
      body: [
        { id: '1', nome: 'Doador 1', cpf: '123', contato: '123', operacao: 'Doação', tipo: 'Alimento', dataEntrega: '2024-03-20' }
      ]
    }).as('getCestas');

    cy.visit('/#/app/cestas');
    cy.wait('@getCestas');
  });

  it('should list cestas correctly', () => {
    cy.get('table').should('be.visible');
    cy.contains('Doador 1').should('be.visible');
  });

  it('should allow searching for a cesta', () => {
    cy.get('input[placeholder*="Buscar"]').type('Doador 1');
    cy.contains('Doador 1').should('be.visible');
  });

  it('should navigate to creation form', () => {
    cy.contains('Novo Registro').click();
    cy.url().should('include', '/app/cestas/criar');
  });
});
