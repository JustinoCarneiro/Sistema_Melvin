package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import br.com.melvin.sistema.domain.embaixador.repository.EmbaixadorRepository;
import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import br.com.melvin.sistema.domain.permissao.repository.PermissaoRegraRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O site público mostra só embaixadores aprovados, com nome, descrição e foto. Contato, e-mail e
 * Instagram de quem se cadastrou ficam na lista completa, que é da administração. Usa beans reais
 * (H2) e token JWT real, passando pelo SecurityFilter.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmbaixadorSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmbaixadorRepository embaixadorRepository;

    @Autowired
    private PermissaoRegraRepository permissaoRegraRepository;

    @Autowired
    private TokenService tokenService;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void cadastros() {
        // No perfil de teste o PermissaoService não semeia as regras padrão; aqui vale a de produção.
        if (permissaoRegraRepository.findByNomeRegra("GERENCIAR_EMBAIXADORES").isEmpty()) {
            PermissaoRegra regra = new PermissaoRegra();
            regra.setNomeRegra("GERENCIAR_EMBAIXADORES");
            regra.setRolesPermitidas("ADM,TECH,DIRE");
            permissaoRegraRepository.save(regra);
        }
        if (embaixadorRepository.findByNome("Maria Publica") == null) {
            embaixadorRepository.save(embaixador("Maria Publica", true, "Apoia o projeto"));
        }
        if (embaixadorRepository.findByNome("Joao Pendente") == null) {
            embaixadorRepository.save(embaixador("Joao Pendente", false, "Quer ser embaixador"));
        }
    }

    private Embaixador embaixador(String nome, boolean aprovado, String descricao) {
        Embaixador e = new Embaixador();
        e.setNome(nome);
        e.setContato("85988887777");
        e.setEmail(nome.split(" ")[0].toLowerCase() + ".segredo@teste.invalid");
        e.setInstagram("@" + nome.split(" ")[0].toLowerCase() + "_segredo");
        e.setStatus(aprovado);
        e.setContatado(false);
        e.setDescricao(descricao);
        return e;
    }

    private String bearer(String login, UserRole role) {
        User usuario = userRepository.findByLogin(login);
        if (usuario == null) {
            usuario = userRepository.save(new User(login, "senha-que-o-teste-nao-usa", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    // ---- lista pública do site ----

    @Test
    void listaPublicaSemLoginMostraSoAprovadosEApenasNomeEDescricao() throws Exception {
        mockMvc.perform(get("/embaixador/publicos"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Maria Publica")))
                .andExpect(content().string(containsString("Apoia o projeto")))
                .andExpect(content().string(not(containsString("Joao Pendente"))))
                .andExpect(content().string(not(containsString("segredo"))))
                .andExpect(content().string(not(containsString("85988887777"))))
                .andExpect(content().string(not(containsString("\"email\""))))
                .andExpect(content().string(not(containsString("\"contato\""))))
                .andExpect(content().string(not(containsString("\"instagram\""))))
                .andExpect(content().string(not(containsString("\"status\""))))
                .andExpect(content().string(not(containsString("\"contatado\""))));
    }

    // ---- lista completa: administração ----

    @Test
    void listaCompletaExigeLogin() throws Exception {
        mockMvc.perform(get("/embaixador")).andExpect(status().isForbidden());
    }

    @Test
    void listaCompletaNegaTokenInvalido() throws Exception {
        mockMvc.perform(get("/embaixador").header(HttpHeaders.AUTHORIZATION, "Bearer token-invalido"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listaCompletaNegadaACargoSemPermissaoDeGerenciarEmbaixadores() throws Exception {
        mockMvc.perform(get("/embaixador").header(HttpHeaders.AUTHORIZATION, bearer("9400001", UserRole.COZI)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/embaixador").header(HttpHeaders.AUTHORIZATION, bearer("9400002", UserRole.PROF)))
                .andExpect(status().isForbidden());
    }

    @Test
    void listaCompletaLiberadaAQuemGerenciaEmbaixadores() throws Exception {
        for (UserRole role : new UserRole[] {UserRole.ADM, UserRole.TECH, UserRole.DIRE}) {
            mockMvc.perform(get("/embaixador")
                    .header(HttpHeaders.AUTHORIZATION, bearer("94000" + (10 + role.ordinal()), role)))
                    .andExpect(result -> assertThat(result.getResponse().getStatus()).as("cargo " + role).isEqualTo(200))
                    .andExpect(content().string(containsString("Joao Pendente")))
                    .andExpect(content().string(containsString("joao.segredo@teste.invalid")));
        }
    }

    // ---- o que continua como era ----

    @Test
    void cadastroPeloSiteContinuaPublicoEEntraComoNaoAprovado() throws Exception {
        mockMvc.perform(post("/embaixador").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Ana Candidata\",\"contato\":\"85977776666\",\"email\":\"ana.candidata@teste.invalid\",\"instagram\":\"@ana\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/embaixador/publicos"))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("Ana Candidata"))));
    }

    @Test
    void edicaoContinuaExigindoPermissao() throws Exception {
        mockMvc.perform(put("/embaixador").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Maria Publica\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/embaixador").contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Maria Publica\"}")
                .header(HttpHeaders.AUTHORIZATION, bearer("9400001", UserRole.COZI)))
                .andExpect(status().isForbidden());
    }
}
