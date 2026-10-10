---
tipo: bug
data: 2026-10-10
severidade: Alta
status: Corrigido e publicado em produção em 10/10/2026
---

# Rotas públicas confiavam no corpo da requisição (embaixador, doação e e-mail)

## Sintoma
Achados na auditoria de 10/10/2026, sem exploração observada:
1. **Cadastro de embaixador** (`POST /embaixador`, público): o corpo era a entidade inteira. Mandando o `id` de um
   embaixador existente (os ids são públicos na lista do site), o visitante sobrescrevia o cadastro dele, com
   contato e descrição; `{}` dava 500.
2. **Assinatura de doação** (`POST /amigomelvin/subscribe`, público): quando já existia doador ativo com o mesmo
   CPF ou o mesmo e-mail, o sistema alterava o valor da assinatura dele no Stripe e devolvia o cadastro inteiro
   (CPF, telefone, e-mail, ids do Stripe). Quem soubesse só o e-mail de um doador obtinha o CPF dele.
3. **E-mails**: o texto entrava cru num template HTML. Um nome digitado no site virava HTML (link, imagem) na caixa
   de quem recebia, em e-mail enviado pelo remetente real do Instituto, para o endereço que o próprio visitante
   informou.
4. Doação única e de itens não tinham validação (`{}` dava 500), e não havia limite de chamadas em nenhuma rota
   pública além da solicitação de cesta.

## Causa raiz
Entidade JPA usada como corpo da requisição (o cliente escolhe todos os campos, inclusive o id), respostas
devolvendo a entidade em vez de um DTO, identidade do doador decidida por um único dado (CPF ou e-mail) e texto do
usuário concatenado em HTML.

## Solução
- Embaixador: `EmbaixadorCadastroDTO` validado (nome, contato, e-mail, Instagram, com tamanho máximo); entra sempre
  como não aprovado; a resposta não devolve o cadastro.
- Doação: a resposta pública é `AssinaturaRespostaDTO` (só `clientSecret` ou "atualizada"). Alterar ou substituir
  uma assinatura exige CPF E e-mail do mesmo cadastro; o e-mail sozinho só identifica cadastros antigos, sem CPF
  (um casal que divide e-mail não é o mesmo doador). Doação única e de itens ganharam validação.
- `/amigomelvin/stats` (total de doadores e receita mensal, sem nenhuma chamada nos logs) passou a exigir a
  permissão de gerenciar amigos.
- `EmailService` escapa o texto antes do template e tira quebra de linha do assunto.
- `RateLimitPublicoFilter`: limite por IP em todas as rotas públicas que gravam, mandam e-mail ou chamam o Stripe
  (cesta 5/h, embaixador 5/h, assinatura 20/h, doação única 30/h, itens 20/h), comparando o caminho já
  decodificado (fecha um desvio por letra codificada, `/%65mbaixador`). Substitui o filtro só da cesta.
- Erros: o tratador global não devolve mais a mensagem da exceção no 500 e responde 4xx correto para erro de quem
  chamou.

## Ainda em aberto
Quem sabe CPF e e-mail de um doador ainda consegue alterar o valor da assinatura dele. A solução completa é
confirmar a alteração por um link enviado ao e-mail do cadastro (decisão do Instituto pendente).

## Ligado a
- [[idempotencia-dedup-pagamentos-stripe]], [[cpf-obrigatorio-cifrado-blind-index]]
- [[rate-limit-apenas-solicitacao-cesta]] (substituída)
- [[rate-limit-burlavel-por-x-forwarded-for-forjado]]: a mesma chave de IP, agora em `ClientIp`.
