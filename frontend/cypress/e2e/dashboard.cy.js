describe('Dashboard Alerts', () => {
  const matricula = 'adm_test';
  const role = 'ADM';

  beforeEach(() => {
    cy.clearCookies();
    cy.login(role, matricula);

    // Mock constants
    const mockRanking = [
      { matricula: '2026001', nome: 'Aluno Crítico', mediaGeral: 4.5 }
    ];
    const mockAlertas = [
      { matricula: '2026001', quantidade: 6 }
    ];

    // Intercepts
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });
    cy.intercept('GET', '**/dashboard/ranking*', { statusCode: 200, body: mockRanking });
    cy.intercept('GET', '**/dashboard/avisos', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/frequenciadiscente/alertas-faltas*', { statusCode: 200, body: mockAlertas }).as('getAlertas');
    cy.intercept('GET', '**/frequenciadiscente/2026*', { statusCode: 200, body: [] });
  });

  it('should display the excessive absences card with correct data', () => {
    cy.visit('/#/app/adm');
    cy.wait('@getAlertas');

    // Check if the specific card exists
    cy.contains('h3', 'Faltas Excessivas').should('be.visible');

    // Verify student name and absence count count badge
    cy.get('li').contains('Aluno Crítico').should('be.visible');
    cy.contains('6 faltas').should('be.visible');
  });
});
