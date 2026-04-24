# 1. REQUISITOS - MÓDULO AMIGOS DO MELVIN

## 1.1. VISÃO GERAL
Implementação de um ecossistema de doações recorrentes e únicas para o Instituto Melvin, integrando o site institucional com um gateway de pagamento (Stripe ou Mercado Pago).

## 1.2. REQUISITOS FUNCIONAIS (RF)
- **RF01: Planos de Assinatura**: O sistema deve permitir a escolha de planos fixos (R$20, R$50, R$100) ou valor customizado.
- **RF02: Checkout Transparente**: Cadastro de cartão de crédito e processamento sem redirecionamento externo (tokenização).
- **RF03: Doação Única**: Opção de doação avulsa via Pix ou Cartão na rota `/doacoes`.
- **RF04: Doação de Itens**: Formulário para coleta de dados de doadores de bens materiais.
- **RF05: Gestão de Recompensas**: Tracking automático do tempo de contribuição para desbloqueio de brindes (3, 6, 12 meses).
- **RF06: Webhooks**: Escuta ativa de eventos de pagamento (sucesso, falha, cancelamento).

## 1.3. REQUISITOS NÃO FUNCIONAIS (RNF)
- **RNF01: Segurança PCI-DSS**: Dados sensíveis de cartão jamais devem tocar o banco de dados PostgreSQL do Melvin.
- **RNF02: Performance**: Checkout em tela única com tempo de resposta < 2s.
- **RNF03: Mobile First**: Interface 100% responsiva para doações via smartphone.
- **RNF04: Compatibilidade**: Backend rodando em Java 21 e scripts em ambiente Linux.