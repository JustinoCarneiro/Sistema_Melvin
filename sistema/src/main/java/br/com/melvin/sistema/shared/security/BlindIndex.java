package br.com.melvin.sistema.shared.security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Gera um "blind index" determinístico (HMAC-SHA256) para campos sensíveis
 * cifrados com {@link FieldEncryptor} (e-mail, CPF).
 *
 * Esses campos são cifrados com AES-256-GCM (IV aleatório), portanto o
 * ciphertext não é determinístico e não permite busca/unicidade. O hash gerado
 * aqui é estável para o mesmo valor normalizado, viabilizando a deduplicação
 * sem expor o dado em claro.
 *
 * O chamador deve normalizar o valor antes (ex.: e-mail em minúsculas,
 * CPF apenas com dígitos via {@code CpfUtils.onlyDigits}).
 */
@Component
public class BlindIndex {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final byte[] key;

    public BlindIndex(@Value("${melvin.encryption.key}") String configuredKey) {
        // Usa os bytes UTF-8 da chave configurada diretamente como chave HMAC.
        // HMAC aceita chaves de qualquer tamanho, então não depende do formato
        // Base64 exigido pela cifra AES.
        this.key = configuredKey.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Retorna o HMAC-SHA256 (Base64) do valor já normalizado (trim + lowercase
     * adicionais aplicados aqui por segurança), ou {@code null} se vazio.
     */
    public String hash(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            String normalized = value.trim().toLowerCase();
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key, HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(normalized.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar blind index", e);
        }
    }
}
