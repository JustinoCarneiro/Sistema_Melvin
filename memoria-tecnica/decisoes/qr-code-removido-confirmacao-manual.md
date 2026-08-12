---
tipo: decisao
data: 2026-08-12
status: Ativa
---

# Check-in por QR Code removido da US-7.4 — confirmação de entrega virou manual

## Contexto
A US-7.4 (solicitação de cesta básica) foi implementada em 10/08/2026 com check-in por QR Code:
token UUID gerado na validação (`AGENDADA`), `GET /cestas/qrcode/{token}` gerando a imagem via
ZXing, `POST /cestas/checkin/{token}` confirmando a entrega por leitura/colagem do token.

Em 12/08/2026, antes do deploy, o cliente pediu para simplificar: sem QR Code, confirmação manual
direto na tela de solicitações.

## Decisão
Removido o mecanismo de QR Code inteiro:
- `QrCodeService` (ZXing) deletado; dependências `com.google.zxing:core`/`javase` removidas do `pom.xml`.
- Coluna `qr_code_token` removida — a migration `V14` nunca tinha ido a produção (ela sempre esteve
  atrás da homologação/gateway de deploy), então foi **editada diretamente**, não compensada com uma
  V15 de rollback.
- `checkin(String qrCodeToken)` virou `confirmarEntrega(UUID id)` — mesmo efeito (`AGENDADA → ENTREGUE`,
  409 se já entregue ou se ainda não agendada), mudou só a chave de busca (ID em vez de token).
- Novo endpoint `GET /cestas/solicitacoes/agendadas` para a coordenação ver quem está aguardando
  retirada (antes essa lista não existia como tal — o QR era gerado e mostrado na hora da validação,
  sem uma tela própria de "aguardando").

## Consequências
- **Perda de verificação física.** QR Code provava que alguém com o código físico (impresso/enviado ao
  beneficiário) estava fisicamente presente. Confirmação manual depende só do julgamento de quem está
  atendendo — mais rápido, porém sem essa camada extra de prova.
- Se o instituto voltar a pedir rastreabilidade por leitura, reintroduzir um token não é caro (a
  máquina de estados `SOLICITADA → AGENDADA → ENTREGUE` continua a mesma, só falta o campo e os dois
  endpoints); a parte que exigiria retrabalho real é o frontend de geração/exibição do QR.

## Ligado a
- [[rate-limit-apenas-solicitacao-cesta]]
