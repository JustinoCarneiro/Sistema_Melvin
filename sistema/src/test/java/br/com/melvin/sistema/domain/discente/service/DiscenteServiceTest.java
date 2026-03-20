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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DiscenteServiceTest {

    @Mock
    private DiscenteRepository discenteRepository;

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
}
