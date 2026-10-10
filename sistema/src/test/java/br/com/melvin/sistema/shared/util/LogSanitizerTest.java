package br.com.melvin.sistema.shared.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LogSanitizerTest {

    @Test
    void trocaQuebraDeLinhaEOutrosCaracteresDeControle() {
        String forjado = "2026001\n2026-10-10 12:00:00 INFO Login bem-sucedido para o usuário: admin\r\t";

        String limpo = LogSanitizer.limpar(forjado);

        assertThat(limpo).doesNotContain("\n").doesNotContain("\r").doesNotContain("\t");
        assertThat(limpo).startsWith("2026001_2026-10-10");
    }

    @Test
    void mantemTextoNormalComAcentos() {
        assertThat(LogSanitizer.limpar("Maria da Conceição")).isEqualTo("Maria da Conceição");
    }

    @Test
    void limitaOTamanho() {
        String limpo = LogSanitizer.limpar("x".repeat(500));

        assertThat(limpo).hasSize(101).endsWith("…");
    }

    @Test
    void nuloViraTexto() {
        assertThat(LogSanitizer.limpar(null)).isEqualTo("null");
    }
}
