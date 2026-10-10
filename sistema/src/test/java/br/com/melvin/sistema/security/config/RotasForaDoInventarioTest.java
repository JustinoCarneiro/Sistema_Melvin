package br.com.melvin.sistema.security.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.ClassUtils;

import br.com.melvin.sistema.domain.amigomelvin.service.StripeService;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.shared.service.EmailService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Só existe a API que os controllers declaram (e que a MatrizDeAcessoTest classifica). O Spring Data REST, que
 * vinha no projeto desde o início sem uso, publicava cada repositório JPA como API própria — /users com os hashes
 * de senha, alunos, voluntários, doadores, permissões — com leitura e escrita para qualquer cargo logado, e essas
 * rotas nem aparecem no mapeamento dos controllers. Além de tirar a dependência, o padrão da segurança passa a ser
 * negar: caminho que não está na configuração é recusado para todos, até para o ADM.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RotasForaDoInventarioTest {

    private static final String[] ROTAS_DE_REPOSITORIO = {"/", "/profile", "/users", "/discentes", "/voluntarios",
            "/amigoMelvins", "/embaixadors", "/imagems", "/permissaoRegras", "/frequenciaDiscentes", "/ocorrenciaTecnicas"};

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
            usuario = userRepository.save(new User(login, "hash-que-nao-pode-vazar", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    @Test
    void springDataRestNaoEstaNoProjeto() {
        assertThat(ClassUtils.isPresent("org.springframework.data.rest.webmvc.RepositoryRestHandlerMapping", null)).isFalse();
    }

    @Test
    void repositoriosNaoViramApiParaNenhumCargo() throws Exception {
        for (UserRole role : new UserRole[] {UserRole.COZI, UserRole.ADM, UserRole.TECH}) {
            String token = bearer("99100" + String.format("%02d", role.ordinal()), role);
            for (String caminho : ROTAS_DE_REPOSITORIO) {
                var resposta = mockMvc.perform(get(caminho).header(HttpHeaders.AUTHORIZATION, token)).andReturn().getResponse();
                assertThat(resposta.getStatus()).as(role + " GET " + caminho).isIn(403, 404);
                assertThat(resposta.getContentAsString()).as(role + " GET " + caminho).doesNotContain("hash-que-nao-pode-vazar");
            }
        }
    }

    @Test
    void naoDaParaCriarUsuarioPorForaDoCadastro() throws Exception {
        String token = bearer("9910099", UserRole.COZI);

        int status = mockMvc.perform(post("/users").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"invasor-9910099\",\"password\":\"x\",\"role\":\"ADM\"}"))
                .andReturn().getResponse().getStatus();

        assertThat(status).isIn(403, 404);
        assertThat(userRepository.findByLogin("invasor-9910099")).isNull();
    }

    @Test
    void caminhoForaDaConfiguracaoEhNegadoAteParaOAdm() throws Exception {
        for (UserRole role : new UserRole[] {UserRole.COZI, UserRole.ADM, UserRole.TECH}) {
            String token = bearer("99200" + String.format("%02d", role.ordinal()), role);
            assertThat(mockMvc.perform(get("/rota-que-ninguem-configurou").header(HttpHeaders.AUTHORIZATION, token))
                    .andReturn().getResponse().getStatus()).as(role + " GET").isEqualTo(403);
            assertThat(mockMvc.perform(delete("/rota-que-ninguem-configurou/1").header(HttpHeaders.AUTHORIZATION, token))
                    .andReturn().getResponse().getStatus()).as(role + " DELETE").isEqualTo(403);
        }
    }
}
