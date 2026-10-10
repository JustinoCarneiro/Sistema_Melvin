package br.com.melvin.sistema.domain.dashboard.service;

import java.util.Set;

import org.springframework.security.core.Authentication;

/**
 * Quem pode ver a nota psicológica no ranking do painel (ordenação psicológica e média
 * que a inclui). Fonte única para a regra de segurança e para o controller.
 */
public final class NotaPsicologicaAcesso {

    private static final Set<String> AUTORIDADES = Set.of("ROLE_PSICO", "ROLE_COOR");

    private NotaPsicologicaAcesso() {
    }

    public static boolean podeVer(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(autoridade -> AUTORIDADES.contains(autoridade.getAuthority()));
    }
}
