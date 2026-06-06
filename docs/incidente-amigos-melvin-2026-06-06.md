# 📋 Relatório de Incidente — Amigos do Melvin (Doações Recorrentes)

**Data do incidente:** 05–06/06/2026
**Data da resolução:** 06/06/2026
**Sistema:** institutomelvin.org — módulo "Amigos do Melvin" (assinaturas recorrentes via Stripe)
**Severidade:** Crítica (erro no cadastro de doador + cobrança em dobro + pagamentos não reconciliados)

---

## 1. Resumo executivo

Uma doadora relatou **erro ao cadastrar o cartão** e acabou com **dois cadastros duplicados**, sendo **cobrada em dobro**. A investigação revelou que não era um problema isolado: havia **três falhas encadeadas** no fluxo de doações, sendo a mais grave um **webhook que nunca funcionou** — o que fazia com que *nenhum* pagamento do Stripe atualizasse o status no sistema (todos os doadores ficavam presos em "Pendente").

---

## 2. Impacto

| Impacto | Detalhe |
|---|---|
| Erro visível ao doador | Mensagem genérica de falha mesmo quando a doação era criada com sucesso |
| Cadastros duplicados | 2 registros + 2 assinaturas Stripe para a mesma pessoa |
| Cobrança em dobro | As duas assinaturas ficaram **Active** no Stripe |
| Reconciliação quebrada (todos os doadores) | `Error rate 100%` no webhook → status nunca saía de "Pendente", `mesesContribuindo` nunca avançava, recompensas nunca disparavam |

---

## 3. Causa raiz

### 🔴 Bug 1 — Erro no cadastro + duplicidade
Cadeia do problema (evidência nos logs de 06/06):
1. A criação do cliente no Stripe demorou **~55s** numa lentidão transitória (`11:54:57 → 11:55:52`), deixando a requisição total em **~61s**.
2. O **nginx** não tinha `proxy_read_timeout` configurado → usou o **default de 60s** → devolveu **504** ao navegador.
3. O frontend mostrou *"Ocorreu um erro… tente novamente"*, **mas o backend concluiu e salvou o registro**.
4. A doadora, vendo "erro", **tentou de novo** → segundo cadastro.
5. **Nada impedia a duplicidade:** sem idempotência no Stripe, sem checagem de duplicidade, sem constraint no banco.

### 🔴 Bug 2 — Cobrança em dobro
Consequência do Bug 1: as duas assinaturas foram efetivadas e cobradas no Stripe.

### 🔴 Bug 3 — Webhook nunca funcionou (o mais grave)
O controller do webhook estava mapeado em `@RequestMapping("/api/v1/webhooks/payments")`, **mas o nginx (host e container) faz `proxy_pass` removendo o prefixo `/api/`**. Resultado:

```
Stripe → https://institutomelvin.org/api/v1/webhooks/payments
nginx remove "/api/"  → backend recebe "/v1/webhooks/payments"
controller esperava   → "/api/v1/webhooks/payments"   ❌ não casava
→ Spring Security bloqueava (HTTP 403)
```

Como **todos os outros endpoints não têm o prefixo `/api/v1`**, só o webhook quebrou. Por isso o painel do Stripe mostrava **Error rate 100%** e os pagamentos cobrados nunca viravam "Ativo" no sistema.

---

## 4. Solução aplicada

### Backend
- **Webhook corrigido:** mapeamento alterado para `/v1/webhooks/payments` (controller + Spring Security), alinhado ao caminho que chega após o nginx remover o `/api/`. URL no Stripe permanece `…/api/v1/webhooks/payments`.
- **Idempotência:** chave de idempotência nas chamadas `createCustomer`/`createSubscription` do Stripe → reenvios não duplicam.
- **Timeouts no SDK Stripe:** connect 10s / read 20s → falha rápida em vez de travar ~60s.
- **Deduplicação por doador:** como o e-mail/CPF são cifrados (AES-256-GCM, não pesquisáveis), uso um **blind index HMAC**; novo cadastro de doador já existente é bloqueado **antes** de chamar o Stripe (evita Customer/Subscription órfãos). *(Evoluído depois para deduplicação por CPF com atualização de valor — ver seção 8.)*
- **Validação de entrada** (`@Valid` + Jakarta Validation) e remoção de **JWT dos logs** (estavam sendo logados por inteiro).
- **Cache do Product ID** (menos um round-trip ao Stripe por assinatura).

### Infraestrutura
- `proxy_read_timeout 120s` no nginx (rede de segurança).
- **Volume de logs persistente** (`/app/logs`) — antes a trilha de pagamentos era perdida a cada deploy.

### Frontend
- **Trava de duplo-submit** (ignora cliques enquanto a 1ª requisição está em voo) + chave de idempotência por tentativa.
- **Mensagem de erro orientada:** em caso de timeout, instrui a *verificar o e-mail antes de tentar de novo* (em vez de re-submeter às cegas).

### Operacional (executado no Stripe)
- **Cancelamento** da assinatura duplicada (sobrou 1 Active). *Reembolso integral da cobrança duplicada a confirmar/avaliar.*
- **Resend** do `invoice.paid` da assinatura mantida → reconciliou para **ACTIVE, 1 mês**.

---

## 5. Verificação (pós-deploy, 06/06)

- ✅ Migrations **V6** (email_hash) e **V7** (cpf) aplicadas (schema em v7).
- ✅ Teste do webhook: passou de **403 → 200 OK**.
- ✅ Log confirmando reconciliação: `Doador atualizado para ACTIVE. Meses: 1` (invoice `in_1TfIpRGs…`).
- ✅ Apenas **1 assinatura Active** no Stripe para a doadora.
- ✅ 28 testes de backend passando; lint do frontend limpo.

---

## 6. Observação técnica

- O Stripe (API `2026-04-22.dahlia`) envia `invoice.paid` com `subscription: null` (o campo mudou de lugar). O webhook se salvou pelo **fallback por `customerId`** — funciona, mas vale melhorar depois para ler a nova posição do campo.

---

## 7. Lições / prevenção futura

1. Idempotência + deduplicação viraram padrão no fluxo de pagamento.
2. Webhooks precisam de **teste de fumaça pós-deploy** (verificar 200, não só "Active" no Stripe).
3. Logs de pagamento agora **persistem** entre deploys (auditoria).
4. Atenção a prefixos de rota vs. reescrita do nginx em novos endpoints.

---

## 8. Evolução pós-incidente (CPF na validação)

A pedido, a regra de negócio do cadastro foi reforçada usando o **CPF** como identidade do doador:

- O **CPF passou a ser obrigatório** no cadastro (validação de dígitos verificadores via `@CPF`), cifrado em repouso (AES-256-GCM) e exibido no painel admin (para emissão de recibo de doação / IR).
- **Deduplicação por CPF com atualização de valor:**
  - Mesmo CPF + **mesmo valor** de assinatura ativa/pendente → **bloqueia** (HTTP 409).
  - Mesmo CPF + **valor diferente** → **atualiza** a assinatura existente no Stripe (não cria uma nova).
- O CPF é **armazenado normalizado** no formato `xxx.xxx.xxx-xx`; o índice de deduplicação (blind index HMAC) é calculado sobre os **dígitos**, garantindo correspondência independente da formatação.
