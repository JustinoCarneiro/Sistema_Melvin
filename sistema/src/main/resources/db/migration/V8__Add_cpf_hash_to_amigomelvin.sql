-- Blind index (HMAC-SHA256) do CPF (apenas dígitos) dos doadores recorrentes.
-- Permite deduplicar o cadastro por CPF sem descriptografar, já que a coluna
-- `cpf` é cifrada com AES-256-GCM (ciphertext não-determinístico).
ALTER TABLE amigomelvin ADD COLUMN IF NOT EXISTS cpf_hash VARCHAR(255);

-- Índice para a checagem de duplicidade/atualização por CPF na criação de assinaturas.
CREATE INDEX IF NOT EXISTS idx_amigomelvin_cpf_hash ON amigomelvin(cpf_hash);
