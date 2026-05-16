package br.com.melvin.sistema.shared.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JPA AttributeConverter que criptografa/descriptografa campos String de forma transparente.
 * Ao gravar no banco, o valor é criptografado com AES-256-GCM.
 * Ao ler do banco, o valor é descriptografado automaticamente.
 *
 * Uso: @Convert(converter = SensitiveDataConverter.class)
 */
@Converter
@Component
public class SensitiveDataConverter implements AttributeConverter<String, String> {

    private static FieldEncryptor encryptor;

    /**
     * Injeta a chave de criptografia via Spring.
     * Usa um setter estático para que o JPA consiga instanciar o converter.
     */
    @Value("${melvin.encryption.key}")
    public void setEncryptionKey(String key) {
        if (key != null && !key.isBlank() && !key.equals("CHANGE_ME_IN_PRODUCTION")) {
            SensitiveDataConverter.encryptor = new FieldEncryptor(key);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank() || encryptor == null) {
            return attribute;
        }
        // Dados já anonimizados não precisam ser criptografados
        if ("Anonimizado".equals(attribute)) {
            return attribute;
        }
        return encryptor.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank() || encryptor == null) {
            return dbData;
        }
        // Dados anonimizados são retornados como estão
        if ("Anonimizado".equals(dbData)) {
            return dbData;
        }
        try {
            return encryptor.decrypt(dbData);
        } catch (Exception e) {
            // Se falhar a descriptografia, retorna o valor bruto
            // (compatibilidade com dados antigos não criptografados)
            return dbData;
        }
    }
}
