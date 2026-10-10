package br.com.melvin.sistema.security.config;

import java.util.Map;
import java.util.function.Supplier;

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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import br.com.melvin.sistema.domain.amigomelvin.service.StripeService;
import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import br.com.melvin.sistema.domain.permissao.repository.PermissaoRegraRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.shared.service.EmailService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

/**
 * Cada rota de escrita ou de exportação precisa da permissão (ou do cargo) que a tela correspondente
 * já exige. Estas rotas estavam abertas a qualquer usuário logado porque a regra existia só para o
 * caminho exato ("/voluntario"), e a rota de verdade tem a matrícula no caminho ("/voluntario/{matricula}").
 *
 * Usa beans reais (H2), token JWT real (passando pelo SecurityFilter) e as regras de permissão padrão de
 * produção, que o perfil de teste não semeia.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ControleDeAcessoPorCargoTest {

    private static final String UUID_QUALQUER = "00000000-0000-0000-0000-000000000001";

    private static final Map<String, String> REGRAS_PADRAO = Map.ofEntries(
            Map.entry("GERENCIAR_FREQUENCIA", "ADM,TECH,DIRE,COOR,PROF"),
            Map.entry("CADASTRAR_ALUNO", "ADM,TECH,COOR,DIRE,ASSIST"),
            Map.entry("GERENCIAR_VOLUNTARIOS", "ADM,TECH"),
            Map.entry("GERENCIAR_EMBAIXADORES", "ADM,TECH,DIRE"),
            Map.entry("GERENCIAR_AMIGOS", "ADM,TECH,DIRE"),
            Map.entry("VISUALIZAR_ALUNOS", "PROF,ADM,TECH,DIRE,COOR,ASSIST,PSICO"),
            Map.entry("VISUALIZAR_RELATORIOS", "PROF,ADM,TECH,DIRE,COOR,ASSIST,PSICO"));

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PermissaoRegraRepository permissaoRegraRepository;

    @Autowired
    private TokenService tokenService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private StripeService stripeService;

    @BeforeEach
    void semearRegrasPadrao() {
        REGRAS_PADRAO.forEach((nome, cargos) -> {
            if (permissaoRegraRepository.findByNomeRegra(nome).isEmpty()) {
                PermissaoRegra regra = new PermissaoRegra();
                regra.setNomeRegra(nome);
                regra.setRolesPermitidas(cargos);
                permissaoRegraRepository.save(regra);
            }
        });
    }

    private String loginDe(UserRole role) {
        return "95" + String.format("%02d", role.ordinal()) + "001";
    }

    private String bearer(UserRole role) {
        User usuario = userRepository.findByLogin(loginDe(role));
        if (usuario == null) {
            usuario = userRepository.save(new User(loginDe(role), "senha-que-o-teste-nao-usa", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    private int status(Supplier<MockHttpServletRequestBuilder> rota, UserRole role) throws Exception {
        MockHttpServletRequestBuilder requisicao = rota.get();
        if (role != null) {
            requisicao.header(HttpHeaders.AUTHORIZATION, bearer(role));
        }
        return mockMvc.perform(requisicao).andReturn().getResponse().getStatus();
    }

    private void negado(Supplier<MockHttpServletRequestBuilder> rota, UserRole... cargos) throws Exception {
        assertThat(status(rota, null)).as("sem login").isIn(401, 403);
        for (UserRole role : cargos) {
            assertThat(status(rota, role)).as("cargo " + role).isIn(401, 403);
        }
    }

    private void liberado(Supplier<MockHttpServletRequestBuilder> rota, UserRole... cargos) throws Exception {
        for (UserRole role : cargos) {
            assertThat(status(rota, role)).as("cargo " + role).isNotIn(401, 403);
        }
    }

    private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    // ---- exclusões: a regra existia só para o caminho sem a matrícula ----

    @Test
    void apagarVoluntarioExigeGerenciarVoluntarios() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> delete("/voluntario/2026001");
        negado(rota, UserRole.COZI, UserRole.PROF, UserRole.DIRE);
        liberado(rota, UserRole.ADM, UserRole.TECH);
    }

    @Test
    void apagarAlunoExigeCadastrarAluno() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> delete("/discente/2026001");
        negado(rota, UserRole.COZI, UserRole.PROF, UserRole.PSICO);
        liberado(rota, UserRole.ADM, UserRole.COOR, UserRole.DIRE, UserRole.ASSIST);
    }

    @Test
    void apagarFrequenciaDeAlunoExigeGerenciarFrequencia() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> delete("/frequenciadiscente/2026001/2026-10-10");
        negado(rota, UserRole.COZI, UserRole.AUX);
        liberado(rota, UserRole.PROF, UserRole.COOR);
    }

    @Test
    void apagarFrequenciaDeVoluntarioExigeGerenciarVoluntarios() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> delete("/frequenciavoluntario/2026001/2026-10-10");
        negado(rota, UserRole.COZI, UserRole.COOR, UserRole.DIRE);
        liberado(rota, UserRole.ADM);
    }

    // ---- doações ----

    @Test
    void cancelarAssinaturaDeDoadorExigeGerenciarAmigos() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> post("/amigomelvin/" + UUID_QUALQUER + "/cancelar");
        negado(rota, UserRole.COZI, UserRole.COOR, UserRole.PROF);
        liberado(rota, UserRole.DIRE, UserRole.ADM);
    }

    @Test
    void cadastroManualLegadoDeAmigoNaoEPublico() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> json(post("/amigomelvin"), "{}");
        negado(rota, UserRole.COZI, UserRole.COOR);
        liberado(rota, UserRole.DIRE, UserRole.ADM);
    }

    // ---- exportações com dados pessoais ----

    @Test
    void exportarAlunosExigeVisualizarAlunos() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> get("/discente/export");
        negado(rota, UserRole.COZI, UserRole.AUX);
        liberado(rota, UserRole.PROF, UserRole.ADM);
    }

    @Test
    void exportarFrequenciaExigeVisualizarRelatorios() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> get("/frequenciadiscente/export").param("mes", "10").param("ano", "2026");
        negado(rota, UserRole.COZI, UserRole.AUX);
        liberado(rota, UserRole.PROF, UserRole.ADM);
    }

    // ---- calendário de exceções: tela exclusiva de ADM e TECH ----

    @Test
    void calendarioDeExcecoesSoParaAdmETech() throws Exception {
        Supplier<MockHttpServletRequestBuilder> criar = () -> json(post("/dias-nao-letivos"), "{}");
        Supplier<MockHttpServletRequestBuilder> apagar = () -> delete("/dias-nao-letivos/" + UUID_QUALQUER);
        negado(criar, UserRole.COZI, UserRole.COOR, UserRole.DIRE);
        negado(apagar, UserRole.COZI, UserRole.COOR, UserRole.DIRE);
        liberado(criar, UserRole.ADM, UserRole.TECH);
        liberado(apagar, UserRole.ADM, UserRole.TECH);
    }

    @Test
    void calendarioContinuaSendoLidoPorQualquerCargoLogado() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> get("/dias-nao-letivos");
        negado(rota);
        liberado(rota, UserRole.COZI, UserRole.PROF);
    }

    // ---- imagens: só a captura por id é do site ----

    @Test
    void listaCompletaDeImagensExigeLogin() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> get("/imagens/lista");
        negado(rota);
        // Com token real: o SecurityFilter precisa ler o token neste caminho.
        liberado(rota, UserRole.COZI, UserRole.ADM);
    }

    @Test
    void capturaDeImagemPorIdContinuaPublicaParaOSite() throws Exception {
        Supplier<MockHttpServletRequestBuilder> rota = () -> get("/imagens/captura/" + UUID_QUALQUER + "/embaixador");
        assertThat(status(rota, null)).isNotIn(401, 403);
        liberado(rota, UserRole.COZI);
    }

    // ---- cadastro de embaixador: só o caminho exato é público ----

    @Test
    void soOCadastroDeEmbaixadorEPublicoNaoSeusSubcaminhos() throws Exception {
        assertThat(status(() -> json(post("/embaixador"), "{}"), null)).isNotIn(401, 403);
        assertThat(status(() -> json(post("/embaixador/qualquer"), "{}"), null)).isIn(401, 403);
        assertThat(status(() -> json(post("/embaixador/qualquer/coisa"), "{}"), null)).isIn(401, 403);
    }

    // ---- ponto dos voluntários: o próprio, ou quem gerencia a equipe ----

    private String ponto(String matricula) {
        return "{\"matricula\":\"" + matricula + "\",\"nome\":\"Fulano\",\"data\":\"2026-10-10\",\"presenca_manha\":true}";
    }

    @Test
    void voluntarioRegistraPontoSoDeSiMesmo() throws Exception {
        String outraMatricula = "9599999";

        // Em nome de outra pessoa: negado a quem não gerencia a equipe.
        Supplier<MockHttpServletRequestBuilder> emNomeDeOutro = () -> json(post("/frequenciavoluntario"), ponto(outraMatricula));
        assertThat(status(emNomeDeOutro, UserRole.COZI)).as("COZI em nome de outro").isEqualTo(403);
        assertThat(status(emNomeDeOutro, UserRole.PROF)).as("PROF em nome de outro").isEqualTo(403);

        // O próprio ponto passa pela segurança e só falha por a matrícula não existir no banco de teste.
        Supplier<MockHttpServletRequestBuilder> proprio = () -> json(post("/frequenciavoluntario"), ponto(loginDe(UserRole.COZI)));
        assertThat(status(proprio, UserRole.COZI)).as("COZI do próprio ponto").isEqualTo(404);
    }

    @Test
    void quemGerenciaAEquipePodeRegistrarPontoDeOutros() throws Exception {
        Supplier<MockHttpServletRequestBuilder> emNomeDeOutro = () -> json(post("/frequenciavoluntario"), ponto("9599999"));
        for (UserRole role : new UserRole[] {UserRole.ADM, UserRole.TECH, UserRole.DIRE, UserRole.COOR}) {
            assertThat(status(emNomeDeOutro, role)).as("cargo " + role).isEqualTo(404);
        }
    }

    @Test
    void voluntarioAlteraPontoSoDeSiMesmo() throws Exception {
        String outraMatricula = "9599999";

        Supplier<MockHttpServletRequestBuilder> emNomeDeOutro = () -> json(put("/frequenciavoluntario"), ponto(outraMatricula));
        assertThat(status(emNomeDeOutro, UserRole.COZI)).as("COZI em nome de outro").isEqualTo(403);

        Supplier<MockHttpServletRequestBuilder> proprio = () -> json(put("/frequenciavoluntario"), ponto(loginDe(UserRole.COZI)));
        assertThat(status(proprio, UserRole.COZI)).as("COZI do próprio ponto").isEqualTo(404);

        assertThat(status(emNomeDeOutro, UserRole.COOR)).as("COOR em nome de outro").isEqualTo(404);
    }
}
