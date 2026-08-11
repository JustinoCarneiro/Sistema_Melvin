-- E-mail do responsável pelo aluno, usado para notificação automática de falta (US-5.5).
-- Armazenado cifrado com AES-256-GCM (SensitiveDataConverter), por isso VARCHAR
-- e nullable (linhas legadas não possuem esse contato cadastrado).
ALTER TABLE discente ADD COLUMN IF NOT EXISTS email_responsavel VARCHAR(255);
