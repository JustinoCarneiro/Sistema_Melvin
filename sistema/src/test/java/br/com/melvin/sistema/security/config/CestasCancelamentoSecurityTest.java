package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.service.CestasService;
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

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CestasCancelamentoSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermissaoService permissaoService;

    @MockBean
    private CestasService cestasService;

    @Test
    @WithMockUser(roles = "COOR")
    void permiteCancelamentoAQuemTemPermissaoDeGerenciarCestas() throws Exception {
        UUID id = UUID.randomUUID();
        when(permissaoService.hasPermission(any(Authentication.class), eq("GERENCIAR_CESTAS")))
                .thenReturn(true);
        doReturn(org.springframework.http.ResponseEntity.ok(new Cestas())).when(cestasService).cancelar(id);

        mockMvc.perform(put("/cestas/solicitacao/{id}/cancelar", id))
                .andExpect(status().isOk());

        verify(cestasService).cancelar(id);
    }

    @Test
    @WithMockUser(roles = "COZI")
    void negaCancelamentoSemPermissaoDeGerenciarCestas() throws Exception {
        UUID id = UUID.randomUUID();
        when(permissaoService.hasPermission(any(Authentication.class), eq("GERENCIAR_CESTAS")))
                .thenReturn(false);

        mockMvc.perform(put("/cestas/solicitacao/{id}/cancelar", id))
                .andExpect(status().isForbidden());

        verifyNoInteractions(cestasService);
    }

    @Test
    void negaCancelamentoSemAutenticacao() throws Exception {
        mockMvc.perform(put("/cestas/solicitacao/{id}/cancelar", UUID.randomUUID()))
                .andExpect(status().isForbidden());

        verifyNoInteractions(cestasService);
    }

    @Test
    @WithMockUser(roles = "COZI")
    void negaExclusaoDeCestaSemPermissaoDeGerenciarCestas() throws Exception {
        UUID id = UUID.randomUUID();
        when(permissaoService.hasPermission(any(Authentication.class), eq("GERENCIAR_CESTAS")))
                .thenReturn(false);

        mockMvc.perform(delete("/cestas/{id}", id))
                .andExpect(status().isForbidden());

        verifyNoInteractions(cestasService);
    }
}
