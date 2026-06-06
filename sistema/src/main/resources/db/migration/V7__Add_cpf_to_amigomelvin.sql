-- CPF do doador recorrente (necessário para emissão de recibo de doação / IR).
-- Armazenado cifrado com AES-256-GCM (SensitiveDataConverter), por isso VARCHAR
-- e nullable (linhas legadas não possuem CPF).
ALTER TABLE amigomelvin ADD COLUMN IF NOT EXISTS cpf VARCHAR(255);
