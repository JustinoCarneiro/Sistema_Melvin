describe('Operational Modules (Avisos & Cestas)', () => {
  beforeEach(() => {
    const matricula = 'adm_test';
    const role = 'ADM';
    
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock for PrivateRoute
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    cy.intercept('GET', '**/aviso', {
      statusCode: 200,
      body: [{ id: 1, titulo: 'Aviso Teste', status: true, data_inicio: '2024-01-01', data_final: '2024-12-31' }]
    }).as('getAvisos');

    cy.intercept('GET', '**/cestas', {
      statusCode: 200,
      body: [{ id: 1, nome: 'Recebedor 1', tipo: 'ALIMENTO', operacao: 'SAIDA', peso: 10, dataEntrega: '2024-03-20' }]
    }).as('getCestas');
  });

  it('should manage avisos', () => {
    cy.visit('/#/app/avisos');
    cy.wait('@getAvisos');
    cy.get('[class*="tr_body"], [class*="card_body"]').should('contain', 'Aviso Teste');
  });

  it('should manage cestas', () => {
    cy.visit('/#/app/cestas');
    cy.wait('@getCestas');
    cy.get('[class*="tr_body"], [class*="card_body"]').should('contain', 'Recebedor 1');
  });
});
