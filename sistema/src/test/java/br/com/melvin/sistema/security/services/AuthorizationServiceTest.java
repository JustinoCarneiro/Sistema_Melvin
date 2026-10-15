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

    @Mock
    private ContaDeEquipeAtiva contaAtiva;

    @InjectMocks
    private AuthorizationService service;

    @Test
    void deveRetornarUsuarioQuandoMatriculaExiste() {
        User user = new User("2026001", "hash", UserRole.ADM);
        when(repository.findByLogin("2026001")).thenReturn(user);
        when(contaAtiva.ativa("2026001")).thenReturn(true);

        UserDetails result = service.loadUserByUsername("2026001");

        assertThat(result).isEqualTo(user);
    }

    // Voluntário desligado responde como matrícula inexistente: o login falha com a mesma
    // mensagem de senha errada e não revela que a conta existe.
    @Test
    void deveRecusarContaDeVoluntarioDesligadoComoSeNaoExistisse() {
        User user = new User("2026002", "hash", UserRole.PROF);
        when(repository.findByLogin("2026002")).thenReturn(user);
        when(contaAtiva.ativa("2026002")).thenReturn(false);

        assertThatThrownBy(() -> service.loadUserByUsername("2026002"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void deveLancarUsernameNotFoundQuandoMatriculaNaoExiste() {
        when(repository.findByLogin("0000000")).thenReturn(null);

        assertThatThrownBy(() -> service.loadUserByUsername("0000000"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
