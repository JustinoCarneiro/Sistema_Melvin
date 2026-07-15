package br.com.melvin.sistema.security.services;

import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthorizationServiceTest {

    @Mock
    private UserRepository repository;

    @InjectMocks
    private AuthorizationService service;

    @Test
    void deveRetornarUsuarioQuandoMatriculaExiste() {
        User user = new User("2026001", "hash", UserRole.ADM);
        when(repository.findByLogin("2026001")).thenReturn(user);

        UserDetails result = service.loadUserByUsername("2026001");

        assertThat(result).isEqualTo(user);
    }

    @Test
    void deveLancarUsernameNotFoundQuandoMatriculaNaoExiste() {
        when(repository.findByLogin("0000000")).thenReturn(null);

        assertThatThrownBy(() -> service.loadUserByUsername("0000000"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
