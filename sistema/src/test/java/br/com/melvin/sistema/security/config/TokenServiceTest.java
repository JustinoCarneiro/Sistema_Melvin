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

    private TokenService tokenService;

    @BeforeEach
    public void setup() {
        when(securityProperties.getSecret()).thenReturn("test-secret");
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
    public void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        String result = tokenService.validateToken(invalidToken);
        assertEquals("", result);
    }
}
