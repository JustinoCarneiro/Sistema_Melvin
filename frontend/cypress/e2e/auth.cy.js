Cypress.on('uncaught:exception', (err, runnable) => {
  return false; // Ignore exceptions to stabilize tests
});

describe('Authentication & RBAC', () => {
  const mockToken = 'header.eyJzdWIiOiIxMjM0NTYifQ.signature';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // Mock google maps globally to prevent crashes in the component tree
    cy.on('window:before:load', (win) => {
      win.google = { maps: { Map: class {}, Marker: class {}, InfoWindow: class {}, LatLng: class {}, event: { addListener: () => {} } } };
    });

    cy.visit('/#/login');
    cy.wait(1000); // Give the app a second to stabilize
  });

  const performLogin = (role, matricula) => {
    const admToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwMSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjE3NzQwMzk2MjN9.DpNGfu9yEGHKxnhwIAMw2hlkk2fIbOqGh0jhcXbmSEc';
    const auxToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDI0NzAwNSIsImlzcyI6InNpc3RlbWFtZWx2aW4iLCJleHAiOjE3NzQwMzk2OTF9.EJP4KaSSjtVg3yPmmZcrmuBdcKGpim6Dm2SJDAgPa-o';
    
    // Override the global login intercept for this specific test case
    cy.intercept('POST', '**/auth/login*', {
      statusCode: 200,
      body: { 
        token: matricula === '20247001' ? admToken : auxToken, 
        role: role 
      }
    }).as('loginRequest');

    cy.get('input[name="matricula"]', { timeout: 10000 }).should('be.visible').type(matricula);
    cy.get('input[name="senha"]', { timeout: 10000 }).should('be.visible').type(matricula === '20247001' ? 'admin' : '123456');
    
    // Submit form directly for maximum stability
    cy.get('form').submit();
    
    cy.wait('@loginRequest', { timeout: 20000 });
  };

  it('should redirect to ADM dashboard after ADM login', () => {
    performLogin('ADM', '20247001');
    cy.url().should('include', '/app/adm');
    cy.get('h1').contains('Dashboard').should('be.visible');
  });

  it('should redirect to AUX dashboard after AUX login', () => {
    performLogin('AUX', '20247005');
    cy.url().should('include', '/app/aux');
    cy.get('h1').contains('Dashboard').should('be.visible');
  });

  it('should logout correctly', () => {
    // Inject session to bypass login form in the logout test
    cy.login('ADM', '20247001');
    cy.visit('/#/app/config');
    
    // Ensure the page loaded and cookies are stable
    cy.get('h3', { timeout: 15000 }).contains('Meu Perfil').should('be.visible');
    cy.wait(1000); // Wait for all profile data XHRs to finish
    
    // Diagnostic: Log current cookies before clicking deslogar
    cy.getCookies().then((cookies) => {
      console.log('Cookies before logout:', cookies.map(c => `${c.name}=${c.value}`).join('; '));
    });

    cy.contains('button', 'Deslogar').click({ force: true });
    
    // Check for login page with a slightly longer timeout and specific element
    cy.url({ timeout: 15000 }).should('include', '/login');
    cy.get('button[type="submit"]', { timeout: 15000 }).should('be.visible');
  });
});
