-- Adiciona campos dia_preferido e mensagem à tabela amigomelvin
ALTER TABLE amigomelvin ADD COLUMN IF NOT EXISTS dia_preferido VARCHAR(255);
ALTER TABLE amigomelvin ADD COLUMN IF NOT EXISTS mensagem TEXT;
