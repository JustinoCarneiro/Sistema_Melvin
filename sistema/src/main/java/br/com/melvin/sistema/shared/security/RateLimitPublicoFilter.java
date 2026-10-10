package br.com.melvin.sistema.shared.security;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Limite de requisições por IP nos endpoints PÚBLICOS que gravam dados, disparam e-mail ou chamam o
 * Stripe: sem login, qualquer script pode repetir essas chamadas. Cada rota tem a sua própria cota,
 * por IP, em memória — suficiente para uma instância única do backend (ver docker-compose.yml: sem
 * réplicas horizontais hoje).
 *
 * Começou só com a solicitação de cesta (memoria-tecnica/decisoes/rate-limit-apenas-solicitacao-cesta.md)
 * e passou a cobrir o cadastro de embaixador e as rotas públicas de doação, que ficaram de fora por
 * receio de mexer no fluxo de cobrança. Um limite só devolve 429 depois da cota: não duplica nem
 * reenvia nada; as cotas de doação são folgadas para não barrar um evento com várias pessoas na
 * mesma rede (o IP é compartilhado). Se alguém legítimo for barrado, subir a cota é a correção.
 */
@Component
public class RateLimitPublicoFilter extends OncePerRequestFilter {

    private record Regra(String metodo, String caminho, int capacidade, Duration janela) {
    }

    private static final List<Regra> REGRAS = List.of(
            new Regra("POST", "/cestas/solicitacao", 5, Duration.ofHours(1)),
            new Regra("POST", "/embaixador", 5, Duration.ofHours(1)),
            new Regra("POST", "/amigomelvin/subscribe", 20, Duration.ofHours(1)),
            new Regra("POST", "/amigomelvin/one-time", 30, Duration.ofHours(1)),
            new Regra("POST", "/amigomelvin/items", 20, Duration.ofHours(1)));

    private static final int MAX_CHAVES_MONITORADAS = 10_000;

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Regra regra = regraDa(request);
        if (regra == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String chave = regra.metodo() + " " + regra.caminho() + "|" + ClientIp.de(request);

        // Teto de segurança: o mapa vive em memória e nunca expira sozinho. Com o heap
        // limitado a 512m (ver memoria-tecnica/bugs/heap-exhaustion-504-cronico.md), um
        // volume atípico de IPs distintos não pode crescer sem limite. Ao encher, zera —
        // é preferível reabrir a janela de alguns IPs a arriscar a memória do processo.
        if (buckets.size() >= MAX_CHAVES_MONITORADAS && !buckets.containsKey(chave)) {
            buckets.clear();
        }

        Bucket bucket = buckets.computeIfAbsent(chave, k -> criarBucket(regra));

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Muitas solicitações. Tente novamente mais tarde.\"}");
        }
    }

    /**
     * Compara com o caminho DECODIFICADO e normalizado, o mesmo que o Spring MVC usa para achar o
     * controller. O `getRequestURI()` cru viria com "/%65mbaixador" e a rota continuaria alcançável
     * sem passar pelo limite.
     */
    private Regra regraDa(HttpServletRequest request) {
        String caminho = UrlPathHelper.defaultInstance.getPathWithinApplication(request);
        if (caminho.length() > 1 && caminho.endsWith("/")) {
            caminho = caminho.substring(0, caminho.length() - 1);
        }
        for (Regra regra : REGRAS) {
            if (regra.metodo().equalsIgnoreCase(request.getMethod()) && regra.caminho().equals(caminho)) {
                return regra;
            }
        }
        return null;
    }

    private Bucket criarBucket(Regra regra) {
        Bandwidth limite = Bandwidth.classic(regra.capacidade(), Refill.intervally(regra.capacidade(), regra.janela()));
        return Bucket.builder().addLimit(limite).build();
    }
}
