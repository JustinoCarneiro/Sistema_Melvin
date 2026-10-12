package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import br.com.melvin.sistema.domain.permissao.repository.PermissaoRegraRepository;
import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

    @Autowired
    private VoluntarioRepository voluntarioRepository;

    @Autowired
    private PermissaoRegraRepository permissaoRegraRepository;

    @BeforeEach
    void semeiaPermissoesPadraoDeProducao() {
        // No perfil de teste o PermissaoService não semeia as regras padrão; aqui valem as de produção.
        semeia("GERENCIAR_VOLUNTARIOS", "ADM,TECH");
        semeia("VISUALIZAR_ALUNOS", "PROF,ADM,TECH,DIRE,COOR,ASSIST,PSICO");
        semeia("GERENCIAR_FREQUENCIA", "ADM,TECH,DIRE,COOR,PROF");
    }

    private void semeia(String nomeRegra, String roles) {
        if (permissaoRegraRepository.findByNomeRegra(nomeRegra).isEmpty()) {
            PermissaoRegra regra = new PermissaoRegra();
            regra.setNomeRegra(nomeRegra);
            regra.setRolesPermitidas(roles);
            permissaoRegraRepository.save(regra);
        }
    }

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

    // ---- frequência de alunos: quem gerencia a frequência (docentes, coordenação e diretoria) ----

    private static final UserRole[] CARGOS_COM_FREQUENCIA = { UserRole.PROF, UserRole.COOR, UserRole.DIRE, UserRole.ADM, UserRole.TECH };
    private static final UserRole[] CARGOS_SEM_FREQUENCIA = { UserRole.COZI, UserRole.MARK, UserRole.ZELA, UserRole.PSICO, UserRole.ASSIST };

    private String tokenDe(UserRole cargo) {
        return bearer("93100" + cargo.ordinal(), cargo);
    }

    @Test
    void docentesCoordenacaoEDiretoriaLemAFrequenciaDeAlunosComTokenReal() throws Exception {
        for (UserRole cargo : CARGOS_COM_FREQUENCIA) {
            String token = tokenDe(cargo);
            mockMvc.perform(get("/frequenciadiscente").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciadiscente/2026-10-10").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciadiscente/2026-10-10/2026001").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciadiscente/alertas-faltas").param("mes", "10").param("ano", "2026")
                    .header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());
        }
    }

    @Test
    void outrosCargosNaoLemAFrequenciaDeAlunos() throws Exception {
        for (UserRole cargo : CARGOS_SEM_FREQUENCIA) {
            String token = tokenDe(cargo);
            mockMvc.perform(get("/frequenciadiscente").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/frequenciadiscente/2026-10-10").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/frequenciadiscente/2026-10-10/2026001").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/frequenciadiscente/alertas-faltas").param("mes", "10").param("ano", "2026")
                    .header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isForbidden());
        }
    }

    // ---- ponto dos voluntários: cada um lê o próprio; a equipe (ADM, TECH, DIRE, COOR) lê o de todos ----

    @Test
    void voluntarioLeOProprioPontoMasNaoOLivroDeTodos() throws Exception {
        // Configurações (aberta a todos os cargos) consulta o ponto do dia do próprio usuário.
        for (UserRole cargo : new UserRole[] { UserRole.COZI, UserRole.PROF }) {
            String login = "93200" + cargo.ordinal();
            String token = bearer(login, cargo);
            mockMvc.perform(get("/frequenciavoluntario/2026-10-10/" + login).header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciavoluntario/2026-10-10/9999999").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/frequenciavoluntario/2026-10-10").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/frequenciavoluntario").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void equipeLeOPontoDeTodosOsVoluntarios() throws Exception {
        for (UserRole cargo : new UserRole[] { UserRole.ADM, UserRole.TECH, UserRole.DIRE, UserRole.COOR }) {
            String token = tokenDe(cargo);
            mockMvc.perform(get("/frequenciavoluntario").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciavoluntario/2026-10-10").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
            mockMvc.perform(get("/frequenciavoluntario/2026-10-10/9999999").header(HttpHeaders.AUTHORIZATION, token))
                    .andExpect(status().isOk());
        }
    }

    @Test
    void visitanteSemLoginNaoPassaComoSeFosseODonoDaMatricula() throws Exception {
        // O visitante anônimo se chama "anonymousUser": uma matrícula com esse texto não pode ser tomada como "a própria".
        mockMvc.perform(get("/voluntario/matricula/anonymousUser")).andExpect(status().isForbidden());
        mockMvc.perform(get("/frequenciavoluntario/2026-10-10/anonymousUser")).andExpect(status().isForbidden());
    }

    @Test
    void voluntarioConsultaAPropriaFichaComTokenRealPassandoPeloSecurityFilter() throws Exception {
        // A própria ficha: o login do token é a matrícula consultada.
        mockMvc.perform(get("/voluntario/matricula/9300001").header(HttpHeaders.AUTHORIZATION, bearer("9300001", UserRole.COZI)))
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

    // ---- consulta de voluntário por matrícula: o próprio usuário ou quem gerencia voluntários ----

    private Voluntario voluntarioDeTeste(String matricula) {
        Voluntario voluntario = voluntarioRepository.findByMatricula(matricula);
        if (voluntario == null) {
            voluntario = new Voluntario();
            voluntario.setMatricula(matricula);
            voluntario.setNome("Voluntário de Teste " + matricula);
            voluntario.setContato("85900000000");
            voluntario.setFuncao("professor");
            voluntario.setData(LocalDate.of(1990, 1, 1));
            voluntario.setEndereco("Rua de Teste, 1");
            voluntario.setBairro("Bairro de Teste");
            voluntario.setCidade("Cidade de Teste");
            voluntario.setStatus("true");
            voluntario.setSalaUm("3");
            voluntario = voluntarioRepository.save(voluntario);
        }
        return voluntario;
    }

    @Test
    void voluntarioConsultaOsProprioDadosPorMatricula() throws Exception {
        voluntarioDeTeste("9300011");

        mockMvc.perform(get("/voluntario/matricula/9300011")
                .header(HttpHeaders.AUTHORIZATION, bearer("9300011", UserRole.PROF)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricula").value("9300011"))
                .andExpect(jsonPath("$.salaUm").value("3"));
    }

    @Test
    void voluntarioNaoConsultaDadosDeOutraPessoaPorMatricula() throws Exception {
        voluntarioDeTeste("9300012");

        for (UserRole cargo : new UserRole[] { UserRole.PROF, UserRole.AUX, UserRole.COZI, UserRole.COOR, UserRole.DIRE }) {
            mockMvc.perform(get("/voluntario/matricula/9300012")
                    .header(HttpHeaders.AUTHORIZATION, bearer("93000" + cargo.ordinal() + "0", cargo)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void quemGerenciaVoluntariosConsultaQualquerMatricula() throws Exception {
        voluntarioDeTeste("9300013");

        mockMvc.perform(get("/voluntario/matricula/9300013")
                .header(HttpHeaders.AUTHORIZATION, bearer("9300014", UserRole.ADM)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricula").value("9300013"));
        mockMvc.perform(get("/voluntario/matricula/9300013")
                .header(HttpHeaders.AUTHORIZATION, bearer("9300015", UserRole.TECH)))
                .andExpect(status().isOk());
    }

    // ---- alunos de uma sala: mesma permissão da lista de alunos ----

    @Test
    void alunosPorSalaExigemAMesmaPermissaoDaListaDeAlunos() throws Exception {
        mockMvc.perform(get("/discente/sala/1")).andExpect(status().isForbidden());
        mockMvc.perform(get("/discente/sala/1").header(HttpHeaders.AUTHORIZATION, bearer("9300021", UserRole.COZI)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/discente/sala/1").header(HttpHeaders.AUTHORIZATION, bearer("9300022", UserRole.PROF)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/discente/sala/1").header(HttpHeaders.AUTHORIZATION, bearer("9300023", UserRole.ADM)))
                .andExpect(status().isOk());
    }

    // ---- o que é público de verdade continua público ----

    @Test
    void mantemPublicasAsRotasDoSite() throws Exception {
        mockMvc.perform(get("/voluntario/nomesfuncoes")).andExpect(status().isOk());
        mockMvc.perform(get("/embaixador/publicos")).andExpect(status().isOk());
    }
}
