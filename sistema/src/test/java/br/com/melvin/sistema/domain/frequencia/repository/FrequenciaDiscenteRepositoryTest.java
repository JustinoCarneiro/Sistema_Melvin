package br.com.melvin.sistema.domain.frequencia.repository;

import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import br.com.melvin.sistema.domain.frequencia.dto.FaltaAlertaDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class FrequenciaDiscenteRepositoryTest {

    @Autowired
    private FrequenciaDiscenteRepository repository;

    private FrequenciaDiscente createFrequencia(String matricula, LocalDate data, String presencaManha, String presencaTarde, String justificativa) {
        FrequenciaDiscente f = new FrequenciaDiscente();
        f.setMatricula(matricula);
        f.setData(data);
        f.setNome("Aluno Teste");
        f.setSala(1);
        f.setPresenca_manha(presencaManha);
        f.setPresenca_tarde(presencaTarde);
        f.setJustificativa(justificativa);
        return repository.save(f);
    }

    @Test
    public void deveRetornarAlertaParaQuatroFaltasInjustificadas() {
        String matricula = "12345";
        LocalDate inicioMes = LocalDate.of(2023, 10, 1);
        LocalDate fimMes = LocalDate.of(2023, 10, 31);

        createFrequencia(matricula, LocalDate.of(2023, 10, 2), "F", "P", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 3), "P", "F", "");
        createFrequencia(matricula, LocalDate.of(2023, 10, 4), "F", "F", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 5), "F", "P", "");

        List<FaltaAlertaDTO> resultado = repository.findMatriculasComQuatroOuMaisFaltasInjustificadas(inicioMes, fimMes);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getMatricula()).isEqualTo(matricula);
        assertThat(resultado.get(0).getQuantidade()).isEqualTo(4L);
    }

    @Test
    public void naoDeveRetornarAlertaParaTresFaltasInjustificadas() {
        String matricula = "12345";
        LocalDate inicioMes = LocalDate.of(2023, 10, 1);
        LocalDate fimMes = LocalDate.of(2023, 10, 31);

        createFrequencia(matricula, LocalDate.of(2023, 10, 2), "F", "P", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 3), "P", "F", "");
        createFrequencia(matricula, LocalDate.of(2023, 10, 4), "F", "F", null);

        List<FaltaAlertaDTO> resultado = repository.findMatriculasComQuatroOuMaisFaltasInjustificadas(inicioMes, fimMes);

        assertThat(resultado).isEmpty();
    }

    @Test
    public void naoDeveContarFaltasJustificadas() {
        String matricula = "12345";
        LocalDate inicioMes = LocalDate.of(2023, 10, 1);
        LocalDate fimMes = LocalDate.of(2023, 10, 31);

        createFrequencia(matricula, LocalDate.of(2023, 10, 2), "F", "P", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 3), "P", "F", "");
        createFrequencia(matricula, LocalDate.of(2023, 10, 4), "F", "F", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 5), "F", "P", "Atestado médico"); // justificada

        List<FaltaAlertaDTO> resultado = repository.findMatriculasComQuatroOuMaisFaltasInjustificadas(inicioMes, fimMes);

        assertThat(resultado).isEmpty(); // tem 3 injustificadas, não deve alertar
    }

    @Test
    public void naoDeveRetornarFaltasForaDoMes() {
        String matricula = "12345";
        LocalDate inicioMes = LocalDate.of(2023, 10, 1);
        LocalDate fimMes = LocalDate.of(2023, 10, 31);

        createFrequencia(matricula, LocalDate.of(2023, 9, 30), "F", "P", null); // fora do mês
        createFrequencia(matricula, LocalDate.of(2023, 10, 3), "P", "F", "");
        createFrequencia(matricula, LocalDate.of(2023, 10, 4), "F", "F", null);
        createFrequencia(matricula, LocalDate.of(2023, 10, 5), "F", "P", "");
        createFrequencia(matricula, LocalDate.of(2023, 11, 1), "F", "P", ""); // fora do mês

        List<FaltaAlertaDTO> resultado = repository.findMatriculasComQuatroOuMaisFaltasInjustificadas(inicioMes, fimMes);

        assertThat(resultado).isEmpty(); // Apenas 3 dentro do mês
    }
}
