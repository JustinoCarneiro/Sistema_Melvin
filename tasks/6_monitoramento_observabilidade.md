# 6. MONITORAMENTO E OBSERVABILIDADE - AMIGOS DO MELVIN

## 6.1. OBJETIVO
Garantir a rastreabilidade total das transações financeiras e eventos de Webhook (Stripe), permitindo a detecção em tempo real de falhas de pagamento, fraudes de assinatura ou anomalias no sistema.

## 6.2. PADRÃO DE LOGS (SLF4J + LOGBACK)
O Spring Boot utilizará o Logback para gerar arquivos de log rotativos nativos no sistema de arquivos do Linux.
- **Caminho do Log**: `/var/log/melvin/payments.log` (ou `logs/payments.log` no diretório raiz da aplicação).
- **Formato Estruturado**: `[%d{yyyy-MM-dd HH:mm:ss}] [%level] [STRIPE-WEBHOOK] [%X{invoiceId}] - %msg%n`
- **MDC (Mapped Diagnostic Context)**: Injeção de variáveis de contexto como `subscriptionId` e `invoiceId` na thread atual para rastrear toda a jornada de um evento específico.

## 6.3. TAXONOMIA DE NÍVEIS DE LOG
| Nível | Cenário de Uso | Ação Operacional |
| :--- | :--- | :--- |
| `INFO` | Sucesso em transições (Ex: PENDING -> ACTIVE). | Apenas auditoria. |
| `WARN` | Eventos idempotentes (fatura já processada) ou Webhooks não mapeados. | Monitorar frequência. |
| `ERROR` | Falha no pagamento (`invoice.payment_failed`), Falha de Assinatura do Webhook (Fraude), ou indisponibilidade do PostgreSQL. | Disparar alerta imediato (Email/Slack/Telegram para o admin). |

## 6.4. ARQUITETURA DE RETENÇÃO (LINUX)
- Arquivos de log devem rotacionar diariamente (`RollingFileAppender`).
- Retenção máxima de 30 dias para evitar estouro de disco no servidor Docker/Linux.