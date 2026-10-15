package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Voluntário desligado (status diferente de "true") perde o acesso à equipe: o login falha com a
 * mesma resposta de senha errada, e um token já emitido deixa de valer na próxima requisição.
 * Conta sem voluntário (administrativa/técnica) continua funcionando como antes. O status do
 * voluntário é a única fonte: reativá-lo reabre o acesso sem mexer no usuário.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VoluntarioDesligadoSecurityTest {

    private static final String SENHA = "senha-valida-123";
    private static final String ROTA_LOGADA = "/dashboard/presentes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VoluntarioRepository voluntarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    private User usuario(String login) {
        User existente = userRepository.findByLogin(login) instanceof User u ? u : null;
        return existente != null ? existente
                : userRepository.save(new User(login, passwordEncoder.encode(SENHA), UserRole.PROF));
    }

    private void voluntario(String matricula, String status) {
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
            voluntario.setSalaUm("3");
        }
        voluntario.setStatus(status);
        voluntarioRepository.save(voluntario);
    }

    private org.springframework.test.web.servlet.MvcResult login(String login, String ip) throws Exception {
        return mockMvc.perform(post("/auth/login")
                .header("X-Real-IP", ip)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"" + login + "\",\"password\":\"" + SENHA + "\"}"))
                .andReturn();
    }

    private int acessaRotaLogada(User usuario) throws Exception {
        return mockMvc.perform(get(ROTA_LOGADA)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenService.generateToken(usuario)))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void voluntarioAtivoFazLoginEAcessaARotaLogada() throws Exception {
        User usuario = usuario("9810001");
        voluntario("9810001", "true");

        assertThat(login("9810001", "10.81.0.1").getResponse().getStatus()).isEqualTo(200);
        assertThat(acessaRotaLogada(usuario)).isEqualTo(200);
    }

    @Test
    void loginDeVoluntarioDesligadoFalhaComAMesmaMensagemDeSenhaErrada() throws Exception {
        usuario("9810002");
        voluntario("9810002", "false");

        var resposta = login("9810002", "10.81.0.2").getResponse();

        assertThat(resposta.getStatus()).isEqualTo(401);
        assertThat(resposta.getContentAsString(StandardCharsets.UTF_8)).contains("Matrícula ou senha inválida.");
    }

    @Test
    void tokenJaEmitidoDeixaDeValerQuandoOVoluntarioEhDesligado() throws Exception {
        User usuario = usuario("9810004");
        voluntario("9810004", "true");
        assertThat(acessaRotaLogada(usuario)).as("antes de desligar").isEqualTo(200);

        voluntario("9810004", "false");

        assertThat(acessaRotaLogada(usuario)).as("depois de desligar").isEqualTo(403);
    }

    @Test
    void reativarOVoluntarioReabreOAcessoSemMexerNoUsuario() throws Exception {
        User usuario = usuario("9810005");
        voluntario("9810005", "false");
        assertThat(login("9810005", "10.81.0.5").getResponse().getStatus()).isEqualTo(401);

        voluntario("9810005", "true");

        assertThat(login("9810005", "10.81.0.5").getResponse().getStatus()).isEqualTo(200);
        assertThat(acessaRotaLogada(usuario)).isEqualTo(200);
    }

    @Test
    void contaSemVoluntarioContinuaFuncionando() throws Exception {
        User usuario = usuario("9810006");

        assertThat(login("9810006", "10.81.0.6").getResponse().getStatus()).isEqualTo(200);
        assertThat(acessaRotaLogada(usuario)).isEqualTo(200);
    }
}
