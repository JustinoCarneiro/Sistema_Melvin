-- US-7.4: solicitação de cesta básica com agendamento e confirmação manual de entrega.
-- status é nullable: cadastros diretos existentes (sem fluxo de solicitação) ficam
-- com status NULL, distinguindo-os de solicitações reais (sempre com status setado).
-- Revisado em 12/08/2026 (decisão do cliente, antes de ir a produção): removido o
-- check-in por QR Code do escopo — a confirmação de entrega passou a ser manual,
-- pelo ID da solicitação, direto na tela de agendadas. Por isso não há coluna de
-- token aqui (chegou a existir nesta migration antes dela ir a produção).
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS status VARCHAR(20);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS nome_solicitante VARCHAR(255);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS nivel_solicitante VARCHAR(20);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS data_retirada DATE;
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS entregue_em TIMESTAMP;

-- data_entrega era NOT NULL no banco (resquício de uma versão antiga da entidade,
-- que hoje declara o campo como nullable). Uma SOLICITAÇÃO não tem data de entrega:
-- ela só ganha data_retirada na validação e entregue_em no check-in. Sem esse DROP
-- NOT NULL, todo POST /cestas/solicitacao estoura 500 no insert.
ALTER TABLE cestas ALTER COLUMN data_entrega DROP NOT NULL;
