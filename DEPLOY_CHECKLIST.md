# 🚀 DEPLOY CHECKLIST — Sistema Melvin (Produção Linux)

Checklist obrigatório antes de subir o sistema para o servidor de produção.
Valide cada item antes de executar `./deploy.sh`.

---

## 1. Variáveis de Ambiente (`.env`)

Todas as variáveis abaixo **devem** estar definidas no arquivo `.env` na raiz do projeto.
Nenhuma credencial deve estar hardcoded no código ou no `application.properties`.

### Banco de Dados
| Variável | Exemplo | Obrigatória |
|---|---|---|
| `DB_HOST` | `postgresdb` | ✅ |
| `DB_PORT` | `5432` | ✅ |
| `DB_NAME` | `sistemamelvin` | ✅ |
| `DB_USER` | `melvin` | ✅ |
| `DB_PASS` | `(senha segura)` | ✅ |

### Segurança (JWT)
| Variável | Exemplo | Obrigatória |
|---|---|---|
| `JWT_SECRET` | `(string aleatória 256-bit)` | ✅ |

### Frontend
| Variável | Exemplo | Obrigatória |
|---|---|---|
| `FRONTEND_URL` | `https://institutomelvin.org` | ✅ |
| `VITE_REACT_APP_FETCH_URL` | `https://institutomelvin.org/api` | ✅ |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | ✅ |

### Stripe (Motor Financeiro)
| Variável | Exemplo | Obrigatória |
|---|---|---|
| `STRIPE_API_KEY` | `sk_live_...` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ |
| `STRIPE_PRICE_ID` | `price_...` | ✅ |

> ⚠️ **NUNCA** use chaves `sk_test_` ou `pk_test_` em produção.

### E-mail (SMTP)
| Variável | Exemplo | Obrigatória |
|---|---|---|
| `SPRING_MAIL_HOST` | `smtp.gmail.com` | ✅ |
| `SPRING_MAIL_PORT` | `587` | ✅ |
| `SPRING_MAIL_USERNAME` | `sistema@institutomelvin.org` | ✅ |
| `SPRING_MAIL_PASSWORD` | `(senha de app)` | ✅ |

---

## 2. Webhook do Stripe (Dashboard)

Após o deploy, configure o Webhook **real** no painel do Stripe:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. Configure:
   - **URL do endpoint:** `https://institutomelvin.org/api/v1/webhooks/payments`
   - **Eventos a escutar:**
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
4. Copie o **Signing Secret** (`whsec_...`) gerado e atualize a variável `STRIPE_WEBHOOK_SECRET` no `.env`
5. Reinicie o backend: `docker restart backend-melvin`

---

### 2.1 Configurações Finais do Dashboard Stripe (Autoatendimento e Antifraude)
Após configurar os Webhooks, acesse o painel da Stripe (em Modo Produção / Live Mode) e ative as seguintes proteções operacionais:

1. **Customer Portal (Autoatendimento)**
   - Vá em `Settings > Billing > Customer portal`.
   - Ative: *Cancel subscriptions* (Escolha "Cancel at end of billing period" e ative a coleta de motivo de cancelamento).
   - Ative: *Payment methods* (Permite troca de cartão pelo próprio doador).
   - Salve as alterações.

2. **Smart Retries (Recuperação de Cobrança)**
   - Vá em `Settings > Billing > Subscriptions and emails`.
   - Na seção *Manage failed payments for subscriptions*, ative *Use a Smart Retry policy* (Recomendado: 8 tentativas em 2 a 3 semanas).
   - Defina *Subscription status* para **cancel the subscription** se todas as tentativas falharem (Isso dispara o webhook de cancelamento para o backend).

3. **Notificações por E-mail (Automáticas da Stripe)**
   - Na mesma tela `Subscriptions and emails`, ative:
     - *Send emails about expiring cards*
     - *Send emails when card payments fail*
   - Na seção *Payment method updates*, selecione **Link to Stripe customer portal**.

4. **Stripe Radar (Proteção Antifraude)**
   - Vá em `Payments > Radar > Rules`.
   - Certifique-se de que a regra de *Block* para *CVC verification fails based on risk score* está **Enabled**.
   - Para maior segurança no Brasil, ative a regra de bloqueio se a verificação de CEP (Postal Code) falhar.

5. **Branding e Ativação Legal**
   - Vá em `Settings > Business settings > Branding` e suba a Logomarca e a paleta de cores do Melvin.
   - Preencha o formulário obrigatório de documentação (CNPJ, endereço, conta bancária) em "Activate your account" para receber repasses.

---

## 3. Migrations do Banco de Dados (Flyway)

O Flyway está habilitado e executa automaticamente na inicialização do Spring Boot.
Configuração ativa em `application.properties`:

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

As migrations rodam automaticamente ao subir o container. Para forçar manualmente:

```bash
cd sistema
./mvnw flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/sistemamelvin \
                      -Dflyway.user=melvin \
                      -Dflyway.password=<SENHA>
```

Para verificar o estado das migrations:
```bash
./mvnw flyway:info -Dflyway.url=jdbc:postgresql://localhost:5432/sistemamelvin \
                   -Dflyway.user=melvin \
                   -Dflyway.password=<SENHA>
```

---

## 4. Verificação Pré-Deploy

Execute o script de verificação antes de subir:

```bash
./sistema/scripts/verify_setup.sh
```

O script valida:
- [x] `STRIPE_API_KEY` exportada com prefixo correto
- [x] `STRIPE_WEBHOOK_SECRET` exportada com prefixo correto
- [x] Conectividade com PostgreSQL (porta 5432)
- [x] Presença do `stripe-cli` (opcional em prod)

---

## 5. Comandos de Deploy

### Deploy Local (Produção)
```bash
./deploy.sh
```

### Deploy Remoto (VPS via SSH + Rsync)
```bash
./deploy.sh remote
```

### Verificação Pós-Deploy
```bash
# Health check do backend
curl -s -o /dev/null -w "%{http_code}" https://institutomelvin.org/api/v1/health

# Verificar logs do container
docker logs -f --tail 100 backend-melvin

# Verificar status da memória
docker stats --no-stream backend-melvin

# Auditoria do banco (doadores)
docker exec postgresdb psql -U melvin -d sistemamelvin -f /scripts/monitor_donor.sql
```

---

## 6. Configuração do Nginx (Proxy Reverso)

Confirme no arquivo `/etc/nginx/sites-enabled/institutomelvin.org`:

```nginx
location /api/ {
    proxy_pass http://localhost:8443/;  # HTTP interno, com barra final
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> ⚠️ O `proxy_pass` deve usar **`http`** (não `https`) e a barra `/` no final é obrigatória.

---

## 7. Checklist Final

- [ ] Arquivo `.env` preenchido com **todas** as variáveis acima
- [ ] Chaves Stripe são `sk_live_` / `pk_live_` (não `test`)
- [ ] Webhook configurado no Dashboard do Stripe com URL de produção
- [ ] `STRIPE_WEBHOOK_SECRET` atualizado com o signing secret do webhook real
- [ ] Flyway migrations executadas com sucesso na inicialização
- [ ] Nginx configurado com `proxy_pass http://` (sem HTTPS interno)
- [ ] Backup do banco executado antes do deploy (`./backup.sh`)
- [ ] `docker stats` confirma memória dentro do limite (< 85% de 1GB)
- [ ] Teste de fumaça: login funcional via `https://institutomelvin.org`
- [ ] Logs limpos de PII (`docker logs backend-melvin | grep -i nome` retorna vazio)

---

*Última atualização: Maio/2026*
