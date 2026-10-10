package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Rotas de consulta e ponto que são só da área logada não podem responder sem login. Usa os beans
 * reais (H2) e, nos testes com token, o SecurityFilter de verdade: a lista de caminhos que ele
 * ignora também precisa estar de acordo com a regra de segurança.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RotasInternasSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    private String bearer(String login, UserRole role) {
        User usuario = userRepository.findByLogin(login);
        if (usuario == null) {
            usuario = userRepository.save(new User(login, "senha-que-o-teste-nao-usa", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    // ---- sem login: negado ----

    @Test
    void negaFrequenciaDeAlunosSemLogin() throws Exception {
        mockMvc.perform(get("/frequenciadiscente")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciadiscente/2026-10-10")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciadiscente/2026-10-10/2026001")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciadiscente/alertas-faltas").param("mes", "10").param("ano", "2026"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciadiscente/export").param("mes", "10").param("ano", "2026"))
                .andExpect(status().isForbidden());
    }

    @Test
    void negaConsultaDeVoluntarioPorMatriculaSemLogin() throws Exception {
        mockMvc.perform(get("/voluntario/matricula/2026001")).andExpect(status().isForbidden());
    }

    @Test
    void negaPontoDosVoluntariosSemLoginParaLeituraEEscrita() throws Exception {
        mockMvc.perform(get("/frequenciavoluntario")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciavoluntario/2026-10-10")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciavoluntario/2026-10-10/2026001")).andExpect(status().isForbidden());
        mockMvc.perform(post("/frequenciavoluntario").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/frequenciavoluntario").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void negaArquivosDeDiarioPeloCaminhoEstaticoSemLogin() throws Exception {
        mockMvc.perform(get("/app/docs/diarios/qualquer-arquivo.pdf")).andExpect(status().isForbidden());
    }

    // ---- com login: continua funcionando para qualquer cargo (o painel carrega para todos) ----

    @Test
    @WithMockUser(roles = "COZI")
    void permiteConsultasDoPainelAQualquerCargoLogado() throws Exception {
        mockMvc.perform(get("/frequenciadiscente")).andExpect(status().isOk());
        mockMvc.perform(get("/frequenciadiscente/alertas-faltas").param("mes", "10").param("ano", "2026"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/frequenciavoluntario")).andExpect(status().isOk());
        mockMvc.perform(get("/voluntario/matricula/2026001")).andExpect(status().isOk());
    }

    @Test
    void permiteConsultasComTokenRealPassandoPeloSecurityFilter() throws Exception {
        String token = bearer("9300001", UserRole.COZI);

        mockMvc.perform(get("/frequenciadiscente").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/frequenciadiscente/alertas-faltas").param("mes", "10").param("ano", "2026")
                .header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());
        mockMvc.perform(get("/frequenciavoluntario").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/voluntario/matricula/2026001").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
    }

    @Test
    void negaTokenInvalidoNasRotasInternas() throws Exception {
        mockMvc.perform(get("/frequenciadiscente").header(HttpHeaders.AUTHORIZATION, "Bearer token-invalido"))
                .andExpect(status().isForbidden());
    }

    // ---- diários pelo caminho estático: só os cargos que já acessam /diarios ----

    @Test
    void arquivosDeDiarioSoParaOsCargosDoDiario() throws Exception {
        mockMvc.perform(get("/app/docs/diarios/qualquer-arquivo.pdf")
                .header(HttpHeaders.AUTHORIZATION, bearer("9300002", UserRole.COZI)))
                .andExpect(status().isForbidden());
        // Autorizado: passa pela segurança e só então falha por o arquivo não existir (o tratamento de erros
        // devolve 404 ou 500 para recurso ausente); o que importa aqui é não ser negado.
        mockMvc.perform(get("/app/docs/diarios/qualquer-arquivo.pdf")
                .header(HttpHeaders.AUTHORIZATION, bearer("9300003", UserRole.COOR)))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotIn(401, 403));
    }

    // ---- o que é público de verdade continua público ----

    @Test
    void mantemPublicasAsRotasDoSite() throws Exception {
        mockMvc.perform(get("/voluntario/nomesfuncoes")).andExpect(status().isOk());
        mockMvc.perform(get("/aviso")).andExpect(status().isOk());
    }
}
