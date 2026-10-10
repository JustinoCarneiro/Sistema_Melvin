package br.com.melvin.sistema.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Atrás do nginx, todo header HTTP é entrada do usuário; o único valor confiável é o que o próprio
 * nginx escreve (X-Real-IP, ou o fim do X-Forwarded-For).
 */
class ClientIpTest {

    private MockHttpServletRequest requisicao() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/qualquer");
        request.setRemoteAddr("127.0.0.1");
        return request;
    }

    @Test
    void usaOXRealIpQuandoPresente() {
        MockHttpServletRequest request = requisicao();
        request.addHeader("X-Real-IP", " 200.1.2.3 ");

        assertEquals("200.1.2.3", ClientIp.de(request));
    }

    @Test
    void xRealIpTemPrioridadeSobreXForwardedForForjado() {
        MockHttpServletRequest request = requisicao();
        request.addHeader("X-Real-IP", "200.1.2.3");
        request.addHeader("X-Forwarded-For", "1.1.1.1, 2.2.2.2");

        assertEquals("200.1.2.3", ClientIp.de(request));
    }

    @Test
    void semXRealIpUsaOUltimoElementoDoXForwardedFor() {
        MockHttpServletRequest request = requisicao();
        request.addHeader("X-Forwarded-For", "forjado-pelo-cliente, 200.9.9.9");

        assertEquals("200.9.9.9", ClientIp.de(request));
    }

    @Test
    void semHeadersUsaOEnderecoDaConexao() {
        assertEquals("127.0.0.1", ClientIp.de(requisicao()));
    }

    @Test
    void headerEmBrancoNaoContaComoIp() {
        MockHttpServletRequest request = requisicao();
        request.addHeader("X-Real-IP", "   ");
        request.addHeader("X-Forwarded-For", " ");

        assertEquals("127.0.0.1", ClientIp.de(request));
    }
}
