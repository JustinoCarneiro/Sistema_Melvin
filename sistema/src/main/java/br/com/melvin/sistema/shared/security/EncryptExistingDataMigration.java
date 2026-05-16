package br.com.melvin.sistema.shared.security;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Migração única: criptografa dados sensíveis que já existem no banco em texto plano.
 * Detecta automaticamente se um campo já está criptografado (Base64 válido com IV+ciphertext)
 * e pula esses registros, tornando a execução idempotente e segura para re-runs.
 */
@Component
@Order(1)
public class EncryptExistingDataMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EncryptExistingDataMigration.class);

    private final JdbcTemplate jdbc;
    private final FieldEncryptor encryptor;
    private final boolean enabled;

    public EncryptExistingDataMigration(
            JdbcTemplate jdbc,
            @Value("${melvin.encryption.key:CHANGE_ME_IN_PRODUCTION}") String key) {
        this.jdbc = jdbc;
        if (key != null && !key.isBlank() && !key.equals("CHANGE_ME_IN_PRODUCTION")) {
            this.encryptor = new FieldEncryptor(key);
            this.enabled = true;
        } else {
            this.encryptor = null;
            this.enabled = false;
        }
    }

    @Override
    public void run(String... args) {
        if (!enabled) {
            log.info("[Migração AES] Criptografia desabilitada (chave não configurada). Pulando migração.");
            return;
        }

        log.info("[Migração AES] Iniciando criptografia de dados existentes...");

        // Discente - campos sensíveis
        migrateTable("discente", List.of(
            "email", "contato", "rg", "contato_pai", "local_trabalho_pai",
            "contato_trabalho_pai", "contato_mae", "local_trabalho_mae",
            "contato_trabalho_mae", "renda_total", "doenca", "medicacao",
            "remedio_instituto", "tratamento", "horario_medicamento", "contato_saida"
        ));

        // Voluntario - campos sensíveis
        migrateTable("voluntario", List.of("email", "contato", "rg"));

        // AmigoMelvin - campos sensíveis
        migrateTable("amigomelvin", List.of(
            "contato", "email", "stripe_customer_id", "subscription_id"
        ));

        // Cestas - CPF e contato do beneficiário
        migrateTable("cestas", List.of("cpf", "contato"));

        // Embaixador - dados de contato pessoal
        migrateTable("embaixador", List.of("contato", "email", "instagram"));

        // DoacaoItem - telefone do doador
        migrateTable("doacao_item", List.of("telefone"));

        log.info("[Migração AES] Criptografia de dados existentes concluída.");
    }

    private void migrateTable(String table, List<String> columns) {
        int totalMigrated = 0;
        for (String col : columns) {
            try {
                // Busca todos os registros com valor não-nulo e não-anonimizado
                String sql = String.format(
                    "SELECT id, %s FROM %s WHERE %s IS NOT NULL AND %s != 'Anonimizado'",
                    col, table, col, col
                );
                List<Map<String, Object>> rows = jdbc.queryForList(Objects.requireNonNull(sql));
                if (rows == null || rows.isEmpty()) continue;

                int colMigrated = 0;
                for (Map<String, Object> row : rows) {
                    String value = (String) row.get(col);
                    if (value == null || value.isBlank()) continue;

                    // Verifica se já está criptografado (Base64 que descriptografa com sucesso)
                    if (isAlreadyEncrypted(value)) continue;

                    String encrypted = encryptor.encrypt(value);
                    String updateSql = String.format("UPDATE %s SET %s = ? WHERE id = ?", table, col);
                    Object idValue = row.get("id");
                    if (idValue == null) continue;
                    jdbc.update(Objects.requireNonNull(updateSql), Objects.requireNonNull(encrypted), idValue);
                    colMigrated++;
                }
                totalMigrated += colMigrated;
                if (colMigrated > 0) {
                    log.info("[Migração AES] {}.{}: {} registros criptografados", table, col, colMigrated);
                }
            } catch (Exception e) {
                log.warn("[Migração AES] Erro ao migrar {}.{}: {}", table, col, e.getMessage());
            }
        }
        if (totalMigrated > 0) {
            log.info("[Migração AES] Tabela {}: total de {} campos criptografados", table, totalMigrated);
        }
    }

    /**
     * Verifica se um valor já está criptografado tentando descriptografá-lo.
     * Se a descriptografia funcionar, o valor já foi migrado.
     */
    private boolean isAlreadyEncrypted(String value) {
        try {
            // Valores curtos ou com espaços provavelmente são texto plano
            if (value.length() < 20) return false;

            // Tenta decodificar como Base64
            byte[] decoded = Base64.getDecoder().decode(value);
            if (decoded.length < 13) return false; // Mínimo: 12 bytes IV + 1 byte

            // Tenta descriptografar
            encryptor.decrypt(value);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
