---
tipo: decisao
data: 2026-08-12
status: Superada
---

# Check-in por QR Code removido da US-7.4 — confirmação de entrega virou manual

> ⚠️ **Superada horas depois, no mesmo dia** — ver "Atualização" no fim desta nota. O QR Code foi
> reintroduzido como caminho principal de confirmação de entrega; a confirmação manual descrita
> abaixo não foi descartada, virou caminho alternativo. Mantida como registro histórico de por que
> a remoção pareceu uma boa ideia no momento — útil pra não repetir o mesmo raciocínio incompleto.

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

## Atualização (12/08/2026, horas depois): decisão revertida
A remoção acima foi uma decisão técnica tomada **dentro desta sessão**, motivada por simplificar o
escopo antes do deploy — não por um pedido explícito do cliente re-confirmado no momento. Ao revisar
o pedido original do cliente ("o solicitante preencheu o formulário que ele acessou através de um
link ou QRCODE"), ficou claro que o QR Code sempre fez parte da intenção real — a remoção tinha sido
overengineering cortado sem necessidade.

**Reintroduzido** como caminho **principal** de confirmação de entrega, com a confirmação manual
(criada nesta decisão) mantida como caminho **alternativo** — não descartada, complementar. Desenho
final mais robusto que a versão original de 10/08:
- `qrCodeToken` volta a ser gerado sempre na validação (não só quando há e-mail cadastrado).
- Campo novo `emailSolicitante` (cifrado, opcional): se informado, o QR Code é enviado automaticamente
  em anexo por e-mail quando a coordenação agenda a retirada.
- Check-in por token reorganizado em `POST /cestas/solicitacao/checkin/{token}` (em vez do antigo
  `POST /cestas/checkin/{token}`) pra caber dentro da regra de segurança já existente do
  `/cestas/solicitacao/**`, sem precisar adicionar uma nova entrada em `SecurityConfiguration`.
- Frontend ganhou scanner de câmera embutido (`html5-qrcode`) além do campo de colar o código —
  cobrindo tanto quem tem câmera nativa decodificando (copia e cola) quanto quem prefere escanear
  direto na tela do sistema.

Migration `V15` (não editou a `V14` desta vez — ela já tinha ido a produção entre a remoção e a
reintrodução, então não podia mais ser alterada em lugar de compensada).

**Lição:** decisão de escopo tomada sob pressão de "simplificar antes do deploy" merece uma
confirmação explícita antes de virar ação — não só inferir a partir do contexto da conversa. Ver
especificação atualizada em `CLAUDE.md` (US-7.4) e `ROADMAP.md` (Módulo 13).

## Ligado a
- [[rate-limit-apenas-solicitacao-cesta]]
