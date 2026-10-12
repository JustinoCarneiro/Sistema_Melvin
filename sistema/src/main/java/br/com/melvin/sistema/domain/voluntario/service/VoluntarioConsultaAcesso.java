package br.com.melvin.sistema.domain.voluntario.service;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

/**
 * Quem pode consultar a ficha completa de um voluntário pela matrícula. Cada voluntário consulta a
 * própria (telas de Configurações, Frequência e Alunos); a ficha de outra pessoa, com contato, RG e
 * endereço, é só de quem gerencia voluntários.
 */
public final class VoluntarioConsultaAcesso {

    private VoluntarioConsultaAcesso() {
    }

    public static boolean podeConsultar(Authentication authentication, String matriculaConsultada, boolean gerenciaVoluntarios) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated()) {
            return false;
        }
        if (matriculaConsultada != null && matriculaConsultada.equals(authentication.getName())) {
            return true;
        }
        return gerenciaVoluntarios;
    }
}
