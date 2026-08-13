-- US-7.4 (reintroduzido 12/08/2026, a pedido do cliente): check-in por QR Code volta
-- ao escopo como caminho PRINCIPAL de confirmação de entrega, complementando (não
-- substituindo) a confirmação manual por ID já em produção desde a V14.
--
-- email_solicitante: cifrado (SensitiveDataConverter), opcional. Usado pra enviar o
-- QR Code por e-mail automaticamente quando a coordenação agenda a retirada (validar()).
-- Sem e-mail cadastrado, a coordenação ainda consegue ver/baixar o QR Code manualmente
-- pela tela — e o botão "Confirmar Entrega" (caminho alternativo) sempre funciona.
--
-- qr_code_token: token opaco único gerado na validação (UUID aleatório), usado só pra
-- identificar a solicitação no check-in via scan — não é PII, não precisa cifrar.
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS email_solicitante VARCHAR(255);
ALTER TABLE cestas ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255) UNIQUE;
