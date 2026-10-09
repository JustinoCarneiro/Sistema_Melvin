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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    @Test
    @WithMockUser(roles = "COZI")
    void negaRankingPsicologicoSemPermissaoDeRelatorios() throws Exception {
        when(permissaoService.hasPermission(any(Authentication.class), eq("VISUALIZAR_RELATORIOS")))
                .thenReturn(false);

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PSICO")
    void permiteRankingPsicologicoComPermissaoDeRelatorios() throws Exception {
        when(permissaoService.hasPermission(any(Authentication.class), eq("VISUALIZAR_RELATORIOS")))
                .thenReturn(true);
        when(dashboardService.getRankingAlunos(5, "psicologico")).thenReturn(List.of());

        mockMvc.perform(get("/dashboard/ranking").param("sortBy", "psicologico"))
                .andExpect(status().isOk());

        verify(dashboardService).getRankingAlunos(5, "psicologico");
    }

    @Test
    @WithMockUser(roles = "COZI")
    void mantemConsultaDePresentesParaUsuarioAutenticado() throws Exception {
        when(dashboardService.getAlunosPresentesHoje()).thenReturn(0L);

        mockMvc.perform(get("/dashboard/presentes"))
                .andExpect(status().isOk());
    }
}
