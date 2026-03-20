describe('Public Navigation', () => {
  beforeEach(() => {
    cy.visit('/#/');
  });

  it('should load the home page', () => {
    cy.url().should('eq', Cypress.config().baseUrl + '/#/');
    // Verificando se o header ou footer existe para confirmar carregamento
    cy.get('header').should('exist');
    cy.get('footer').should('exist');
  });

  it('should navigate to "Mais Sobre Nós"', () => {
    cy.visit('/#/maissobrenos');
    cy.url().should('include', '/#/maissobrenos');
  });

  it('should navigate to "Embaixadores"', () => {
    cy.visit('/#/embaixadores');
    cy.url().should('include', '/#/embaixadores');
  });

  it('should navigate to "Amigos Melvin"', () => {
    cy.visit('/#/amigosmelvin');
    cy.url().should('include', '/#/amigosmelvin');
  });

  it('should navigate to "Doações"', () => {
    cy.visit('/#/doacoes');
    cy.url().should('include', '/#/doacoes');
  });
});
