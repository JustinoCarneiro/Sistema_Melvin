# 2. REGRAS DE NEGÓCIO - AMIGOS DO MELVIN

## 2.1. CICLO DE VIDA DO DOADOR (DONORS)
- **Status Inicial**: `PENDING` ao criar o cadastro, mudando para `ACTIVE` apenas após o primeiro Webhook de confirmação.
- **Inadimplência**: Caso o Webhook reporte falha, o status deve ir para `INACTIVE` e o acesso a recompensas futuras é pausado.
- **Cancelamento**: O doador pode solicitar o cancelamento, mudando o status para `CANCELLED` ao final do ciclo pago.

## 2.2. LÓGICA DE RECOMPENSAS
- **Cálculo**: `meses_contribuindo` é incrementado a cada renovação confirmada pelo gateway.
- **Gatilhos**:
    - 3 meses: Gerar `status_certificado = DISPONIVEL`.
    - 6 meses: Gerar alerta no dashboard administrativo para envio de `camiseta`.
    - 12 meses: Gerar alerta para `kit_especial`.

## 2.3. PAGAMENTOS
- **Recorrência**: Deve ser mensal (30 dias).
- **Moeda**: BRL (Real).