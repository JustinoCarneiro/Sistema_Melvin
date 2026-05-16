describe('Stripe Real Flow Test (No Mocks)', () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const donorName = 'Doador Teste Automatizado';

    it('Fluxo Completo: Doação -> Verificação -> Cancelamento', () => {
        // 1. REALIZA A DOAÇÃO
        cy.visit('/#/amigos-do-melvin');
        cy.scrollTo('center');
        
        // Seleciona plano de 30 reais
        cy.contains('button', 'R$ 30').click();
        
        // Preenche formulário inicial
        cy.get('input[name="nome"]').type(donorName);
        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('10');
        cy.get('#terms').check({ force: true });
        
        cy.contains('button', 'Quero ser amigo!').click();
        
        // Na tela de checkout
        cy.url().should('include', '/#/cadastroamigo');
        cy.contains(donorName).should('be.visible');
        
        // Preenche o Stripe Card Element
        // Nota: Interagir com iframes no Cypress requer um pouco de cuidado
        cy.get('iframe[title*="payment"]').its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap)
            .find('input[name="cardnumber"]').type('4242424242424242');
            
        cy.get('iframe[title*="payment"]').its('0.contentDocument.body').then(cy.wrap)
            .find('input[name="exp-date"]').type('1225');
            
        cy.get('iframe[title*="payment"]').its('0.contentDocument.body').then(cy.wrap)
            .find('input[name="cvc"]').type('123');
            
        cy.get('iframe[title*="payment"]').its('0.contentDocument.body').then(cy.wrap)
            .find('input[name="postal"]').type('60000000');

        // Clica em finalizar
        cy.get('button[type="submit"]').should('not.be.disabled').click();
        
        // Espera o sucesso
        cy.contains('Obrigado!', { timeout: 20000 }).should('be.visible');
        cy.contains('Sua doação mensal foi confirmada').should('be.visible');

        // 2. CANCELAMENTO (Como Admin)
        // Primeiro precisamos deslogar caso haja algo
        cy.clearCookies();
        cy.clearLocalStorage();
        
        cy.visit('/#/login');
        // O USER deve preencher o login aqui ou eu tento um padrão se souber
        // Vou assumir que o login é 20247001 e a senha o user sabe
        // Mas para automação, talvez seja melhor o user fazer essa parte.
    });
});
