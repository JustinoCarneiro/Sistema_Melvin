package br.com.melvin.sistema.security.services;

import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContaDeEquipeAtivaTest {

    @Mock
    private VoluntarioRepository voluntarioRepository;

    @InjectMocks
    private ContaDeEquipeAtiva contaAtiva;

    private Voluntario voluntarioComStatus(String status) {
        Voluntario voluntario = new Voluntario();
        voluntario.setMatricula("2026001");
        voluntario.setStatus(status);
        return voluntario;
    }

    @Test
    void contaSemVoluntarioVinculadoEstaAtiva() {
        when(voluntarioRepository.findByMatricula("9999999")).thenReturn(null);

        assertThat(contaAtiva.ativa("9999999")).isTrue();
    }

    @Test
    void voluntarioAtivoMantemAContaAtiva() {
        when(voluntarioRepository.findByMatricula("2026001")).thenReturn(voluntarioComStatus("true"));

        assertThat(contaAtiva.ativa("2026001")).isTrue();
    }

    @Test
    void voluntarioDesligadoDesativaAConta() {
        when(voluntarioRepository.findByMatricula("2026001")).thenReturn(voluntarioComStatus("false"));

        assertThat(contaAtiva.ativa("2026001")).isFalse();
    }

    @Test
    void voluntarioSemStatusDesativaAConta() {
        when(voluntarioRepository.findByMatricula("2026001")).thenReturn(voluntarioComStatus(null));

        assertThat(contaAtiva.ativa("2026001")).isFalse();
    }
}
