package br.com.melvin.sistema.security.model;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserTest {

    private String singleAuthority(UserRole role) {
        User user = new User("matricula", "senha", role);
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertEquals(1, authorities.size());
        return authorities.iterator().next().getAuthority();
    }

    @Test
    void getAuthorities_Tech_RetornaRoleTech() {
        // Regressão: TECH precisa de um branch explícito em getAuthorities(). O último "else"
        // do método resolve para ROLE_DIRE — sem o branch dedicado, TECH cairia ali por engano.
        assertEquals("ROLE_TECH", singleAuthority(UserRole.TECH));
    }

    @Test
    void getAuthorities_Dire_AindaResolveViaFallback() {
        // Guarda de regressão do comportamento existente: DIRE é o único cargo sem branch próprio
        // em getAuthorities(), resolvido pelo "else" final. Continua funcionando após a adição do TECH.
        assertEquals("ROLE_DIRE", singleAuthority(UserRole.DIRE));
    }

    @Test
    void getAuthorities_Adm_RetornaRoleAdm() {
        assertTrue(singleAuthority(UserRole.ADM).equals("ROLE_ADM"));
    }
}
