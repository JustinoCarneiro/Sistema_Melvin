describe('Public Site - General Navigation', () => {
  beforeEach(() => {
    // Blocking Maps globally in support/e2e.js handles this, 
    // but we visit the URLs correctly here.
    cy.visit('/#/');
  });

  it('should load the home page with correct title', () => {
    cy.contains('h2', 'Instituto Melvin Huber').should('be.visible');
  });
  
  it('should navigate to "Mais Sobre Nós"', () => {
    cy.visit('/#/maissobrenos');
    cy.contains('h2', 'Instituto Melvin Huber').should('be.visible');
  });
  
  it('should navigate to "Embaixadores"', () => {
    cy.visit('/#/embaixadores');
    // Can match "Embaixadores" or "Embaixador do Melvin"
    cy.contains('h2', 'Embaixador').should('be.visible');
  });
});
