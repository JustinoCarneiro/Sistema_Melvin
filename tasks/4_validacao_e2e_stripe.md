# 4. PLANO DE HOMOLOGAÇÃO - SISTEMA DE DOAÇÕES RECORRENTES

## 4.1. SETUP DO AMBIENTE DE TESTE (STRIPE)
- **Produto**: Criar "Assinatura Amigos do Melvin" no Stripe Dashboard (Modo Teste).
- **Preços (API IDs)**: 
    - R$ 20,00 (price_20_id)
    - R$ 50,00 (price_50_id)
    - R$ 100,00 (price_100_id)
- **Variáveis de Ambiente**:
    - `STRIPE_API_KEY`: sk_test_...
    - `STRIPE_WEBHOOK_SECRET`: whsec_... (obtido via stripe-cli)

## 4.2. MATRIZ DE RASTREABILIDADE DE STATUS
| Evento Stripe | Ação Esperada no Melvin | Status Final (DB) |
| :--- | :--- | :--- |
| `customer.subscription.created` | Criar registro inicial | `PENDING` |
| `invoice.paid` | Confirmar primeiro ciclo | `ACTIVE` |
| `invoice.payment_failed` | Registrar falha | `INACTIVE` |
| `customer.subscription.deleted` | Cancelamento | `CANCELLED` |

## 4.3. SCRIPTS DE APOIO (LINUX)
- `check_payments.sh`: Script para monitorar logs de Webhook em tempo real.
- `verify_db.sql`: Query para extrair o log de transição de status do doador.