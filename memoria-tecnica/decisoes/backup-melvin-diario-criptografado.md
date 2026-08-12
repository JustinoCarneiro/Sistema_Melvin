---
tipo: decisao
data: 2026-08-04
status: Ativa
---

# Backup do Sistema Melvin: mensal → diário + criptografado AES-256

## Contexto
Auditoria dos backups em produção (servidor `157.173.212.76`) encontrou uma divergência grave entre o que estava documentado e a realidade:

- `docs/SEGURANCA_E_LGPD.md` e `docs/APRESENTACAO_PARA_O_INSTITUTO.md` (documentos voltados ao Instituto) prometiam **backups diários e criptografados**.
- O cron real (`/root/scripts/backup_postgres.sh`, via `crontab -l` do root) rodava **apenas 1x por mês** (`0 2 1 * *`), gerando um `.sql` **em texto puro**, sem criptografia.
- Combinado com a retenção de 30 dias do próprio script, isso significava que existia **um único backup por vez**: se o dump de um mês falhasse ou viesse corrompido, não sobrava nenhum fallback (RPO de até 30 dias, zero redundância).
- O cron não redirecionava saída pra log nenhum, e o servidor não tem MTA configurado (`/var/mail/root` nem existe) — uma falha silenciosa nunca seria percebida.
- O script tinha ainda uma senha do Postgres em texto puro (`DB_PASSWORD=...`) num arquivo `755` (mundo podia ler) — variável morta, nem usada de fato pelo `pg_dump` (que roda dentro do container).
- Achado em paralelo: Sistema Lucas (projeto separado, mesmo servidor) já fazia backup diário corretamente, mas **também** sem cópia off-site — mesma limitação documentada pro SAW HUB no `CLAUDE.md` ("off-site pendente").

## Decisão
Reescrito `/root/scripts/backup_postgres.sh` (produção) pra fechar a lacuna entre o prometido e o real:

- Cron alterado de `0 2 1 * *` para `0 2 * * *` (diário, 02h) — sem colidir com Lucas (04h) nem SAW HUB (04h30/05h).
- Saída redirecionada pra `/var/log/backup_melvin.log` (`>> ... 2>&1`).
- Dump agora passa por `gzip | openssl enc -aes-256-cbc -pbkdf2 -salt` antes de gravar. Chave em `/root/scripts/.backup_encryption_key` (`chmod 600`, root-only, **gerada uma vez, não fica em nenhum outro lugar**).
- Retenção continua em 30 dias (`find -mtime +30 -delete`), mas agora com cadência diária isso realmente mantém ~30 backups distintos, não 1.
- Em falha do `pg_dump`/`gzip`/`openssl`, o script envia e-mail de alerta via `curl --url smtp://...` reaproveitando as credenciais já existentes em `/root/sistema/sistema_melvin/.env` (`SPRING_MAIL_*`, mesma conta Gmail que a aplicação já usa) para `imeh@igrejadapaz.com.br`.
- `DB_PASSWORD` (não usada) removida do script; script agora `chmod 700`.
- Testado round-trip manualmente: `openssl enc -d ... | gunzip | grep -c "PostgreSQL database dump complete"` → `1` (dump íntegro e restaurável).
- **Off-site resolvido no mesmo dia (04/08/2026):** `rclone` instalado no servidor (`apt install rclone`, v1.53.3), remote `gdrive:` configurado em `/root/.config/rclone/rclone.conf` (`chmod 600`) apontando pra `justinocarneiro161@gmail.com`, escopo **`drive.file`** (rclone só enxerga/edita os arquivos que ele mesmo cria — não o Drive inteiro). Cliente OAuth próprio criado no Google Cloud Console (projeto `rclone-melvin-backup-504515`) porque o client_id compartilhado/padrão do rclone estourava cota (`RATE_LIMIT_EXCEEDED`, "low performance" como o próprio rclone avisa). O script agora sobe o `.sql.gz.enc` recém-criado pra pasta `gdrive:sistema-melvin-backups/` ao final de cada execução, com `rclone delete --min-age 30d` espelhando a retenção local. **A chave de criptografia nunca sobe pro Drive** — só o arquivo já cifrado. Testado ponta a ponta (dump → cifra → local → off-site → limpeza remota) com sucesso; confirmado também via listagem do Drive que o arquivo chegou.

### Comando de restauração
```bash
openssl enc -d -aes-256-cbc -pbkdf2 \
  -pass file:/root/scripts/.backup_encryption_key \
  -in /backups/sistemamelvin-<timestamp>.sql.gz.enc \
| gunzip > restaurado.sql
```

