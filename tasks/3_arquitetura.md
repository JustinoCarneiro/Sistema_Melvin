# 3. ARQUITETURA TÉCNICA - ATUALIZAÇÃO BRUTA

## 3.1. MODELAGEM DE DADOS (POSTGRESQL)
A tabela `donors` (ou atualização da `amigo_melvin`) deve conter:
- `id` (UUID/Long)
- `external_id` (ID do cliente no Gateway)
- `subscription_id` (ID da assinatura no Gateway)
- `nome`, `email`, `telefone`
- `valor_mensal` (Decimal)
- `status` (Enum: ACTIVE, INACTIVE, CANCELLED, PENDING)
- `meses_contribuindo` (Integer)
- `data_inicio` (Timestamp)

## 3.2. ENDPOINTS DA API (SPRING BOOT)
- `POST /api/v1/donors/subscribe`: Inicia assinatura e retorna token do checkout.
- `POST /api/v1/donors/one-time`: Processa doação única.
- `POST /api/v1/webhooks/payments`: Endpoint público para receber notificações do Gateway.
- `GET /api/v1/donors/impact`: Dados agregados para a Seção de Impacto.

## 3.3. INTEGRAÇÃO (GATEWAY)
- **Proposta**: Stripe SDK (devido à facilidade de `Subscription` e `Webhooks` robustos).