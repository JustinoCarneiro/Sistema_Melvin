package br.com.melvin.sistema.shared.security;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utilitário de criptografia AES-256-GCM para campos sensíveis.
 * Cada valor criptografado inclui um IV (Initialization Vector) único,
 * garantindo que o mesmo texto gere ciphertexts diferentes a cada gravação.
 */
public class FieldEncryptor {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final SecretKey secretKey;

    public FieldEncryptor(String base64Key) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        if (decodedKey.length != 32) {
            throw new IllegalArgumentException(
                "ENCRYPTION_KEY deve ter exatamente 32 bytes (256 bits) codificados em Base64. " +
                "Tamanho atual: " + decodedKey.length + " bytes. " +
                "Gere uma chave com: openssl rand -base64 32"
            );
        }
        this.secretKey = new SecretKeySpec(decodedKey, "AES");
    }

    /**
     * Criptografa um texto plano e retorna Base64(IV + ciphertext + tag).
     */
    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] ciphertext = cipher.doFinal(plaintext.getBytes("UTF-8"));

            // Formato: [IV (12 bytes)] + [ciphertext + GCM tag]
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criptografar campo sensível", e);
        }
    }

    /**
     * Descriptografa Base64(IV + ciphertext + tag) e retorna o texto plano.
     */
    public String decrypt(String encryptedBase64) {
        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedBase64);

            ByteBuffer buffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Erro ao descriptografar campo sensível", e);
        }
    }
}