## Consequências
- **A chave `/root/scripts/.backup_encryption_key` é a única forma de ler qualquer backup a partir de agora.** Se o disco do servidor for perdido, a chave some junto com os backups criptografados (inclusive os que estão no Drive) — ela precisa ser guardada em algum lugar fora do servidor (gerente de senhas do Justino) antes de considerar essa lacuna fechada de verdade. Isso ainda **não foi feito** — pendente de o usuário decidir onde guardar a cópia da chave.
- **O off-site depende de uma conta pessoal** (`justinocarneiro161@gmail.com`), não institucional — dependência de continuidade a considerar no futuro (não bloqueante agora).
- ~~Risco de expiração do token em 7 dias~~ **Resolvido em 04/08/2026:** o app OAuth (`rclone-melvin-backup-504515`) foi publicado em produção (Google Cloud Console → Público-alvo → Publish App) no mesmo dia da criação — não ficou em "Testando" tempo suficiente pra expirar. Não exigiu verificação do Google (escopo `drive.file` não é sensível). Conexão testada (`rclone lsd gdrive:`) e confirmada funcionando após a publicação.
  - **Mas o refresh token foi revogado mesmo assim, 8 dias depois (12/08/2026):** publicar o app evita a expiração automática de 7 dias do modo "Testando", mas **não é garantia permanente** — o cron das 02h desse dia falhou o upload off-site com `invalid_grant: Token has been expired or revoked`, causa exata não determinada (possíveis gatilhos: revogação manual em myaccount.google.com/permissions, política de inatividade do Google, ou reset de sessão da conta). Corrigido reautorizando via `rclone authorize "drive" <client_id> <client_secret>` **rodado na máquina local** (não dá pra rodar isso direto na VPS headless — precisa de navegador para o consentimento OAuth), colando o JSON de token resultante. **Pegadinha:** `rclone config update gdrive token '<json>'` sozinho **não** aceita o token direto — como `token` é um campo OAuth, o rclone dispara "Already have a token - refresh?" e tenta abrir *outro* fluo de autorização (webserver em `127.0.0.1:53682` na própria VPS, que trava esperando um redirect que nunca chega). Correção: adicionar `config_refresh_token false` como par chave/valor extra no mesmo comando (`rclone config update gdrive token '<json>' config_refresh_token false`), que faz o rclone aceitar o valor colado sem tentar reautorizar sozinho. Validado ponta a ponta (`rclone lsd gdrive:` + reexecução do `backup_postgres.sh` + confirmação do arquivo novo via `rclone ls`).
  - **Se isso acontecer de novo:** não assumir que é preciso mexer no Google Cloud Console (app "Testando" vs "Publicado") — o app já está publicado; é só o token individual que expira/revoga e precisa reautorizar com o procedimento acima.
- **Sistema Lucas também recebeu o tratamento (04/08/2026)**, reaproveitando o mesmo remote `gdrive:`: `backup.sh` do Lucas (`/root/sistema/sistema_lucas/backup.sh`, no mesmo servidor) passou a gerar `.sql.gz.enc` (chave dedicada em `secrets/backup_encryption_key.txt`, separada da chave do Melvin) e a subir pra `gdrive:sistema-lucas-backups/` ao final de cada execução (retenção 7 dias, igual já era localmente). Alerta por e-mail usa as credenciais SMTP **do próprio Lucas** (`MAIL_USERNAME` do `.env` + `secrets/mail_password.txt`, destinatário `INITIAL_ADMIN_EMAIL`) — não usa a conta do Instituto Melvin. Testado ponta a ponta com sucesso (round-trip de restauração confirmado). **Importante:** Sistema Lucas é um repositório/projeto separado deste (`sistema_melvin`); essa mudança foi aplicada **só na cópia do script já implantada no servidor**, não no repositório-fonte do Lucas (fora do alcance desta sessão) — se o Lucas for reimplantado a partir do próprio repo sem essa alteração, o `backup.sh` antigo (sem criptografia/off-site) volta a valer. Backup do script original antes da troca ficou salvo em `/root/sistema/sistema_lucas/backup.sh.bak_pre_20260804` no servidor.
- **SAW HUB continua sem off-site** — a infraestrutura (`rclone` + remote `gdrive:`) já existe no mesmo servidor e pode ser reaproveitada, mas isso ainda não foi feito.
- O e-mail de alerta cobre falha de execução do script, **não** cobre o cron nunca disparar (ex.: cron quebrado no servidor) — não é um "dead man's switch" de verdade.
- O dump antigo em texto puro (`/backups/sistemamelvin-2026-08-01_02-00-01.sql`) foi só protegido com `chmod 600`, não apagado (ação destrutiva em produção não foi autorizada nesta sessão) — considerar removê-lo manualmente já que existe um backup criptografado equivalente mais recente.
- Antes de mexer de novo nesse script, ler esta nota — a criptografia, o alerta por e-mail e o upload off-site são intencionais, não acidente.

## Ligado a
- [[radar-cep-nao-ativado]]
