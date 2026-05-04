# 5. HOMOLOGAÇÃO EQA - MATRIZ DE ESTADOS COMPLETA

## 5.1. OBJETIVO
Validar a robustez da integração assíncrona após a correção dos handlers de falha e cancelamento.

## 5.2. MÁQUINA DE ESTADOS (VALIDADA)
| Estado Atual | Evento Stripe | Ação do Melvin | Novo Estado (DB) |
| :--- | :--- | :--- | :--- |
| N/A | `customer.subscription.created` | Cria registro inicial | `PENDING` |
| `PENDING` | `invoice.paid` | Confirma primeiro ciclo | `ACTIVE` (Meses: 1) |
| `ACTIVE` | `invoice.paid` | Renovação (Idempotência check) | `ACTIVE` (Meses: n+1) |
| `ACTIVE` | `invoice.payment_failed` | Alerta de inadimplência | `INACTIVE` |
| `INACTIVE` | `invoice.paid` | Recuperação de pagamento | `ACTIVE` |
| `ANY` | `customer.subscription.deleted` | Encerramento de contrato | `CANCELLED` |

## 5.3. MONITORES DE INTEGRIDADE (SQL)
- **Anomalias**: `monitor_donor.sql` (Query 4) - Busca doadores `ACTIVE` com 0 meses.
- **Zumbis**: `monitor_donor.sql` (Query 5) - Busca doadores `PENDING` estagnados.