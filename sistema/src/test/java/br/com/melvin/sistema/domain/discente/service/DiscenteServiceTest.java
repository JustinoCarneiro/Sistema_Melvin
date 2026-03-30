package br.com.melvin.sistema.domain.discente.service;

import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import br.com.melvin.sistema.domain.discente.dto.DiscenteAvaliacaoDTO;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

@ExtendWith(MockitoExtension.class)
public class DiscenteServiceTest {

    @Mock
    private DiscenteRepository discenteRepository;

    @Mock
    private PermissaoService permissaoService;

    @InjectMocks
    private DiscenteService discenteService;

    @Test
    public void testCadastrarDiscenteComMatriculadoExistente() {
        Discente discente = new Discente();
        discente.setMatricula("12345");
        discente.setNome("João");

        when(discenteRepository.findByMatricula("12345")).thenReturn(discente);

        ResponseEntity<?> response = discenteService.cadastrar(discente);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Matricula já cadastrada!", response.getBody());
    }

    @Test
    public void testRemoverDiscenteNaoExistente() {
        when(discenteRepository.findByMatricula("9999")).thenReturn(null);

        ResponseEntity<String> response = discenteService.remover("9999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Matricula não cadastrada!", response.getBody());
    }

    @Test
    public void testAlterarAvaliacoesComPermissaoRendimento() {
        String matricula = "2026001";
        Discente discente = new Discente();
        discente.setMatricula(matricula);
        
        DiscenteAvaliacaoDTO dto = new DiscenteAvaliacaoDTO();
        dto.setAvaliacaoRendimento(4.5);
        dto.setAvaliacaoPsicologico(3.0);

        when(discenteRepository.findByMatricula(matricula)).thenReturn(discente);
        
        // Mocking SecurityContext
        Authentication auth = Mockito.mock(Authentication.class);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        try (MockedStatic<SecurityContextHolder> mockedSecurity = Mockito.mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            when(permissaoService.hasPermission(auth, "EDITAR_RENDIMENTO")).thenReturn(true);
            when(permissaoService.hasPermission(auth, "EDITAR_AVALIACAO_PSICO")).thenReturn(false);

            ResponseEntity<?> response = discenteService.alterarAvaliacoes(matricula, dto);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(4.5, discente.getAvaliacaoRendimento());
            assertEquals(null, discente.getAvaliacaoPsicologico());
            verify(discenteRepository).save(discente);
        }
    }

    @Test
    public void testAlterarAvaliacoesComPermissaoPsico() {
        String matricula = "2026001";
        Discente discente = new Discente();
        discente.setMatricula(matricula);
        
        DiscenteAvaliacaoDTO dto = new DiscenteAvaliacaoDTO();
        dto.setAvaliacaoRendimento(4.5);
        dto.setAvaliacaoPsicologico(3.0);

        when(discenteRepository.findByMatricula(matricula)).thenReturn(discente);
        
        // Mocking SecurityContext
        Authentication auth = Mockito.mock(Authentication.class);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        try (MockedStatic<SecurityContextHolder> mockedSecurity = Mockito.mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            when(permissaoService.hasPermission(auth, "EDITAR_RENDIMENTO")).thenReturn(false);
            when(permissaoService.hasPermission(auth, "EDITAR_AVALIACAO_PSICO")).thenReturn(true);

            ResponseEntity<?> response = discenteService.alterarAvaliacoes(matricula, dto);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(null, discente.getAvaliacaoRendimento());
            assertEquals(3.0, discente.getAvaliacaoPsicologico());
        }
    }
}
