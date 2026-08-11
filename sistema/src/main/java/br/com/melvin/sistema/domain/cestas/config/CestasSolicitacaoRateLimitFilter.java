package br.com.melvin.sistema.domain.cestas.config;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * US-7.4: único endpoint público do sistema que dispara um fluxo de validação
 * interna (diferente dos demais endpoints permitAll, que só registram intenção
 * de doação) — por isso é o único com rate limit, em vez de estender a proteção
 * a todo o sistema de uma vez (decisão registrada em memoria-tecnica/decisoes/).
 * Limite por IP, em memória — suficiente para uma instância única do backend
 * (ver docker-compose.yml: sem réplicas horizontais hoje).
 */
@Component
public class CestasSolicitacaoRateLimitFilter extends OncePerRequestFilter {

    private static final String PATH = "/cestas/solicitacao";
    private static final int CAPACIDADE = 5;
    private static final Duration JANELA = Duration.ofHours(1);
    private static final int MAX_IPS_MONITORADOS = 10_000;

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!"POST".equalsIgnoreCase(request.getMethod()) || !PATH.equals(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = extrairIp(request);

        // Teto de segurança: o mapa vive em memória e nunca expira sozinho. Com o heap
        // limitado a 512m (ver memoria-tecnica/bugs/heap-exhaustion-504-cronico.md), um
        // volume atípico de IPs distintos não pode crescer sem limite. Ao encher, zera —
        // é preferível reabrir a janela de alguns IPs a arriscar a memória do processo.
        if (buckets.size() >= MAX_IPS_MONITORADOS && !buckets.containsKey(ip)) {
            buckets.clear();
        }

        Bucket bucket = buckets.computeIfAbsent(ip, k -> criarBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Muitas solicitações. Tente novamente mais tarde.\"}");
        }
    }

    private Bucket criarBucket() {
        Bandwidth limite = Bandwidth.classic(CAPACIDADE, Refill.intervally(CAPACIDADE, JANELA));
        return Bucket.builder().addLimit(limite).build();
    }

    /**
     * A chave do limite precisa ser um valor que o cliente NÃO controle.
     * `X-Real-IP` é sobrescrito pelo nginx com `$remote_addr` (o IP da conexão TCP),
     * então é confiável. Já `X-Forwarded-For` chega como "<valor do cliente>, <ip real>"
     * por causa do `$proxy_add_x_forwarded_for` — usar o começo dele deixaria o próprio
     * cliente escolher a chave, burlando o limite e criando um bucket por valor forjado.
     * Por isso, no fallback, vale o ÚLTIMO elemento (o que o nginx anexou).
     */
    private String extrairIp(HttpServletRequest request) {
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] partes = forwarded.split(",");
            return partes[partes.length - 1].trim();
        }

        return request.getRemoteAddr();
    }
}
