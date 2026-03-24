describe('Config & Profile', () => {
  beforeEach(() => {
    const matricula = '20247001';
    const role = 'ADM';
    
    cy.login(role, matricula);
    
    // Mock for PrivateRoute RBAC check
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    // Override specific profile for this test
    cy.intercept('GET', '**/api/voluntario/matricula/*', {
      statusCode: 200,
      body: { matricula: matricula, nome: 'Admin User', email: 'admin@melvin.org', funcao: 'administrador' }
    }).as('getProfile');
  });

  it('should display profile information', () => {
    cy.visit('/#/app/config');
    cy.wait('@getProfile');
    cy.get('h3').contains('Meu Perfil').should('be.visible');
    cy.get('span').contains('Admin User').should('be.visible');
  });

  it('should allow marking auto-frequency', () => {
    cy.visit('/#/app/config');
    cy.wait('@getProfile');
    cy.get('select[name="presenca_manha"]').should('exist').select('P');
    
    cy.intercept('POST', /\/frequenciavoluntario/, { statusCode: 200 }).as('saveAutoFreq');
    cy.get('button').contains('Confirmar Presença').click();
    cy.wait('@saveAutoFreq');
  });
});
