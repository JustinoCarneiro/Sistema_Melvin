package br.com.melvin.sistema.domain.ocorrencia.repository;

import br.com.melvin.sistema.domain.ocorrencia.model.CategoriaOcorrencia;
import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class OcorrenciaRepositoryTest {

    @Autowired
    private OcorrenciaRepository repository;

    private Ocorrencia createOcorrencia(String matricula, LocalDate dataOcorrencia, LocalDateTime criadoEm, String descricao) {
        Ocorrencia o = new Ocorrencia();
        o.setMatricula_discente(matricula);
        o.setCategoria(CategoriaOcorrencia.COMPORTAMENTAL);
        o.setDescricao(descricao);
        o.setAutor_login("PROF001");
        o.setData_ocorrencia(dataOcorrencia);
        o.setCriado_em(criadoEm);
        return repository.save(o);
    }

    @Test
    public void deveRetornarOcorrenciasDoAlunoEmOrdemCronologicaDecrescente() {
        String matricula = "2026001";
        createOcorrencia(matricula, LocalDate.of(2026, 3, 1), LocalDateTime.of(2026, 3, 1, 10, 0), "primeira");
        createOcorrencia(matricula, LocalDate.of(2026, 5, 10), LocalDateTime.of(2026, 5, 10, 9, 0), "mais recente");
        createOcorrencia(matricula, LocalDate.of(2026, 4, 15), LocalDateTime.of(2026, 4, 15, 14, 0), "intermediaria");
        createOcorrencia("2026002", LocalDate.of(2026, 6, 1), LocalDateTime.of(2026, 6, 1, 8, 0), "de outro aluno");

        List<Ocorrencia> resultado = repository.findAllByMatriculaOrdenadoPorDataDesc(matricula);

        assertThat(resultado).hasSize(3);
        assertThat(resultado).extracting(Ocorrencia::getDescricao)
                .containsExactly("mais recente", "intermediaria", "primeira");
    }

    @Test
    public void deveDesempatarPorDataDeCriacaoQuandoMesmaDataDeOcorrencia() {
        String matricula = "2026003";
        createOcorrencia(matricula, LocalDate.of(2026, 5, 1), LocalDateTime.of(2026, 5, 1, 8, 0), "registrada primeiro");
        createOcorrencia(matricula, LocalDate.of(2026, 5, 1), LocalDateTime.of(2026, 5, 1, 16, 0), "registrada depois");

        List<Ocorrencia> resultado = repository.findAllByMatriculaOrdenadoPorDataDesc(matricula);

        assertThat(resultado).extracting(Ocorrencia::getDescricao)
                .containsExactly("registrada depois", "registrada primeiro");
    }
}
