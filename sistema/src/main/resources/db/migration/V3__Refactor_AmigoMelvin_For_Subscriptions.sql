-- Remover as colunas booleanas antigas
ALTER TABLE amigomelvin DROP COLUMN status;
ALTER TABLE amigomelvin DROP COLUMN contatado;

-- Adicionar novas colunas para controle de assinaturas (Stripe) e status (Enum)
ALTER TABLE amigomelvin ADD COLUMN status VARCHAR(50);
ALTER TABLE amigomelvin ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE amigomelvin ADD COLUMN subscription_id VARCHAR(255);
ALTER TABLE amigomelvin ADD COLUMN meses_contribuindo INTEGER;
ALTER TABLE amigomelvin ADD COLUMN data_inicio TIMESTAMP;

-- Alterar tipo da coluna valor_mensal de VARCHAR para NUMERIC
ALTER TABLE amigomelvin ALTER COLUMN valor_mensal TYPE NUMERIC(38, 2) USING valor_mensal::NUMERIC;
