package br.com.melvin.sistema.domain.discente.service;

import br.com.melvin.sistema.domain.diario.service.DiarioService;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import br.com.melvin.sistema.domain.frequencia.repository.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.domain.ocorrencia.model.CategoriaOcorrencia;
import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import br.com.melvin.sistema.domain.ocorrencia.repository.OcorrenciaRepository;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import br.com.melvin.sistema.shared.service.ExcelExportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;

/**
 * US-3.3 com repositórios reais (H2): garante a ordem de gravação (a ficha é gravada antes de o
 * UPDATE em massa das frequências limpar o contexto de persistência) e a cascata de verdade,
 * relendo tudo do banco. O serviço é o real; só diário, Excel e permissões são dublês.
 */
@DataJpaTest
@ActiveProfiles("test")
@Import(DiscenteService.class)
public class DiscenteRemocaoIntegracaoTest {

    @Autowired
    private DiscenteService service;

    @Autowired
    private DiscenteRepository discenteRepository;

    @Autowired
    private FrequenciaDiscenteRepository frequenciaRepository;

    @Autowired
    private OcorrenciaRepository ocorrenciaRepository;

    @Autowired
    private TestEntityManager em;

    @MockBean
    private DiarioService diarioService;

    @MockBean
    private ExcelExportService excelExportService;

    @MockBean
    private PermissaoService permissaoService;

    private Discente aluno(String matricula, String nome) {
        Discente d = new Discente();
        d.setMatricula(matricula);
        d.setNome(nome);
        d.setNome_mae("Mãe de " + nome);
        d.setNome_pai("Pai de " + nome);
        d.setEmail(nome.toLowerCase().replace(' ', '.') + "@email.com");
        d.setEmail_responsavel("responsavel." + matricula + "@email.com");
        d.setData(LocalDate.of(2015, 6, 20));
        d.setCor("Parda");
        d.setEndereco("Rua A, 10");
        d.setBairro("Centro");
        d.setCidade("Fortaleza");
        d.setSala(3);
        d.setTurno("manha");
        d.setSexo("F");
        d.setStatus("true");
        d.setRenda_total("1500");
        d.setOcupacao_mae("Padeira");
        return discenteRepository.save(d);
    }

    private void frequencia(String matricula, String nome, LocalDate data) {
        FrequenciaDiscente f = new FrequenciaDiscente();
        f.setMatricula(matricula);
        f.setNome(nome);
        f.setData(data);
        f.setSala(3);
        f.setPresenca_manha("P");
        f.setPresenca_tarde("F");
        frequenciaRepository.save(f);
    }

    private void ocorrencia(String matricula, String descricao) {
        Ocorrencia o = new Ocorrencia();
        o.setMatricula_discente(matricula);
        o.setCategoria(CategoriaOcorrencia.PEDAGOGICA);
        o.setDescricao(descricao);
        o.setAutor_login("PROF001");
        o.setData_ocorrencia(LocalDate.of(2026, 3, 10));
        o.setCriado_em(LocalDateTime.of(2026, 3, 10, 9, 0));
        ocorrenciaRepository.save(o);
    }

    @Test
    public void removerGravaFichaFrequenciasEOcorrenciasNoBancoSemAfetarOutroAluno() {
        aluno("2026001", "Maria da Silva");
        aluno("2026002", "Pedro Souza");
        frequencia("2026001", "Maria da Silva", LocalDate.of(2026, 3, 2));
        frequencia("2026001", "Maria da Silva", LocalDate.of(2026, 3, 3));
        frequencia("2026002", "Pedro Souza", LocalDate.of(2026, 3, 2));
        ocorrencia("2026001", "Maria discutiu com o João");
        ocorrencia("2026002", "Pedro chegou atrasado");
        em.flush();
        em.clear();
        doReturn(ResponseEntity.ok("ok")).when(diarioService).deleteDiarioByMatricula("2026001");

        service.remover("2026001");
        em.flush();
        em.clear();

        Discente removido = discenteRepository.findByMatricula("2026001");
        assertThat(removido.getMatricula()).isEqualTo("2026001");
        assertThat(removido.getStatus()).isEqualTo("false");
        assertThat(removido.getNome()).isEqualTo("Aluno removido");
        assertThat(removido.getNome_mae()).isNull();
        assertThat(removido.getNome_pai()).isNull();
        assertThat(removido.getEmail()).isNull();
        assertThat(removido.getEmail_responsavel()).isNull();
        assertThat(removido.getRenda_total()).isNull();
        assertThat(removido.getOcupacao_mae()).isNull();
        assertThat(removido.getCidade()).isEqualTo("Anonimizado");
        assertThat(removido.getData()).isEqualTo(LocalDate.of(2015, 1, 1));
        assertThat(removido.getSala()).isEqualTo(3);
        assertThat(removido.getSexo()).isEqualTo("F");

        List<FrequenciaDiscente> frequencias = frequenciaRepository.findAll();
        assertThat(frequencias).filteredOn(f -> f.getMatricula().equals("2026001"))
                .hasSize(2).extracting(FrequenciaDiscente::getNome).containsOnly("Aluno removido");
        assertThat(frequencias).filteredOn(f -> f.getMatricula().equals("2026002"))
                .extracting(FrequenciaDiscente::getNome).containsOnly("Pedro Souza");

        assertThat(ocorrenciaRepository.findAllByMatriculaOrdenadoPorDataDesc("2026001"))
                .extracting(Ocorrencia::getDescricao)
                .containsOnly("Conteúdo removido por eliminação de dados do aluno");
        assertThat(ocorrenciaRepository.findAllByMatriculaOrdenadoPorDataDesc("2026002"))
                .extracting(Ocorrencia::getDescricao).containsOnly("Pedro chegou atrasado");

        Discente outro = discenteRepository.findByMatricula("2026002");
        assertThat(outro.getNome()).isEqualTo("Pedro Souza");
        assertThat(outro.getNome_mae()).isEqualTo("Mãe de Pedro Souza");
        assertThat(outro.getStatus()).isEqualTo("true");
    }
}
