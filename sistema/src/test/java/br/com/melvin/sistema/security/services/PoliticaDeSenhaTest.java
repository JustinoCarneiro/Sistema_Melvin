package br.com.melvin.sistema.security.services;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PoliticaDeSenhaTest {

    @Test
    void aceitaSenhaDeTamanhoRazoavelQueNaoEObvia() {
        assertThat(PoliticaDeSenha.valida("2026001", "cafe-com-pao-42")).isTrue();
        assertThat(PoliticaDeSenha.valida("2026001", "oitoletr")).isTrue();
    }

    @Test
    void recusaSenhaCurtaOuLongaDemais() {
        assertThat(PoliticaDeSenha.valida("2026001", "curta12")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "a1".repeat(65))).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "a1".repeat(64))).isTrue();
    }

    @Test
    void recusaSenhaVaziaNulaOuSoEspacos() {
        assertThat(PoliticaDeSenha.valida("2026001", null)).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "        ")).isFalse();
    }

    @Test
    void recusaAMatriculaComoSenha() {
        assertThat(PoliticaDeSenha.valida("20260012", "20260012")).isFalse();
        assertThat(PoliticaDeSenha.valida("Maria.Silva", "maria.silva")).isFalse();
    }

    @Test
    void recusaSenhasComunsEmQualquerCaixa() {
        assertThat(PoliticaDeSenha.valida("2026001", "12345678")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "Password")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "InstitutoMelvin")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "Melvin123")).isFalse();
    }

    @Test
    void recusaUmCaractereRepetido() {
        assertThat(PoliticaDeSenha.valida("2026001", "aaaaaaaa")).isFalse();
        assertThat(PoliticaDeSenha.valida("2026001", "77777777")).isFalse();
    }

    @Test
    void mensagemExplicaARegra() {
        assertThat(PoliticaDeSenha.MENSAGEM).contains("8").contains("128").contains("matrícula");
    }
}
