package br.com.melvin.sistema.domain.frequencia.service;

import java.util.Set;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

/**
 * Quem pode registrar ou alterar o ponto de um voluntário. Cada voluntário registra o próprio ponto
 * (tela de Configurações, aberta a todos os cargos); os cargos que têm tela de frequência da equipe
 * (ADM, TECH, DIRE e COOR) também registram o de outras pessoas. Qualquer outro cargo não pode
 * lançar presença em nome de um colega. A leitura segue o mesmo critério: cada um lê o próprio ponto e
 * só a equipe lê o de todos (passe {@code null} para o livro de todos).
 */
public final class PontoVoluntarioAcesso {

    private static final Set<String> AUTORIDADES_DA_EQUIPE = Set.of("ROLE_ADM", "ROLE_TECH", "ROLE_DIRE", "ROLE_COOR");

    private PontoVoluntarioAcesso() {
    }

    public static boolean podeConsultar(Authentication authentication, String matriculaDoPonto) {
        return podeRegistrar(authentication, matriculaDoPonto);
    }

    public static boolean podeRegistrar(Authentication authentication, String matriculaDoPonto) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated()) {
            return false;
        }
        if (matriculaDoPonto != null && matriculaDoPonto.equals(authentication.getName())) {
            return true;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(autoridade -> AUTORIDADES_DA_EQUIPE.contains(autoridade.getAuthority()));
    }
}
