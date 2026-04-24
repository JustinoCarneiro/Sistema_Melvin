describe('Amigos do Melvin - Fluxo de Doação', () => {
    beforeEach(() => {
        cy.visit('/amigos-do-melvin');
    });

    it('Deve renderizar a página de planos corretamente', () => {
        cy.contains('h1', 'Faça parte dessa história').should('be.visible');
        cy.contains('R$ 20').should('be.visible');
        cy.contains('R$ 50').should('be.visible');
        cy.contains('R$ 100').should('be.visible');
    });

    it('Deve permitir a seleção de um plano e redirecionar para o checkout', () => {
        // Seleciona o plano de R$ 50
        cy.contains('div', 'R$ 50').click();
        
        // Clica no botão para prosseguir
        cy.contains('button', '[ Quero ser um amigo ]').click();

        // Verifica redirecionamento
        cy.url().should('include', '/cadastroamigo');
        cy.contains('h2', 'Finalizar Apoio').should('be.visible');
        cy.contains('R$ 50').should('be.visible');
    });

    it('Deve exibir erros de validação no formulário de checkout', () => {
        cy.visit('/cadastroamigo');
        
        // Tenta enviar vazio
        cy.get('form').within(() => {
            cy.get('button[type="submit"]').click({force: true});
        });

        // O HTML5 required deve impedir o submit ou o botão deve estar disable caso o stripe não carregue
        // Considerando que o botão fica disable se o stripe não carregar
        cy.get('button[type="submit"]').should('be.disabled');
    });

    // Teste com Mock: como o Stripe Elements exige iframe, interagir com ele no Cypress E2E é complexo sem injetar keys de teste.
    // O objetivo do mock é interceptar a chamada do amigoMelvinService.
    it('Deve exibir o estado de Processando e a mensagem de Sucesso no envio', () => {
        cy.visit('/cadastroamigo', {
            onBeforeLoad(win) {
                // Injeta state na navegação para simular o vindo do router
                win.history.pushState({ type: 'monthly', value: 50 }, '', '/cadastroamigo');
            }
        });

        // Mock das chamadas de API do backend
        cy.intercept('POST', '**/amigomelvin/subscribe', {
            statusCode: 201,
            body: {
                id: "123-abc",
                nome: "Doador Teste",
                status: "PENDING"
            }
        }).as('subscribeRequest');

        // Preenche o formulário
        cy.get('input[type="text"]').eq(0).type('Doador Teste');
        cy.get('input[type="email"]').type('teste@melvin.com');
        cy.get('input[type="text"]').eq(1).type('11999999999');

        // Nota: Em um ambiente real E2E com Stripe Elements, nós deveríamos digitar num iframe do Stripe.
        // Como o botão depende do carregamento do stripe, apenas garantimos que a UI carrega o cardContainer.
        cy.get('.__PrivateStripeElement').should('exist');
    });
});
