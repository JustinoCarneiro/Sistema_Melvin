package br.com.melvin.sistema.support;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP simulado único por chamada. O limite de requisições das rotas públicas (RateLimitPublicoFilter) e o de
 * tentativas de login são por IP e vivem no contexto Spring, que o JUnit reaproveita entre classes de teste;
 * sem um IP próprio, testes que repetem uma rota pública acumulariam cota uns dos outros.
 */
public final class TestIps {

    private static final AtomicInteger CONTADOR = new AtomicInteger();

    private TestIps() {
    }

    public static String novo() {
        int n = CONTADOR.incrementAndGet();
        return "10." + (200 + (n / 65_000)) + "." + ((n / 250) % 250) + "." + (n % 250 + 1);
    }
}
