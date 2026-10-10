package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.dashboard.service.DashboardService;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regra do ranking (Destaques): quem tem VISUALIZAR_RELATORIOS vê as categorias pedagógicas e a
 * média de quatro notas; a ordenação psicológica e a média com a nota psicológica ficam só
 * para PSICO e COOR.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardRankingSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermissaoService permissaoService;

    @MockBean
    private DashboardService dashboardService;

    private void relatorios(boolean liberado) {
        when(permissaoService.hasPermission(any(Authentication.class), eq("VISUALIZAR_RELATORIOS")))
                .thenReturn(liberado);
    }

    // ---- docência e demais cargos com Visualizar Relatórios: sem nota psicológica ----

    @Test
    @WithMockUser(roles = "PROF")
    void permiteMediaPedagogicaAoProfessorComPermissaoDeRelatorios() throws Exception {
        relatorios(true);
        when(dashboardService.getRankingAlunos(5, "media", false)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "media", false);
    }

    @Test
    @WithMockUser(roles = "PROF")
    void permiteCategoriaPedagogicaAoProfessor() throws Exception {
        relatorios(true);
        when(dashboardService.getRankingAlunos(5, "comportamento", false)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "comportamento"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "comportamento", false);
    }

    @Test
    @WithMockUser(roles = "ASSIST")
    void permiteMediaPedagogicaAAssistenciaComPermissao() throws Exception {
        relatorios(true);
        when(dashboardService.getRankingAlunos(5, "media", false)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "media", false);
    }

    @Test
    @WithMockUser(roles = "ADM")
    void permiteMediaPedagogicaAAdministracaoComPermissao() throws Exception {
        relatorios(true);
        when(dashboardService.getRankingAlunos(5, "media", false)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "media", false);
    }

    @Test
    @WithMockUser(roles = "PROF")
    void negaAoProfessorSemPermissaoDeRelatorios() throws Exception {
        relatorios(false);

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getRankingAlunos(anyInt(), anyString(), anyBoolean());
    }

    @Test
    @WithMockUser(roles = "COZI")
    void negaRankingACozinhaSemPermissao() throws Exception {
        relatorios(false);

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getRankingAlunos(anyInt(), anyString(), anyBoolean());
    }

    // ---- nota psicológica: só PSICO e COOR ----

    @Test
    @WithMockUser(roles = "PROF")
    void negaRankingPsicologicoAoProfessorMesmoComPermissaoDeRelatorios() throws Exception {
        relatorios(true);

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getRankingAlunos(anyInt(), anyString(), anyBoolean());
    }

    @Test
    @WithMockUser(roles = "ADM")
    void negaRankingPsicologicoAAdministracao() throws Exception {
        relatorios(true);

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROF")
    void negaRankingPsicologicoQuandoOParametroVemRepetido() throws Exception {
        relatorios(true);

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "media", "psicologico"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getRankingAlunos(anyInt(), anyString(), anyBoolean());
    }

    @Test
    @WithMockUser(roles = "PROF")
    void negaRankingPsicologicoIgnorandoMaiusculas() throws Exception {
        relatorios(true);

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "PSICOLOGICO"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PSICO")
    void permiteRankingPsicologicoAoPsicologo() throws Exception {
        when(dashboardService.getRankingAlunos(5, "psicologico", true)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "psicologico", true);
    }

    @Test
    @WithMockUser(roles = "COOR")
    void permiteMediaComNotaPsicologicaACoordenacao() throws Exception {
        when(dashboardService.getRankingAlunos(5, "media", true)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "media", true);
    }

    @Test
    @WithMockUser(roles = "COOR")
    void psicologiaECoordenacaoNaoDependemDaPermissaoDeRelatorios() throws Exception {
        relatorios(false);
        when(dashboardService.getRankingAlunos(5, "psicologico", true)).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isOk());
    }

    // ---- sem login e rotas vizinhas ----

    @Test
    void negaRankingSemLoginMesmoSeAPermissaoForSimuladaComoLiberada() throws Exception {
        relatorios(true);

        mockMvc.perform(get("/dashboard/ranking"))
                .andExpect(status().isForbidden());

        verify(dashboardService, never()).getRankingAlunos(anyInt(), anyString(), anyBoolean());
    }

    @Test
    @WithMockUser(roles = "COZI")
    void mantemConsultaDePresentesParaUsuarioAutenticado() throws Exception {
        when(dashboardService.getAlunosPresentesHoje()).thenReturn(0L);

        mockMvc.perform(get("/dashboard/presentes"))
                .andExpect(status().isOk());
    }
}
