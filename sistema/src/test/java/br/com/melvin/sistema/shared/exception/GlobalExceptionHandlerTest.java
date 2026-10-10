package br.com.melvin.sistema.shared.exception;

import br.com.melvin.sistema.support.TestIps;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import br.com.melvin.sistema.domain.amigomelvin.service.StripeService;
import br.com.melvin.sistema.security.config.TokenService;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.shared.service.EmailService;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Erro de quem chamou (id mal formado, JSON quebrado, método errado) é 4xx; erro nosso é 500 sem expor a
 * mensagem da exceção (nome de classe, SQL, caminho) a quem está do outro lado.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private StripeService stripeService;

    private String bearer(String login, UserRole role) {
        User usuario = userRepository.findByLogin(login);
        if (usuario == null) {
            usuario = userRepository.save(new User(login, "senha-que-o-teste-nao-usa", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    @Test
    void erroInesperadoDevolve500SemExporAMensagemDaExcecao() throws Exception {
        when(stripeService.createSinglePayment(any(), any()))
                .thenThrow(new IllegalStateException("tabela amigomelvin_secreta coluna cpf_hash violada em /app/interno"));

        mockMvc.perform(post("/amigomelvin/one-time").header("X-Real-IP", TestIps.novo()).contentType(MediaType.APPLICATION_JSON).content("{\"valor\":50}"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value(containsString("erro interno")))
                .andExpect(content().string(not(containsString("amigomelvin_secreta"))))
                .andExpect(content().string(not(containsString("cpf_hash"))))
                .andExpect(content().string(not(containsString("/app/interno"))));
    }

    @Test
    void idMalFormadoNoCaminhoEErroDeRequisicao() throws Exception {
        mockMvc.perform(get("/imagens/captura/isto-nao-e-uuid/embaixador"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(content().string(not(containsString("UUID"))))
                .andExpect(content().string(not(containsString("Failed to convert"))));
    }

    @Test
    void jsonQuebradoEErroDeRequisicao() throws Exception {
        mockMvc.perform(post("/embaixador").header("X-Real-IP", TestIps.novo()).contentType(MediaType.APPLICATION_JSON).content("{ isto nao e json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(content().string(not(containsString("Unexpected character"))))
                .andExpect(content().string(not(containsString("JsonParseException"))));
    }

    @Test
    void tipoDeConteudoNaoSuportadoE415() throws Exception {
        mockMvc.perform(post("/embaixador").header("X-Real-IP", TestIps.novo()).contentType(MediaType.TEXT_PLAIN).content("texto"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.status").value(415));
    }

    @Test
    void metodoNaoSuportadoE405() throws Exception {
        mockMvc.perform(post("/dashboard/avisos").contentType(MediaType.APPLICATION_JSON).content("{}")
                .header(HttpHeaders.AUTHORIZATION, bearer("9600001", UserRole.COZI)))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }

    @Test
    void arquivoEstaticoInexistenteE404() throws Exception {
        mockMvc.perform(get("/app/docs/diarios/nao-existe.pdf")
                .header(HttpHeaders.AUTHORIZATION, bearer("9600002", UserRole.COOR)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
