describe('Login Flow Exceptions', () => {
  beforeEach(() => {
    cy.visit('/#/login');
  });

  it('should show error message with invalid credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Matrícula ou senha incorreta' }
    }).as('loginFail');

    cy.get('input[name="matricula"]').type('wrong');
    cy.get('input[name="senha"]').type('wrong');
    cy.get('form').submit();

    cy.wait('@loginFail');
    cy.get('p').contains('incorrect').should('be.visible'); // Partial match for language flexibility
  });
});
