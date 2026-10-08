package br.com.melvin.sistema.domain.cestas.repository;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class CestasRepositoryTest {

    @Autowired
    private CestasRepository repository;

    @Test
    void cancelamentoVencedorImpedeConfirmacaoDeEntregaPosterior() {
        Cestas cesta = cestaAgendada();

        int canceladas = repository.cancelarSeStatusAtual(
                cesta.getId(), StatusCesta.AGENDADA, StatusCesta.CANCELADA);
        int entregues = repository.confirmarEntregaSeAgendada(
                cesta.getId(), StatusCesta.AGENDADA, StatusCesta.ENTREGUE, LocalDateTime.now());

        assertThat(canceladas).isEqualTo(1);
        assertThat(entregues).isZero();
        Cestas persistida = repository.findById(cesta.getId()).orElseThrow();
        assertThat(persistida.getStatus()).isEqualTo(StatusCesta.CANCELADA);
        assertThat(persistida.getQrCodeToken()).isNull();
    }

    @Test
    void entregaVencedoraImpedeCancelamentoPosterior() {
        Cestas cesta = cestaAgendada();

        int entregues = repository.confirmarEntregaSeAgendada(
                cesta.getId(), StatusCesta.AGENDADA, StatusCesta.ENTREGUE, LocalDateTime.now());
        int canceladas = repository.cancelarSeStatusAtual(
                cesta.getId(), StatusCesta.AGENDADA, StatusCesta.CANCELADA);

        Cestas persistida = repository.findById(cesta.getId()).orElseThrow();
        assertThat(entregues).isEqualTo(1);
        assertThat(canceladas).isZero();
        assertThat(persistida.getStatus()).isEqualTo(StatusCesta.ENTREGUE);
        assertThat(persistida.getEntregueEm()).isNotNull();
    }

    @Test
    void cancelamentoVencedorImpedeAgendamentoPosterior() {
        Cestas cesta = new Cestas();
        cesta.setNome("Beneficiário Pendente de Teste");
        cesta.setStatus(StatusCesta.SOLICITADA);
        cesta = repository.saveAndFlush(cesta);

        int canceladas = repository.cancelarSeStatusAtual(
                cesta.getId(), StatusCesta.SOLICITADA, StatusCesta.CANCELADA);
        int agendadas = repository.agendarSeSolicitada(
                cesta.getId(), StatusCesta.SOLICITADA, StatusCesta.AGENDADA,
                java.time.LocalDate.now().plusDays(3), "token-sintetico");

        Cestas persistida = repository.findById(cesta.getId()).orElseThrow();
        assertThat(canceladas).isEqualTo(1);
        assertThat(agendadas).isZero();
        assertThat(persistida.getStatus()).isEqualTo(StatusCesta.CANCELADA);
        assertThat(persistida.getQrCodeToken()).isNull();
    }

    @Test
    void validacaoVencedoraImpedeCancelamentoQueLeuStatusSolicitada() {
        Cestas cesta = new Cestas();
        cesta.setNome("Beneficiário em Validação");
        cesta.setStatus(StatusCesta.SOLICITADA);
        cesta = repository.saveAndFlush(cesta);

        int agendadas = repository.agendarSeSolicitada(
                cesta.getId(), StatusCesta.SOLICITADA, StatusCesta.AGENDADA,
                java.time.LocalDate.now().plusDays(3), "token-sintetico");
        int canceladas = repository.cancelarSeStatusAtual(
                cesta.getId(), StatusCesta.SOLICITADA, StatusCesta.CANCELADA);

        Cestas persistida = repository.findById(cesta.getId()).orElseThrow();
        assertThat(agendadas).isEqualTo(1);
        assertThat(canceladas).isZero();
        assertThat(persistida.getStatus()).isEqualTo(StatusCesta.AGENDADA);
        assertThat(persistida.getQrCodeToken()).isEqualTo("token-sintetico");
    }

    private Cestas cestaAgendada() {
        Cestas cesta = new Cestas();
        cesta.setNome("Beneficiário de Teste");
        cesta.setStatus(StatusCesta.AGENDADA);
        cesta.setQrCodeToken("token-sintetico");
        return repository.saveAndFlush(cesta);
    }
}
