---
tipo: bug
data: 2026-10-09
severidade: Alta
status: Corrigido no candidato de release
---

# Cancelamento de cesta podia sobrescrever validação ou entrega concorrente

## Sintoma

O fluxo de solicitação de cesta lia o registro, verificava o status em memória e depois chamava
`save()`. Duas requisições simultâneas podiam ler o mesmo estado válido e gravar resultados
diferentes. Assim, uma cesta entregue podia terminar como `CANCELADA`, ou uma solicitação
cancelada podia voltar como `AGENDADA` e ainda disparar o envio do QR Code.

## Causa raiz

A guarda da máquina de estados existia apenas na camada de serviço. Entre o `findById()` e o
`save()`, o banco não impedia que outra transação mudasse o status. A transação por método não
resolve esse tipo de corrida quando cada requisição usa uma transação independente.

## Solução

As três transições envolvidas passaram a usar updates condicionais no repositório:

- `SOLICITADA → AGENDADA` somente se o status ainda for `SOLICITADA`;
- `SOLICITADA` ou `AGENDADA → CANCELADA` somente se o status ainda for exatamente o observado antes da escrita;
- `AGENDADA → ENTREGUE` somente se o status ainda for `AGENDADA`.

Cada update retorna a quantidade de linhas alteradas. Zero significa que outra operação venceu;
o serviço responde 409 e não altera o objeto nem envia e-mail. O cancelamento também limpa
`qrCodeToken`, impedindo a exibição posterior de um código inválido. A tela interpreta a mensagem
textual do 409 e recarrega as listas para mostrar o estado vencedor.

O CRUD legado `/cestas` também foi separado do fluxo: a listagem retorna apenas registros com
`status` nulo; o POST zera campos internos; PUT e DELETE respondem 409 para solicitações. O
matcher de segurança da exclusão foi corrigido de `/cestas` para `/cestas/**`, cobrindo a rota
real `DELETE /cestas/{id}` com `GERENCIAR_CESTAS`.

O endpoint público de solicitação também zera `qrCodeToken`; assim, um payload externo não pode
reutilizar um token existente nem criar ambiguidade na busca usada pelo check-in.

## Testes de regressão

`CestasServiceTest` simula a perda da corrida nas três direções relevantes e confirma o 409 sem
efeitos colaterais. `CestasRepositoryTest` executa as transições condicionais contra H2 e verifica
que a segunda operação não muda o estado persistido. A suíte também cobre o isolamento do CRUD
legado e um teste MockMvc confirma 403 na exclusão para cargo sem `GERENCIAR_CESTAS`.

## Regra reutilizável

Uma máquina de estados com ações concorrentes precisa validar o estado no mesmo comando que faz
a escrita, ou usar bloqueio/versão equivalente. Ler, validar em memória e salvar depois não torna
a transição atômica.
