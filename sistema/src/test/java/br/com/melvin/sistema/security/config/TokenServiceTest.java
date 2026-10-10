package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.config.SecurityProperties;
import br.com.melvin.sistema.security.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TokenServiceTest {

    @Mock
    private SecurityProperties securityProperties;

    @Mock
    private User user;

    private static final String SEGREDO = "segredo-de-teste-com-pelo-menos-32-caracteres";

    private TokenService tokenService;

    @BeforeEach
    public void setup() {
        when(securityProperties.getSecret()).thenReturn(SEGREDO);
        tokenService = new TokenService(securityProperties);
    }

    @Test
    public void testGenerateAndValidateToken() {
        String login = "testUser";
        when(user.getLogin()).thenReturn(login);

        String token = tokenService.generateToken(user);

        assertNotNull(token);
        assertNotEquals("", token);

        String validatedLogin = tokenService.validateToken(token);
        assertEquals(login, validatedLogin);
    }

    @Test
    public void testSegredoCurtoImpedeOSistemaDeSubir() {
        SecurityProperties fraco = new SecurityProperties();
        fraco.setSecret("curto");
        assertThrows(IllegalStateException.class, () -> new TokenService(fraco));

        SecurityProperties ausente = new SecurityProperties();
        assertThrows(IllegalStateException.class, () -> new TokenService(ausente));
    }

    @Test
    public void testTokenAssinadoComOutroSegredoEhRejeitado() {
        String forjado = com.auth0.jwt.JWT.create()
                .withIssuer("sistemamelvin")
                .withSubject("admin")
                .withExpiresAt(java.time.Instant.now().plusSeconds(3600))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("outro-segredo-qualquer-do-atacante-123456"));

        assertEquals("", tokenService.validateToken(forjado));
    }

    @Test
    public void testTokenSemAssinaturaAlgNoneEhRejeitado() {
        java.util.Base64.Encoder b64 = java.util.Base64.getUrlEncoder().withoutPadding();
        String cabecalho = b64.encodeToString("{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        long expira = java.time.Instant.now().plusSeconds(3600).getEpochSecond();
        String corpo = b64.encodeToString(("{\"iss\":\"sistemamelvin\",\"sub\":\"admin\",\"exp\":" + expira + "}")
                .getBytes(java.nio.charset.StandardCharsets.UTF_8));

        assertEquals("", tokenService.validateToken(cabecalho + "." + corpo + "."));
    }

    @Test
    public void testTokenExpiradoEhRejeitado() {
        String expirado = com.auth0.jwt.JWT.create()
                .withIssuer("sistemamelvin")
                .withSubject("admin")
                .withExpiresAt(java.time.Instant.now().minusSeconds(60))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(SEGREDO));

        assertEquals("", tokenService.validateToken(expirado));
    }

    @Test
    public void testTokenDeOutroEmissorEhRejeitado() {
        String deOutroEmissor = com.auth0.jwt.JWT.create()
                .withIssuer("outro-sistema")
                .withSubject("admin")
                .withExpiresAt(java.time.Instant.now().plusSeconds(3600))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(SEGREDO));

        assertEquals("", tokenService.validateToken(deOutroEmissor));
    }

    @Test
    public void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        String result = tokenService.validateToken(invalidToken);
        assertEquals("", result);
    }
}
