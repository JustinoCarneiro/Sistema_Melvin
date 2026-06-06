-- Blind index (HMAC-SHA256) do e-mail dos doadores recorrentes.
-- Permite detectar duplicidade de cadastro (mesmo e-mail) sem descriptografar,
-- já que a coluna `email` é cifrada com AES-256-GCM (ciphertext não-determinístico).
ALTER TABLE amigomelvin ADD COLUMN IF NOT EXISTS email_hash VARCHAR(255);

-- Índice para a checagem de duplicidade na criação de assinaturas.
-- Não-único de propósito: linhas legadas ficam com hash nulo e o backfill é
-- feito em nível de aplicação; a prevenção de duplicata ocorre antes da chamada
-- ao Stripe (ver AmigoMelvinService.processarAssinatura).
CREATE INDEX IF NOT EXISTS idx_amigomelvin_email_hash ON amigomelvin(email_hash);
