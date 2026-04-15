describe('Frequências (Attendance)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/discente', {
      statusCode: 200,
      body: [
        { matricula: '2026001', nome: 'Aluno 1', status: 'true', sala: 1, turno: 'manha' },
        { matricula: '2026002', nome: 'Aluno 1', status: 'true', sala: 1, turno: 'tarde' }
      ]
    }).as('getAlunos');
    
    // Global dashboard mocks
    cy.intercept('GET', '**/dashboard/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/frequenciadiscente/**', { statusCode: 200, body: [] }).as('getFreq');
    cy.intercept('GET', '**/frequenciadiscente/alertas-faltas*', {
      statusCode: 200,
      body: [{ matricula: '2026001', quantidade: 5 }]
    }).as('getAlertas');
  });

  it('should register student attendance and show alerts', () => {
    cy.visit('/#/app/frequencias/alunos');
    cy.wait(['@getAlunos', '@getAlertas']);
    
    // Verify alert exists for the student with 5 absences
    cy.get('[class*="tr_body"]').first().within(() => {
      cy.get('[title*="5 faltas"]').should('be.visible').within(() => {
        cy.contains('5').should('be.visible');
      });
      cy.get('select').select('P');
    });
    
    cy.intercept('**/frequenciadiscente', { statusCode: 200 }).as('saveFreq');
    cy.get('button').contains('Salvar Chamada').click();
    cy.wait('@saveFreq');
  });
});
