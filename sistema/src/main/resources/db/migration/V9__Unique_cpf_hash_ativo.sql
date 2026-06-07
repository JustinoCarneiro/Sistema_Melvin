-- Garante, no nível do banco, no máximo UMA assinatura ATIVA/PENDENTE por CPF.
-- Fecha a janela de corrida da deduplicação em código (entre a checagem e o
-- insert, duas requisições simultâneas do mesmo CPF poderiam passar).
--
-- Índice PARCIAL:
--   * só cobre status ACTIVE/PENDING — um doador CANCELLED/INACTIVE pode reassinar;
--   * ignora linhas sem CPF (cpf_hash nulo) — registros legados sem CPF.
-- Com os dados atuais não há conflito (linhas ATIVAS sem CPF ficam de fora).
--
-- A aplicação trata a violação dessa constraint cancelando a subscription
-- recém-criada no Stripe (compensação), evitando cobrança órfã.
CREATE UNIQUE INDEX IF NOT EXISTS uq_amigomelvin_cpf_hash_ativo
ON amigomelvin (cpf_hash)
WHERE cpf_hash IS NOT NULL AND status IN ('ACTIVE', 'PENDING');
