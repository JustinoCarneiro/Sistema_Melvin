// cypress/support/commands.js
Cypress.Commands.add('login', (role = 'ADM', matricula = '20247001') => {
  // Real signed JWT token (secret: integral-de-queijo) for subject 20247001
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjE3NzQwMzk2MjN9.DpNGfu9yEGHKxnhwIAMw2hlkk2fIbOqGh0jhcXbmSEc';
  cy.setCookie('token', token);
  cy.setCookie('role', role);
  cy.setCookie('login', matricula);
});
