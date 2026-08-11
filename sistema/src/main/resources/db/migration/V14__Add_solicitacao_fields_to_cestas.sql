-- US-7.4: solicitação de cesta básica com agendamento e check-in por QR Code.
-- status é nullable: cadastros diretos existentes (sem fluxo de solicitação) ficam
-- com status NULL, distinguindo-os de solicitações reais (sempre com status setado).
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS status VARCHAR(20);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS nome_solicitante VARCHAR(255);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS nivel_solicitante VARCHAR(20);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS data_retirada DATE;
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS entregue_em TIMESTAMP;

-- UNIQUE simples basta: no Postgres, NULLs não colidem entre si, então os
-- cadastros diretos antigos (sem token) convivem com os tokens únicos.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cestas_qr_code_token ON cestas (qr_code_token);
