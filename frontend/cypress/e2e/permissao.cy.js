describe('Configuração de Permissões', () => {
  const matricula = '20247001';
  const role = 'ADM';

  const mockPermissoes = [
    {
      nomeRegra: 'EDITAR_RENDIMENTO',
      rolesPermitidas: ['ADM', 'DIRE', 'COOR']
    },
    {
      nomeRegra: 'GERENCIAR_FREQUENCIA',
      rolesPermitidas: ['ADM', 'DIRE', 'COOR', 'PROF']
    },
    {
      nomeRegra: 'CADASTRAR_ALUNO',
      rolesPermitidas: ['ADM', 'DIRE']
    }
  ];

  beforeEach(() => {
    cy.login(role, matricula);
    
    // Mock for PrivateRoute RBAC check
    cy.intercept('GET', `**/auth/role_${matricula}`, { statusCode: 200, body: role });

    // Mock initial permissions list
    cy.intercept('GET', '**/api/permissoes', {
      statusCode: 200,
      body: mockPermissoes
    }).as('getPermissoes');

    // Mock update rule
    cy.intercept('PUT', '**/api/permissoes/*', {
      statusCode: 200,
      body: { message: 'Updated' }
    }).as('updatePermissao');

    cy.visit('/#/app/config/permissoes');
    cy.wait('@getPermissoes');
  });

  it('deve carregar a tabela de permissões corretamente', () => {
    cy.get('h1').contains('Configurações de Permissões').should('be.visible');
    cy.get('table').should('be.visible');
    
    // Verifica se as regras estão listadas (usando os labels mapeados no componente)
    cy.contains('Editar Rendimento/Notas').should('be.visible');
    cy.contains('Gerenciar Frequência').should('be.visible');
    cy.contains('Cadastrar/Editar Alunos').should('be.visible');
  });

  it('deve permitir alternar uma permissão e salvar', () => {
    // Para a regra EDITAR_RENDIMENTO (primeira linha), desmarcar ADM (primeira coluna de roles)
    // No mock, ADM já está marcado para EDITAR_RENDIMENTO
    
    // Encontrar o checkbox para ADM na linha de EDITAR_RENDIMENTO
    // O ROLES[0] é ADM. A primeira linha do corpo da tabela é EDITAR_RENDIMENTO.
    cy.get('tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').first().should('be.checked').uncheck();
    });

    // Clicar em salvar
    cy.get('button').contains('Salvar').click();

    // Deve chamar o mock de update (uma vez para cada regra no componente atual)
    // O componente percorre todas as permissões e chama atualizarRegra para cada uma.
    cy.wait('@updatePermissao');
    
    cy.contains('Configurações salvas com sucesso!').should('be.visible');
  });

  it('deve exibir erro se falhar ao salvar', () => {
    cy.intercept('PUT', '**/api/permissoes/*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('updateError');

    cy.get('button').contains('Salvar').click();
    cy.wait('@updateError');
    
    cy.contains('Erro ao salvar algumas configurações.').should('be.visible');
  });

  it('deve ser responsivo e mostrar cards em telas menores', () => {
    cy.viewport(600, 900);
    cy.visit('/#/app/config/permissoes');
    cy.wait('@getPermissoes');
    
    // Os cards devem estar visíveis
    // O texto da regra deve ser visível (nos cards o label é renderizado)
    cy.contains('Editar Rendimento/Notas').should('be.visible');
    
    // Verifica se existem os cards de regra usando o seletor de classe parcial
    cy.get('[class*="regraCard"]').should('have.length', mockPermissoes.length);
    
    // Verifica se a tabela está oculta (display: none no container)
    cy.get('[class*="tableContainer"]').should('not.be.visible');
  });
});
