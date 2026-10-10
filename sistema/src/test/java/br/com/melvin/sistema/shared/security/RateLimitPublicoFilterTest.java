package br.com.melvin.sistema.shared.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * O limite protege só as rotas públicas que gravam dados, mandam e-mail ou chamam o Stripe, por IP e por
 * rota, e não interfere no resto do sistema. Os casos da solicitação de cesta (US-7.4) vieram do filtro
 * que só cobria essa rota.
 */
class RateLimitPublicoFilterTest {

    private RateLimitPublicoFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitPublicoFilter();
    }

    private MockHttpServletRequest post(String caminho, String ip) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", caminho);
        request.setRemoteAddr(ip);
        return request;
    }

    private MockHttpServletRequest solicitacaoRequest(String ip) {
        return post("/cestas/solicitacao", ip);
    }

    private int chamar(MockHttpServletRequest request, FilterChain chain) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, chain);
        return response.getStatus();
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
            assertEquals(200, chamar(solicitacaoRequest("9.9.9.9"), chain));
        }

        verify(chain, times(5)).doFilter(any(), any());
    }

    @Test
    void bloqueiaComQuatrocentosEVinteENoveAposEstourarOLimite() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            chamar(solicitacaoRequest("8.8.8.8"), chain);
        }

        assertEquals(429, chamar(solicitacaoRequest("8.8.8.8"), chain));
        verify(chain, times(5)).doFilter(any(), any());
    }

    @Test
    void naoAceitaXForwardedForForjadoParaBurlarOLimite() throws Exception {
        // O nginx usa $proxy_add_x_forwarded_for, que ANEXA o IP real ao que o cliente
        // mandou. Se a chave sair do começo do header, o cliente escolhe a própria chave:
        // troca o valor a cada request e o limite nunca fecha — além de criar um bucket
        // novo por valor forjado (vazamento de memória, com histórico de 504 no projeto).
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 6; i++) {
            MockHttpServletRequest req = solicitacaoRequest("7.7.7.7");
            req.addHeader("X-Forwarded-For", "1.2.3." + i + ", 7.7.7.7");
            chamar(req, chain);
        }

        MockHttpServletRequest req = solicitacaoRequest("7.7.7.7");
        req.addHeader("X-Forwarded-For", "9.9.9.9, 7.7.7.7");

        assertEquals(429, chamar(req, chain));
    }

    @Test
    void naoMisturaLimitesDeIpsDiferentes() throws Exception {
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 5; i++) {
            chamar(solicitacaoRequest("1.1.1.1"), chain);
        }

        assertEquals(200, chamar(solicitacaoRequest("2.2.2.2"), chain));
    }

    // ---- as demais rotas públicas ----

    @Test
    void cadastroDeEmbaixadorTambemTemLimite() throws Exception {
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 5; i++) {
            assertEquals(200, chamar(post("/embaixador", "3.3.3.3"), chain));
        }
        assertEquals(429, chamar(post("/embaixador", "3.3.3.3"), chain));
    }

    @Test
    void rotasDeDoacaoTemLimiteMaisFolgado() throws Exception {
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 20; i++) {
            assertEquals(200, chamar(post("/amigomelvin/subscribe", "4.4.4.4"), chain), "assinatura " + i);
        }
        assertEquals(429, chamar(post("/amigomelvin/subscribe", "4.4.4.4"), chain));

        for (int i = 0; i < 30; i++) {
            assertEquals(200, chamar(post("/amigomelvin/one-time", "4.4.4.4"), chain), "doação única " + i);
        }
        assertEquals(429, chamar(post("/amigomelvin/one-time", "4.4.4.4"), chain));

        for (int i = 0; i < 20; i++) {
            assertEquals(200, chamar(post("/amigomelvin/items", "4.4.4.4"), chain), "doação de itens " + i);
        }
        assertEquals(429, chamar(post("/amigomelvin/items", "4.4.4.4"), chain));
    }

    @Test
    void cadaRotaTemACotaPropriaPorIp() throws Exception {
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 5; i++) {
            chamar(post("/embaixador", "5.5.5.5"), chain);
        }
        assertEquals(429, chamar(post("/embaixador", "5.5.5.5"), chain));

        // Estourar a cota de uma rota não bloqueia as outras do mesmo IP.
        assertEquals(200, chamar(post("/amigomelvin/items", "5.5.5.5"), chain));
        assertEquals(200, chamar(solicitacaoRequest("5.5.5.5"), chain));
    }

    @Test
    void soContaOMetodoDaRegra() throws Exception {
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 12; i++) {
            MockHttpServletRequest leitura = new MockHttpServletRequest("GET", "/embaixador");
            leitura.setRemoteAddr("6.6.6.6");
            assertEquals(200, chamar(leitura, chain));
        }
        assertEquals(200, chamar(post("/embaixador", "6.6.6.6"), chain));
    }

    @Test
    void naoBurlaOLimiteComLetraDoCaminhoCodificada() throws Exception {
        // "/%65mbaixador" é "/embaixador" para o Spring MVC, mas o getRequestURI() cru é outro texto.
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 5; i++) {
            chamar(post("/embaixador", "10.10.10.10"), chain);
        }

        assertEquals(429, chamar(post("/%65mbaixador", "10.10.10.10"), chain));
        assertEquals(429, chamar(post("/embaixador/", "10.10.10.10"), chain));
    }

    @Test
    void tetoDoMapaDeChavesZeraSemEstourarAMemoria() throws Exception {
        // 10.000 IPs distintos enchem o mapa; o próximo IP limpa o mapa em vez de crescer sem fim.
        FilterChain chain = mock(FilterChain.class);
        for (int i = 0; i < 10_000; i++) {
            chamar(post("/embaixador", "ip-" + i), chain);
        }
        assertEquals(200, chamar(post("/embaixador", "ip-novo"), chain));
    }
}
