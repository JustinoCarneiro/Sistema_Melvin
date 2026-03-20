package br.com.melvin.sistema.domain.diario.service;

import br.com.melvin.sistema.domain.diario.model.Diario;
import br.com.melvin.sistema.domain.diario.repository.DiarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DiarioServiceTest {

    @Mock
    private DiarioRepository repositoryDiario;

    @InjectMocks
    private DiarioService diarioService;

    @Test
    public void testUploadArquivoVazio() {
        MockMultipartFile file = new MockMultipartFile("file", "", "text/plain", new byte[0]);
        
        ResponseEntity<?> response = diarioService.upload(file, "12345");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Selecione um arquivo para enviar", response.getBody());
    }

    @Test
    public void testCapturaPorMatricula() {
        String matricula = "12345";
        Diario diario = new Diario();
        diario.setMatriculaAtrelada(matricula);

        when(repositoryDiario.findByMatriculaAtrelada(matricula)).thenReturn(diario);

        Diario result = diarioService.capturaPorMatricula(matricula);

        assertEquals(matricula, result.getMatriculaAtrelada());
        verify(repositoryDiario, times(1)).findByMatriculaAtrelada(matricula);
    }

    @Test
    public void testDeleteDiarioNaoEncontrado() {
        String matricula = "9999";
        when(repositoryDiario.findByMatriculaAtrelada(matricula)).thenReturn(null);

        ResponseEntity<?> response = diarioService.deleteDiarioByMatricula(matricula);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Diário não encontrado para a matrícula: " + matricula, response.getBody());
    }
}
