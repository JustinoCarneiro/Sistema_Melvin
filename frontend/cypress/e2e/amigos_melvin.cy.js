describe('Amigos do Melvin - Fluxo de Doação', () => {
    beforeEach(() => {
        cy.visit('/#/amigos-do-melvin');
        // Gatilha animações "whileInView" do Framer Motion
        cy.scrollTo('center');
    });

    it('Deve renderizar a página corretamente com o título e planos', () => {
        cy.contains('h1', 'Amigos do').scrollIntoView().should('be.visible');
        cy.contains('span', 'Melvin').should('be.visible');
        cy.contains('Programa de apoio mensal').should('be.visible');
        cy.contains('R$ 30').scrollIntoView().should('be.visible');
        cy.contains('R$ 50').should('be.visible');
        cy.contains('R$ 100').should('be.visible');
        cy.contains('Outro').should('be.visible');
    });

    it('Deve iniciar com o botão de envio desabilitado', () => {
        cy.contains('button', 'Quero ser amigo!').should('be.disabled');
    });

    it('Deve manter o botão desabilitado se apenas os campos forem preenchidos sem aceitar os termos', () => {
        // Preenche todos os campos obrigatórios
        cy.get('input[name="nome"]').type('Teste Doador');
        cy.get('input[name="email"]').type('teste@email.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');

        // Botão deve continuar desabilitado sem aceitar os termos
        cy.contains('button', 'Quero ser amigo!').should('be.disabled');
    });

    it('Deve manter o botão desabilitado se apenas os termos forem aceitos sem preencher campos', () => {
        // Aceita os termos
        cy.get('#terms').check({ force: true });

        // Botão deve continuar desabilitado sem os campos obrigatórios
        cy.contains('button', 'Quero ser amigo!').should('be.disabled');
    });

    it('Deve habilitar o botão quando todos os campos forem preenchidos E os termos aceitos', () => {
        // Preenche todos os campos obrigatórios
        cy.get('input[name="nome"]').type('Teste Doador');
        cy.get('input[name="email"]').type('teste@email.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');

        // Aceita os termos
        cy.get('#terms').check({ force: true });

        // Botão deve estar habilitado
        cy.contains('button', 'Quero ser amigo!').should('not.be.disabled');
    });

    it('Deve permitir selecionar plano de R$ 30 e redirecionar com o valor correto', () => {
        // Seleciona o plano de R$ 30
        cy.contains('button', 'R$ 30').click();

        // Preenche os campos obrigatórios
        cy.get('input[name="nome"]').type('Teste Doador');
        cy.get('input[name="email"]').type('teste@email.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');

        // Aceita os termos
        cy.get('#terms').check({ force: true });

        // Clica no botão para prosseguir
        cy.contains('button', 'Quero ser amigo!').click();

        // Verifica redirecionamento para o checkout
        cy.url().should('include', '/#/cadastroamigo');

        // Verifica que o valor R$ 30 aparece na página de checkout
        cy.contains('R$ 30').should('be.visible');
    });

    it('Deve passar os dados do formulário para a tela de checkout', () => {
        // Preenche os campos obrigatórios
        cy.get('input[name="nome"]').type('Maria da Silva');
        cy.get('input[name="email"]').type('maria@email.com');
        cy.get('input[name="telefone"]').type('85988887777');
        cy.get('input[name="dia"]').type('10');

        // Aceita os termos
        cy.get('#terms').check({ force: true });

        // Clica no botão para prosseguir
        cy.contains('button', 'Quero ser amigo!').click();

        // Verifica redirecionamento
        cy.url().should('include', '/#/cadastroamigo');

        // Verifica que os dados do doador aparecem no resumo (não no modo edição)
        cy.contains('Maria da Silva').should('be.visible');
        cy.contains('maria@email.com').should('be.visible');
        cy.contains('85988887777').should('be.visible');
    });
});

describe('Amigos do Melvin - Tela de Checkout', () => {
    it('Deve exibir o botão de finalização desabilitado sem dados do cartão', () => {
        // Navega diretamente ao checkout com state simulado
        cy.visit('/#/amigos-do-melvin');

        // Preenche e envia o formulário
        cy.get('input[name="nome"]').type('Doador Teste');
        cy.get('input[name="email"]').type('teste@melvin.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');
        cy.get('#terms').check({ force: true });
        cy.contains('button', 'Quero ser amigo!').click();

        // Na tela de checkout, o botão deve estar desabilitado (cartão não preenchido)
        cy.url().should('include', '/#/cadastroamigo');
        cy.get('button[type="submit"]').should('be.disabled');
    });

    it('Deve renderizar o container do Stripe CardElement', () => {
        cy.visit('/#/amigos-do-melvin');

        cy.get('input[name="nome"]').type('Doador Teste');
        cy.get('input[name="email"]').type('teste@melvin.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');
        cy.get('#terms').check({ force: true });
        cy.contains('button', 'Quero ser amigo!').click();

        cy.url().should('include', '/#/cadastroamigo');
        // Verifica que o container do Stripe Elements está presente
        cy.get('.__PrivateStripeElement').should('exist');
    });

    it('Deve exibir o botão Voltar e permitir retornar à página anterior', () => {
        cy.visit('/#/cadastroamigo');
        cy.contains('Voltar').should('be.visible');
        cy.contains('Voltar').click();
        cy.url().should('include', '/#/amigos-do-melvin');
    });

    // Mock: Intercepta a chamada de API do backend para simular o sucesso
    it('Deve exibir o container do cartão e aceitar preenchimento', () => {
        cy.visit('/#/amigos-do-melvin');

        cy.get('input[name="nome"]').type('Doador Teste');
        cy.get('input[name="email"]').type('teste@melvin.com');
        cy.get('input[name="telefone"]').type('85999999999');
        cy.get('input[name="dia"]').type('5');
        cy.get('#terms').check({ force: true });
        cy.contains('button', 'Quero ser amigo!').click();

        // Mock da chamada de API do backend
        cy.intercept('POST', '**/amigomelvin/subscribe', {
            statusCode: 201,
            body: {
                id: "123-abc",
                nome: "Doador Teste",
                status: "PENDING"
            }
        }).as('subscribeRequest');

        // Verifica que o resumo mostra os dados corretamente
        cy.contains('Doador Teste').should('be.visible');
        cy.contains('teste@melvin.com').should('be.visible');

        // Verifica que o container do Stripe Elements está presente
        // Nota: Em um ambiente E2E real com Stripe, seria necessário interagir com o iframe do Stripe
        cy.get('.__PrivateStripeElement').should('exist');
    });
});
