package br.com.melvin.sistema.security.controller;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

/**
 * O login é a única porta pública para as contas do sistema. Sem limite, qualquer um tenta senha sem parar
 * (e cada tentativa custa 64 MB de heap no Argon2). Usa beans reais (H2) e Argon2 de verdade; cada teste usa
 * matrículas e IPs próprios, porque o estado do limite vive no contexto compartilhado.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoginProtecaoTest {

    private static final String SENHA = "senha-valida-123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private void criarUsuario(String login) {
        if (userRepository.findByLogin(login) == null) {
            userRepository.save(new User(login, passwordEncoder.encode(SENHA), UserRole.COZI));
        }
    }

    private int login(String login, String senha, String ip) throws Exception {
        return mockMvc.perform(post("/auth/login")
                .header("X-Real-IP", ip)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"" + login + "\",\"password\":\"" + senha + "\"}"))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void loginComSenhaCertaFunciona() throws Exception {
        criarUsuario("9700001");

        assertThat(login("9700001", SENHA, "10.70.0.1")).isEqualTo(200);
    }

    @Test
    void bloqueiaAMatriculaAposDezFalhasMesmoComASenhaCertaDepois() throws Exception {
        criarUsuario("9700002");
        for (int i = 0; i < 10; i++) {
            assertThat(login("9700002", "errada-" + i, "10.70.0.2")).as("falha " + i).isEqualTo(401);
        }

        assertThat(login("9700002", SENHA, "10.70.0.2")).as("senha certa depois do bloqueio").isEqualTo(429);
        assertThat(login("9700002", SENHA, "10.70.0.3")).as("de outro IP, a matrícula segue bloqueada").isEqualTo(429);
    }

    @Test
    void respostaDeBloqueioTemMensagemEmPortugues() throws Exception {
        criarUsuario("9700003");
        for (int i = 0; i < 10; i++) {
            login("9700003", "errada", "10.70.0.4");
        }

        mockMvc.perform(post("/auth/login")
                .header("X-Real-IP", "10.70.0.4")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"9700003\",\"password\":\"" + SENHA + "\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(containsString("Muitas tentativas")));
    }

    @Test
    void loginBemSucedidoZeraAContagemDaMatricula() throws Exception {
        criarUsuario("9700004");
        for (int i = 0; i < 9; i++) {
            assertThat(login("9700004", "errada", "10.70.0.5")).isEqualTo(401);
        }
        assertThat(login("9700004", SENHA, "10.70.0.5")).isEqualTo(200);

        for (int i = 0; i < 9; i++) {
            assertThat(login("9700004", "errada", "10.70.0.5")).as("recomeçou do zero, falha " + i).isEqualTo(401);
        }
    }

    @Test
    void bloqueiaOIpAposVinteFalhasEmMatriculasDiferentes() throws Exception {
        for (int i = 0; i < 20; i++) {
            // Cada tentativa tenta uma matrícula nova e manda um X-Forwarded-For diferente: a chave é o X-Real-IP.
            mockMvc.perform(post("/auth/login")
                    .header("X-Real-IP", "10.70.0.6")
                    .header("X-Forwarded-For", "1.2.3." + i + ", 10.70.0.6")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"login\":\"inexistente-" + i + "\",\"password\":\"qualquer-coisa\"}"))
                    .andReturn();
        }

        assertThat(login("inexistente-novo", "qualquer-coisa", "10.70.0.6")).isEqualTo(429);
        assertThat(login("inexistente-novo", "qualquer-coisa", "10.70.0.7")).as("outro IP não é afetado").isEqualTo(401);
    }

    @Test
    void corpoInvalidoNaoConsomeVerificacaoNemContaComoFalha() throws Exception {
        for (int i = 0; i < 12; i++) {
            assertThat(login("", "qualquer", "10.70.0.8")).as("matrícula vazia").isEqualTo(400);
        }
        assertThat(login("x".repeat(65), "qualquer", "10.70.0.8")).as("matrícula longa demais").isEqualTo(400);
        assertThat(login("9700009", "s".repeat(129), "10.70.0.8")).as("senha longa demais").isEqualTo(400);

        criarUsuario("9700009");
        assertThat(login("9700009", SENHA, "10.70.0.8")).as("o IP não foi penalizado").isEqualTo(200);
    }

    @Test
    void falhaDeLoginNaoVazaSeAMatriculaExiste() throws Exception {
        criarUsuario("9700010");

        String existente = mockMvc.perform(post("/auth/login").header("X-Real-IP", "10.70.0.9").contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"9700010\",\"password\":\"errada\"}"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        String inexistente = mockMvc.perform(post("/auth/login").header("X-Real-IP", "10.70.0.9").contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"nao-existe-9700010\",\"password\":\"errada\"}"))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        assertThat(existente).contains("Matrícula ou senha inválida.");
        assertThat(inexistente).contains("Matrícula ou senha inválida.");
    }
}
