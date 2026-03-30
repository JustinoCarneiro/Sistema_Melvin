package br.com.melvin.sistema.domain.permissao.service;

import br.com.melvin.sistema.domain.permissao.dto.PermissaoRegraDTO;
import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import br.com.melvin.sistema.domain.permissao.repository.PermissaoRegraRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PermissaoServiceTest {

    @Mock
    private PermissaoRegraRepository repository;

    @Mock
    private Environment environment;

    @InjectMocks
    private PermissaoService permissaoService;

    @Test
    public void testHasPermission_UserHasPermission() {
        String reglaName = "EDITAR_RENDIMENTO";
        User user = new User();
        user.setRole(UserRole.PROF);
        
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        PermissaoRegra regla = new PermissaoRegra();
        regla.setNomeRegra(reglaName);
        regla.setRolesPermitidas("ADM,DIRE,PROF");

        when(repository.findByNomeRegra(reglaName)).thenReturn(Optional.of(regla));

        boolean hasPermission = permissaoService.hasPermission(auth, reglaName);

        assertTrue(hasPermission);
    }

    @Test
    public void testHasPermission_UserNoPermission() {
        String reglaName = "EDITAR_RENDIMENTO";
        User user = new User();
        user.setRole(UserRole.PROF);
        
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        PermissaoRegra regla = new PermissaoRegra();
        regla.setNomeRegra(reglaName);
        regla.setRolesPermitidas("ADM,DIRE");

        when(repository.findByNomeRegra(reglaName)).thenReturn(Optional.of(regla));

        boolean hasPermission = permissaoService.hasPermission(auth, reglaName);

        assertFalse(hasPermission);
    }

    @Test
    public void testListarMinhasPermissoes() {
        User user = new User();
        user.setRole(UserRole.ADM);
        
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        PermissaoRegra r1 = new PermissaoRegra();
        r1.setNomeRegra("R1");
        r1.setRolesPermitidas("ADM,DIRE");

        PermissaoRegra r2 = new PermissaoRegra();
        r2.setNomeRegra("R2");
        r2.setRolesPermitidas("PROF");

        when(repository.findAll()).thenReturn(Arrays.asList(r1, r2));

        List<String> permitidas = permissaoService.listarMinhasPermissoes(auth);

        assertEquals(1, permitidas.size());
        assertTrue(permitidas.contains("R1"));
        assertFalse(permitidas.contains("R2"));
    }

    @Test
    public void testAtualizarRegra() {
        String reglaName = "R1";
        List<String> novasRoles = Arrays.asList("ADM", "PROF");
        PermissaoRegra regla = new PermissaoRegra();
        regla.setNomeRegra(reglaName);
        regla.setRolesPermitidas("ADM");

        when(repository.findByNomeRegra(reglaName)).thenReturn(Optional.of(regla));

        ResponseEntity<?> response = permissaoService.atualizarRegra(reglaName, novasRoles);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("ADM,PROF", regla.getRolesPermitidas());
        verify(repository).save(regla);
    }
}
