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
    cy.intercept('GET', '**/api/voluntario', { statusCode: 200, body: [{ matricula: '1001', nome: 'Voluntário Teste', status: 'true', funcao: 'professor' }] }).as('getVoluntarios');
    cy.intercept('GET', '**/api/cestas', { statusCode: 200, body: [] }).as('getCestas');
    cy.intercept('GET', '**/frequenciadiscente/alertas-faltas*', { statusCode: 200, body: [] }).as('getAlertasGlobal');
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

  describe('Professor Profile - Comprehensive Permission Toggle', () => {
    const allPermissions = [
      'VISUALIZAR_ALUNOS', 'CADASTRAR_ALUNO', 'EDITAR_RENDIMENTO', 
      'GERENCIAR_VOLUNTARIOS', 'GERENCIAR_CESTAS', 'GERENCIAR_AMIGOS', 
      'GERENCIAR_EMBAIXADORES', 'GERENCIAR_AVISOS', 'VISUALIZAR_RELATORIOS',
      'ADMINISTRATIVO'
    ];

    it('should show ALL modules and actions when FULL permissions granted', () => {
      setupMocks('PROF', allPermissions);
      
      // Check NavBar (must open it first if it's mobile/collapsed, but here we assume it's visible or we visit directly)
      cy.visit('/#/app/alunos');
      verifyNoRedirect();

      // Check Alunos actions
      cy.contains('Adicionar novo aluno').should('be.visible');
      cy.get('[class*="icon_editar"]').should('be.visible');
      cy.get('[class*="icon_rendimento"]').should('be.visible');

      // Check Voluntários
      cy.visit('/#/app/voluntarios');
      verifyNoRedirect();
      cy.contains('Voluntários').should('be.visible');
      cy.contains('Adicionar novo integrante').should('be.visible');

      // Check Cestas
      cy.visit('/#/app/cestas');
      verifyNoRedirect();
      cy.contains('Fluxo de Doações').should('be.visible');
      cy.contains('Novo Registro').should('be.visible');

      // Check Relatórios Export
      cy.visit('/#/app/relatorios');
      cy.get('button').contains('Exportar').should('be.visible');
    });

    it('should hide ALL modules and actions when NO permissions granted', () => {
      setupMocks('PROF', []);
      
      // Visit Alunos (base access)
      cy.visit('/#/app/alunos');
      verifyNoRedirect();

      // Actions should be hidden
      cy.contains('Adicionar novo aluno').should('not.exist');
      cy.get('[class*="icon_editar"]').should('not.exist');
      cy.get('[class*="icon_rendimento"]').should('not.exist');

      // Voluntários should redirect or show access denied if we visit directly
      // But since PrivateRoute uses perfisEquipe, it will allow the visit but the component will be empty or hide actions
      cy.visit('/#/app/voluntarios');
      cy.contains('Adicionar novo integrante').should('not.exist');
      cy.get('[class*="icon_editar"]').should('not.exist');
    });
  });
});
