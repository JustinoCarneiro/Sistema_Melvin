package br.com.melvin.sistema.shared.security;

import jakarta.servlet.http.HttpServletRequest;

/**
 * IP do cliente, para usar como chave de limite de tentativas.
 *
 * A chave precisa ser um valor que o cliente NÃO controle. `X-Real-IP` é sobrescrito pelo nginx
 * com `$remote_addr` (o IP da conexão TCP) e o backend só aceita conexão do nginx (a porta fica
 * presa em 127.0.0.1), então é confiável. Já `X-Forwarded-For` chega como "<valor do cliente>, <ip real>"
 * por causa do `$proxy_add_x_forwarded_for` — usar o começo dele deixaria o próprio cliente escolher
 * a chave, burlando o limite e criando um bucket por valor forjado. Por isso, no fallback, vale o
 * ÚLTIMO elemento (o que o nginx anexou).
 * Ver memoria-tecnica/bugs/rate-limit-burlavel-por-x-forwarded-for-forjado.md.
 */
public final class ClientIp {

    private ClientIp() {
    }

    public static String de(HttpServletRequest request) {
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
