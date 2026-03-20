describe('Public Site - General Navigation', () => {
  beforeEach(() => {
    // Blocking Maps globally in support/e2e.js handles this, 
    // but we visit the URLs correctly here.
    cy.visit('/#/');
  });

  it('should load the home page with correct title', () => {
    // Note: Home page might take time to load if it still tries to contact maps
    cy.get('h1').contains('Dashboard').should('not.exist'); // Sanity check
    cy.contains('h1', 'Instituto Melvin').should('be.visible');
  });

  it('should navigate to "Mais Sobre Nós"', () => {
    cy.visit('/#/maissobrenos');
    cy.get('h2').contains('Sobre Nós').should('be.visible');
  });

  it('should navigate to "Embaixadores"', () => {
    cy.visit('/#/embaixadores');
    cy.get('h2').contains('Embaixadores').should('be.visible');
  });
});
