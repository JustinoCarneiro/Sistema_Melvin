describe('Frequências (Attendance)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    cy.setCookie('token', 'fake_token');
    cy.setCookie('role', role);
    cy.setCookie('login', matricula);

    // Mock for PrivateRoute
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/discente', {
      statusCode: 200,
      body: [{ matricula: '20240001', nome: 'Aluno 1', status: 'true', sala: 1, turno: 'manha' }]
    }).as('getAlunos');
    
    // Global dashboard mocks
    cy.intercept('GET', '**/dashboard/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/frequenciadiscente/**', { statusCode: 200, body: [] }).as('getFreq');
  });

  it('should register student attendance', () => {
    cy.visit('/#/app/frequencias/alunos');
    cy.wait('@getAlunos');
    
    cy.get('tr.tr_body').should('contain', 'Aluno 1');
    cy.get('select').first().select('P');
    
    cy.intercept('POST', '**/frequenciadiscente', { statusCode: 200 }).as('saveFreq');
    cy.get('button').contains('Salvar Chamada').click();
    cy.wait('@saveFreq');
  });
});
