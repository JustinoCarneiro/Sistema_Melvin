# TASK_ATUAL - PASSO 9: TESTES E2E E DOCUMENTAÇÃO FINAL

## OBJETIVO
Garantir a integridade de ponta a ponta do fluxo de doações e atualizar os manuais técnicos do sistema.

## ESCOPO DA ETAPA
1. **Cypress E2E**: Criar o arquivo `frontend/cypress/e2e/amigos_melvin.cy.js`.
    - Testar navegação até `/amigos-do-melvin`.
    - Testar seleção de planos e preenchimento do formulário de checkout.
    - Simular falhas de validação no formulário.
2. **Mock de Webhooks**: Documentar um script `curl` ou comando da `stripe-cli` para simular o `invoice.paid` em ambiente de staging.
3. **README Técnico**: Atualizar o `README.md` principal do projeto com as novas variáveis de ambiente necessárias (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `SPRING_MAIL_*`).
4. **Cleanup**: Remover logs de debug sensíveis (como tokens ou payloads brutos) que possam ter ficado nos Services.

## CRITÉRIOS DE ACEITE
- Os novos testes do Cypress devem passar em modo `headless`.
- O `README.md` deve refletir a nova arquitetura de doações.
- Build final limpa no Linux.