package br.com.melvin.sistema.domain.ocorrenciatecnica.repository;

import br.com.melvin.sistema.domain.ocorrenciatecnica.model.CategoriaOcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.model.OcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.model.SeveridadeOcorrenciaTecnica;
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
public class OcorrenciaTecnicaRepositoryTest {

    @Autowired
    private OcorrenciaTecnicaRepository repository;

    private OcorrenciaTecnica createOcorrencia(LocalDate dataOcorrencia, LocalDateTime criadoEm, String titulo) {
        OcorrenciaTecnica o = new OcorrenciaTecnica();
        o.setTitulo(titulo);
        o.setCategoria(CategoriaOcorrenciaTecnica.INCIDENTE);
        o.setSeveridade(SeveridadeOcorrenciaTecnica.MEDIA);
        o.setDescricao("descrição de teste");
        o.setAutorLogin("2026009");
        o.setDataOcorrencia(dataOcorrencia);
        o.setCriadoEm(criadoEm);
        return repository.save(o);
    }

    @Test
    public void deveRetornarOcorrenciasEmOrdemCronologicaDecrescente() {
        createOcorrencia(LocalDate.of(2026, 3, 1), LocalDateTime.of(2026, 3, 1, 10, 0), "primeira");
        createOcorrencia(LocalDate.of(2026, 5, 10), LocalDateTime.of(2026, 5, 10, 9, 0), "mais recente");
        createOcorrencia(LocalDate.of(2026, 4, 15), LocalDateTime.of(2026, 4, 15, 14, 0), "intermediaria");

        List<OcorrenciaTecnica> resultado = repository.findAllByOrderByDataOcorrenciaDescCriadoEmDesc();

        assertThat(resultado).hasSize(3);
        assertThat(resultado).extracting(OcorrenciaTecnica::getTitulo)
                .containsExactly("mais recente", "intermediaria", "primeira");
    }

    @Test
    public void deveDesempatarPorDataDeCriacaoQuandoMesmaDataDeOcorrencia() {
        createOcorrencia(LocalDate.of(2026, 5, 1), LocalDateTime.of(2026, 5, 1, 8, 0), "registrada primeiro");
        createOcorrencia(LocalDate.of(2026, 5, 1), LocalDateTime.of(2026, 5, 1, 16, 0), "registrada depois");

        List<OcorrenciaTecnica> resultado = repository.findAllByOrderByDataOcorrenciaDescCriadoEmDesc();

        assertThat(resultado).extracting(OcorrenciaTecnica::getTitulo)
                .containsExactly("registrada depois", "registrada primeiro");
    }
}
