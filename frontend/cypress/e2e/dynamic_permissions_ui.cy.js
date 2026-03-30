describe('Dynamic Permissions UI Logic', () => {
  const MATRICULA = '20247001'; 

  const mockAlunos = [
    { matricula: '2026001', nome: 'João Silva', status: 'true', sala: 1, turno: 'manha' }
  ];

  const setupMocks = (role, permissions = []) => {
    cy.clearCookies();
    cy.login(role, MATRICULA);
    
    // Intercepts
    cy.intercept('GET', '**/auth/role_*', { statusCode: 200, body: role }).as('roleMock');
    cy.intercept('GET', '**/api/permissoes/minhas*', { statusCode: 200, body: permissions }).as('getMyPermissions');
    cy.intercept('GET', '**/api/discente/2026001', { statusCode: 200, body: { ...mockAlunos[0], avaliacaoPresenca: 5, avaliacaoPsicologico: 3 } }).as('getAlunoDetails');
    cy.intercept('GET', '**/api/discente*', { statusCode: 200, body: mockAlunos }).as('getAlunos');
    cy.intercept('GET', '**/api/voluntario/matricula/*', { statusCode: 200, body: { matricula: MATRICULA, nome: 'Test User', salaUm: '1', salaDois: '2' } }).as('getVoluntario');
  };

  const verifyNoRedirect = () => {
    cy.url().should('not.include', '/login');
  };

  describe('Administrator Profile (ADM)', () => {
    beforeEach(() => {
      setupMocks('ADM', []); 
    });

    it('should see all management actions and navigation', () => {
      cy.visit('/#/app/alunos');
      verifyNoRedirect();
      cy.contains('João Silva', { timeout: 15000 }).should('be.visible');
      cy.contains('Adicionar novo aluno').should('be.visible');
      cy.get('[class*="icon_editar"]').should('be.visible');
      cy.get('[class*="icon_rendimento"]').should('be.visible');
    });

    it('should have all fields editable on Rendimento page', () => {
      cy.visit('/#/app/rendimento_aluno/2026001');
      verifyNoRedirect();
      cy.contains('Salvar Avaliações', { timeout: 15000 }).should('be.visible');
      cy.contains('Apenas Leitura').should('not.exist');
    });
  });

  describe('Professor Profile (Limited Permissions)', () => {
    it('should show only Rendimento if granted EDITAR_RENDIMENTO but NOT CADASTRAR_ALUNO', () => {
      setupMocks('PROF', ['EDITAR_RENDIMENTO']);
      cy.visit('/#/app/alunos');
      verifyNoRedirect();
      cy.contains('João Silva', { timeout: 15000 }).should('be.visible');
      cy.get('[class*="icon_rendimento"]').should('be.visible');
      cy.contains('Adicionar novo aluno').should('not.exist');
      cy.get('[class*="icon_editar"]').should('not.exist');
    });

    it('should restrict specific cards on Rendimento according to permissions', () => {
      setupMocks('PROF', ['EDITAR_RENDIMENTO']);
      cy.visit('/#/app/rendimento_aluno/2026001');
      verifyNoRedirect();
      cy.contains('Presença', { timeout: 15000 }).should('be.visible');
      cy.contains('Presença').closest('[class*="card"]').should('not.contain', 'Apenas Leitura');
      cy.contains('Avaliação Psicológica').closest('[class*="card"]').should('contain', 'Apenas Leitura');
    });

    it('should hide Export button on Relatórios if permission missing', () => {
      setupMocks('PROF', ['VISUALIZAR_RELATORIOS']); 
      cy.visit('/#/app/relatorios');
      verifyNoRedirect();
      cy.contains('Relatórios', { timeout: 15000 }).should('be.visible');
      cy.get('button').contains('Exportar').should('not.exist');
    });
  });

  describe('Profile with NO Permissions', () => {
    it('should hide sensitive UI elements even if authenticated', () => {
      setupMocks('PROF', []); 
      cy.visit('/#/app/alunos');
      verifyNoRedirect();
      cy.contains('João Silva', { timeout: 15000 }).should('be.visible');
      cy.contains('Adicionar novo aluno').should('not.exist');
      cy.get('[class*="icon_editar"]').should('not.exist');
      cy.get('[class*="icon_rendimento"]').should('not.exist');
    });
  });
});
