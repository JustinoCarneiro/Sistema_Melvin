package br.com.melvin.sistema.domain.dashboard.service;

import br.com.melvin.sistema.domain.dashboard.dto.AlunoRankingDTO;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private DiscenteRepository discenteRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Discente aluno1;
    private Discente aluno2;
    private Discente aluno3;
    private Discente alunoComNulls;

    @BeforeEach
    void setUp() {
        aluno1 = new Discente();
        aluno1.setMatricula("111");
        aluno1.setNome("Aluno A");
        aluno1.setAvaliacaoPresenca(9.0);
        aluno1.setAvaliacaoParticipacao(9.0);
        aluno1.setAvaliacaoComportamento(8.0);
        aluno1.setAvaliacaoRendimento(10.0);
        aluno1.setAvaliacaoPsicologico(8.0);
        // Media = 44 / 5 = 8.8

        aluno2 = new Discente();
        aluno2.setMatricula("222");
        aluno2.setNome("Aluno B");
        aluno2.setAvaliacaoPresenca(8.0);
        aluno2.setAvaliacaoParticipacao(8.0);
        aluno2.setAvaliacaoComportamento(8.0);
        aluno2.setAvaliacaoRendimento(8.0);
        aluno2.setAvaliacaoPsicologico(8.0);
        // Media = 40 / 5 = 8.0

        aluno3 = new Discente();
        aluno3.setMatricula("333");
        aluno3.setNome("Aluno C");
        aluno3.setAvaliacaoPresenca(10.0);
        aluno3.setAvaliacaoParticipacao(10.0);
        aluno3.setAvaliacaoComportamento(10.0);
        aluno3.setAvaliacaoRendimento(10.0);
        aluno3.setAvaliacaoPsicologico(10.0);
        // Media = 50 / 5 = 10.0

        alunoComNulls = new Discente();
        alunoComNulls.setMatricula("444");
        alunoComNulls.setNome("Aluno D");
        alunoComNulls.setAvaliacaoPresenca(null);
        alunoComNulls.setAvaliacaoParticipacao(null);
        alunoComNulls.setAvaliacaoComportamento(10.0);
        alunoComNulls.setAvaliacaoRendimento(10.0);
        alunoComNulls.setAvaliacaoPsicologico(null);
        // Media = 20 / 5 = 4.0
    }

    @Test
    void deveRetornarRankingGeralOrdenadoPorMedia() {
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(aluno1, aluno2, aluno3, alunoComNulls));

        // Testando a média geral
        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(3, "geral", true);

        assertThat(ranking).hasSize(3);
        assertThat(ranking.get(0).getNome()).isEqualTo("Aluno C"); // Media 10.0
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(10.0);
        
        assertThat(ranking.get(1).getNome()).isEqualTo("Aluno A"); // Media 8.8
        assertThat(ranking.get(1).getMediaGeral()).isEqualTo(8.8);

        assertThat(ranking.get(2).getNome()).isEqualTo("Aluno B"); // Media 8.0
        assertThat(ranking.get(2).getMediaGeral()).isEqualTo(8.0);
    }

    @Test
    void deveLidarComValoresNulosNoCalculoDeMediaGeral() {
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(alunoComNulls));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(1, "geral", true);

        assertThat(ranking).hasSize(1);
        assertThat(ranking.get(0).getNome()).isEqualTo("Aluno D");
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(4.0); // 20 / 5 = 4.0
    }

    @Test
    void deveRetornarRankingOrdenadoPorCategoriaEspecifica() {
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(aluno1, aluno2, aluno3, alunoComNulls));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(4, "presenca", true);

        assertThat(ranking).hasSize(4);
        assertThat(ranking.get(0).getNome()).isEqualTo("Aluno C"); // Presenca 10
        assertThat(ranking.get(1).getNome()).isEqualTo("Aluno A"); // Presenca 10
        assertThat(ranking.get(2).getNome()).isEqualTo("Aluno B"); // Presenca 8
        assertThat(ranking.get(3).getNome()).isEqualTo("Aluno D"); // Presenca nula (0.0) -> Pega como 0 ou último
    }

    // ---- Média sem a nota psicológica (quem não é Psicologia nem Coordenação) ----

    private Discente aluno(String matricula, String nome, double pres, double part, double comp, double rend, double psico) {
        Discente d = new Discente();
        d.setMatricula(matricula);
        d.setNome(nome);
        d.setAvaliacaoPresenca(pres);
        d.setAvaliacaoParticipacao(part);
        d.setAvaliacaoComportamento(comp);
        d.setAvaliacaoRendimento(rend);
        d.setAvaliacaoPsicologico(psico);
        return d;
    }

    @Test
    void semAcessoPsicologicoAMediaIgnoraANotaPsicologicaEUsaQuatroNotas() {
        // X: (8+6+10+8)/4 = 8.0 sem psicológica; (8+6+10+8+2)/5 = 6.8 com ela
        // Y: (7+7+7+7)/4 = 7.0 sem psicológica; (7+7+7+7+10)/5 = 7.6 com ela
        Discente x = aluno("901", "Aluno X", 8, 6, 10, 8, 2);
        Discente y = aluno("902", "Aluno Y", 7, 7, 7, 7, 10);
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(x, y));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(5, "media", false);

        assertThat(ranking).extracting(AlunoRankingDTO::getNome).containsExactly("Aluno X", "Aluno Y");
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(8.0);
        assertThat(ranking.get(1).getMediaGeral()).isEqualTo(7.0);
    }

    @Test
    void comAcessoPsicologicoAMediaContinuaUsandoAsCincoNotas() {
        Discente x = aluno("901", "Aluno X", 8, 6, 10, 8, 2);
        Discente y = aluno("902", "Aluno Y", 7, 7, 7, 7, 10);
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(x, y));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(5, "media", true);

        assertThat(ranking).extracting(AlunoRankingDTO::getNome).containsExactly("Aluno Y", "Aluno X");
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(7.6);
        assertThat(ranking.get(1).getMediaGeral()).isEqualTo(6.8);
    }

    @Test
    void semAcessoPsicologicoNotasNulasContamComoZeroNaMediaDeQuatro() {
        // D: (0+0+10+10)/4 = 5.0
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(alunoComNulls));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(1, "media", false);

        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(5.0);
    }

    @Test
    void semAcessoPsicologicoNegaAOrdenacaoPsicologicaSemLerOBanco() {
        assertThatThrownBy(() -> dashboardService.getRankingAlunos(5, "psicologico", false))
                .isInstanceOf(AccessDeniedException.class);

        verifyNoInteractions(discenteRepository);
    }

    @Test
    void comAcessoPsicologicoOrdenaPelaNotaPsicologica() {
        Discente x = aluno("901", "Aluno X", 8, 6, 10, 8, 2);
        Discente y = aluno("902", "Aluno Y", 7, 7, 7, 7, 10);
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(x, y));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(5, "psicologico", true);

        assertThat(ranking).extracting(AlunoRankingDTO::getNome).containsExactly("Aluno Y", "Aluno X");
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(10.0);
    }

    @Test
    void semAcessoPsicologicoAsCategoriasPedagogicasContinuamDisponiveis() {
        Discente x = aluno("901", "Aluno X", 8, 6, 10, 8, 2);
        Discente y = aluno("902", "Aluno Y", 7, 7, 7, 7, 10);
        when(discenteRepository.findAll()).thenReturn(Arrays.asList(x, y));

        List<AlunoRankingDTO> ranking = dashboardService.getRankingAlunos(5, "comportamento", false);

        assertThat(ranking).extracting(AlunoRankingDTO::getNome).containsExactly("Aluno X", "Aluno Y");
        assertThat(ranking.get(0).getMediaGeral()).isEqualTo(10.0);
    }
}
