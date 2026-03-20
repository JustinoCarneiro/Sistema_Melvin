// cypress/support/e2e.js
import './commands'

// Ignore uncaught exceptions from third-party scripts (like Google Maps "digest" error)
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('digest')) {
    return false
  }
  // Allow other errors to fail the test
})

// Block Google Maps script to avoid crashes in non-secure context
beforeEach(() => {
  // Pre-emptive block for Google Maps to prevent "digest" errors and crashes
  cy.intercept('GET', 'https://maps.googleapis.com/**', { statusCode: 200, body: '' }).as('blockMaps');

  // Hardened Global API Intercepts using broad glob patterns
  // This ensures no requests leak to the real backend even with relative paths
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: { 
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJpc3MiOiJzaXN0ZW1hbWVsdmluIn0.signature', 
      role: 'ADM' 
    }
  }).as('loginRequest');

  // Unified role request intercept
  cy.intercept('GET', '**/api/auth/role_*', { 
    statusCode: 200, 
    body: 'ADM' 
  }).as('roleRequest');
  
  // Auth / Login calls (Global to ensure it's always ready)
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: { 
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjE3NzQwMzk2MjN9.DpNGfu9yEGHKxnhwIAMw2hlkk2fIbOqGh0jhcXbmSEc', 
      role: 'ADM' 
    }
  }).as('loginRequest');

  // Profile/User info calls
  cy.intercept('GET', '**/api/voluntario/matricula/*', {
    statusCode: 200,
    body: { matricula: '20247001', nome: 'Mock User', funcao: 'administrador' }
  }).as('profileRequest');

  // Other common endpoints
  cy.intercept('GET', '**/api/dashboard/**', { statusCode: 200, body: [] }).as('dashboardRequest');
  cy.intercept('GET', '**/api/frequenciadiscente/**', { statusCode: 200, body: {} }).as('freqRequest');
  cy.intercept('GET', '**/api/aviso', { statusCode: 200, body: [] }).as('avisoRequest');
});
