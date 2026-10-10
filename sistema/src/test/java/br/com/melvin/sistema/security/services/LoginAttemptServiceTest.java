package br.com.melvin.sistema.security.services;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Limite de tentativas de login por IP e por matrícula, e teto de verificações de senha simultâneas.
 * O relógio é simulado para testar a janela sem esperar.
 */
class LoginAttemptServiceTest {

    private static final class RelogioMutavel extends Clock {
        private final AtomicReference<Instant> agora = new AtomicReference<>(Instant.parse("2026-10-10T12:00:00Z"));

        void avancar(Duration d) {
            agora.updateAndGet(i -> i.plus(d));
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return agora.get();
        }
    }

    private RelogioMutavel relogio;
    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        relogio = new RelogioMutavel();
        service = new LoginAttemptService(relogio, 2, Duration.ofMillis(50));
    }

    private void falhar(String ip, String login, int vezes) {
        for (int i = 0; i < vezes; i++) {
            service.registrarFalha(ip, login);
        }
    }

    @Test
    void naoBloqueiaQuemAindaNaoFalhou() {
        assertThat(service.bloqueado("1.1.1.1", "2026001")).isFalse();
    }

    @Test
    void bloqueiaAMatriculaAposODezFalhasMesmoDeOutroIp() {
        falhar("1.1.1.1", "2026001", LoginAttemptService.MAX_FALHAS_POR_LOGIN - 1);
        assertThat(service.bloqueado("1.1.1.1", "2026001")).isFalse();

        service.registrarFalha("2.2.2.2", "2026001");

        assertThat(service.bloqueado("3.3.3.3", "2026001")).as("matrícula bloqueada de qualquer IP").isTrue();
        assertThat(service.bloqueado("3.3.3.3", "2026002")).as("outra matrícula segue livre").isFalse();
    }

    @Test
    void bloqueiaOIpAposMuitasFalhasEmMatriculasDiferentes() {
        for (int i = 0; i < LoginAttemptService.MAX_FALHAS_POR_IP; i++) {
            service.registrarFalha("9.9.9.9", "matricula-" + i);
        }

        assertThat(service.bloqueado("9.9.9.9", "qualquer-outra")).isTrue();
        assertThat(service.bloqueado("8.8.8.8", "qualquer-outra")).as("outro IP segue livre").isFalse();
    }

    @Test
    void sucessoZeraAsFalhasDaMatriculaMasNaoDoIp() {
        falhar("5.5.5.5", "2026001", LoginAttemptService.MAX_FALHAS_POR_LOGIN - 1);

        service.registrarSucesso("2026001");

        assertThat(service.bloqueado("5.5.5.5", "2026001")).isFalse();
        falhar("5.5.5.5", "2026001", LoginAttemptService.MAX_FALHAS_POR_LOGIN - 1);
        assertThat(service.bloqueado("5.5.5.5", "2026001")).as("contagem recomeçou do zero").isFalse();
        // As falhas do IP continuam valendo: 18 de 20.
        falhar("5.5.5.5", "outra-1", 1);
        falhar("5.5.5.5", "outra-2", 1);
        assertThat(service.bloqueado("5.5.5.5", "outra-3")).as("IP chegou a 20 falhas").isTrue();
    }

    @Test
    void bloqueioExpiraQuandoAJanelaAcaba() {
        falhar("1.1.1.1", "2026001", LoginAttemptService.MAX_FALHAS_POR_LOGIN);
        assertThat(service.bloqueado("1.1.1.1", "2026001")).isTrue();

        relogio.avancar(LoginAttemptService.JANELA.minusSeconds(1));
        assertThat(service.bloqueado("1.1.1.1", "2026001")).as("ainda dentro da janela").isTrue();

        relogio.avancar(Duration.ofSeconds(2));
        assertThat(service.bloqueado("1.1.1.1", "2026001")).as("janela acabou").isFalse();
    }

    @Test
    void falhasForaDaJanelaNaoSeSomam() {
        falhar("1.1.1.1", "2026001", LoginAttemptService.MAX_FALHAS_POR_LOGIN - 1);
        relogio.avancar(LoginAttemptService.JANELA.plusSeconds(1));

        service.registrarFalha("1.1.1.1", "2026001");

        assertThat(service.bloqueado("1.1.1.1", "2026001")).isFalse();
    }

    @Test
    void matriculaNaoDependeDeMaiusculasNemDeEspacos() {
        falhar("1.1.1.1", "ABC123", LoginAttemptService.MAX_FALHAS_POR_LOGIN);

        assertThat(service.bloqueado("4.4.4.4", "  abc123 ")).isTrue();
    }

    @Test
    void loginNuloOuVazioNaoQuebra() {
        service.registrarFalha("1.1.1.1", null);
        service.registrarFalha("1.1.1.1", "   ");
        service.registrarSucesso(null);

        assertThat(service.bloqueado("1.1.1.1", null)).isFalse();
    }

    @Test
    void mapaNaoCresceSemLimiteComMatriculasInventadas() {
        // Cada tentativa pode usar uma matrícula diferente: o mapa tem teto e zera ao encher.
        for (int i = 0; i < 12_000; i++) {
            service.registrarFalha("1.1.1.1", "inventada-" + i);
        }

        assertThat(service.tamanhoMonitorado()).isLessThanOrEqualTo(10_002);
        assertThat(service.bloqueado("7.7.7.7", "nova")).isFalse();
    }

    // ---- teto de verificações de senha ao mesmo tempo (Argon2 usa 64 MB de heap por verificação) ----

    @Test
    void limitaVerificacoesSimultaneasDeSenha() {
        assertThat(service.adquirirVaga()).isTrue();
        assertThat(service.adquirirVaga()).isTrue();
        assertThat(service.adquirirVaga()).as("terceira espera e desiste").isFalse();

        service.liberarVaga();

        assertThat(service.adquirirVaga()).isTrue();
    }
}
