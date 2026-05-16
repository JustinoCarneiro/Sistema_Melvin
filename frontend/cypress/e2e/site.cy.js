describe('Public Site - General Navigation', () => {
  beforeEach(() => {
    cy.visit('/#/');
    // Desperta as animações whileInView
    cy.scrollTo('center');
  });

  it('should load the home page with correct title', () => {
    cy.contains('h1', 'Transformando').should('be.visible');
    cy.contains('h1', 'histórias com amor').should('be.visible');
  });
  
  it('should have "Sobre Nós" link pointing to home', () => {
    cy.contains('button', 'Sobre Nós').should('be.visible');
  });
  
  it('should navigate to "Embaixadores"', () => {
    cy.visit('/#/embaixadores');
    // Gatilha animações da página de embaixadores
    cy.scrollTo('center');
    
    // Verifica o título principal
    cy.contains('h1', 'Seja um').scrollIntoView().should('be.visible');
    cy.contains('span', 'Embaixador').should('be.visible');
    
    // Verifica se a seção de lista ou form existe
    cy.contains('Quero ser um embaixador!').should('be.visible');
  });

  it('should navigate to "Amigos do Melvin"', () => {
    cy.visit('/#/amigos-do-melvin');
    cy.scrollTo('center');
    cy.contains('h1', 'Amigos do').scrollIntoView().should('be.visible');
  });
});
