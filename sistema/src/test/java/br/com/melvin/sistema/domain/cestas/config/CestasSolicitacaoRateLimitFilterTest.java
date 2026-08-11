package br.com.melvin.sistema.domain.cestas.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * US-7.4: garante que o rate limit protege só o endpoint público de solicitação
 * de cesta, por IP, e não interfere no resto do sistema.
 */
class CestasSolicitacaoRateLimitFilterTest {

    private CestasSolicitacaoRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new CestasSolicitacaoRateLimitFilter();
    }

    private MockHttpServletRequest solicitacaoRequest(String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/cestas/solicitacao");
        request.setRemoteAddr(ip);
        return request;
    }

    @Test
    void deixaPassarRequisicoesParaOutrasRotas() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/cestas");
        request.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void deixaPassarAteOLimiteDeRequisicoesDoMesmoIp() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilterInternal(solicitacaoRequest("9.9.9.9"), response, chain);
            assertEquals(200, response.getStatus());
        }

        verify(chain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void bloqueiaComQuatrocentosEVinteENoveAposEstourarOLimite() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            filter.doFilterInternal(solicitacaoRequest("8.8.8.8"), new MockHttpServletResponse(), chain);
        }

        MockHttpServletResponse sextaResposta = new MockHttpServletResponse();
        filter.doFilterInternal(solicitacaoRequest("8.8.8.8"), sextaResposta, chain);

        assertEquals(429, sextaResposta.getStatus());
        verify(chain, times(5)).doFilter(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void naoMisturaLimitesDeIpsDiferentes() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            filter.doFilterInternal(solicitacaoRequest("1.1.1.1"), new MockHttpServletResponse(), chain);
        }

        MockHttpServletResponse respostaOutroIp = new MockHttpServletResponse();
        filter.doFilterInternal(solicitacaoRequest("2.2.2.2"), respostaOutroIp, chain);

        assertEquals(200, respostaOutroIp.getStatus());
    }
}
