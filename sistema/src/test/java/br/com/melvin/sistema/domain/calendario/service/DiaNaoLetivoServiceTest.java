package br.com.melvin.sistema.domain.calendario.service;

import br.com.melvin.sistema.domain.calendario.model.DiaNaoLetivo;
import br.com.melvin.sistema.domain.calendario.repository.DiaNaoLetivoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DiaNaoLetivoServiceTest {

    @Mock
    private DiaNaoLetivoRepository repository;

    @InjectMocks
    private DiaNaoLetivoService service;

    private DiaNaoLetivo diaNaoLetivo;

    @BeforeEach
    void setUp() {
        diaNaoLetivo = new DiaNaoLetivo();
        diaNaoLetivo.setId(UUID.randomUUID());
        diaNaoLetivo.setData(LocalDate.of(2023, 11, 2));
        diaNaoLetivo.setDescricao("Finados");
    }

    @Test
    @SuppressWarnings("null")
    void deveCadastrarComSucesso() {
        when(repository.findByData(diaNaoLetivo.getData())).thenReturn(null);
        when(repository.save(any(DiaNaoLetivo.class))).thenReturn(diaNaoLetivo);

        ResponseEntity<?> response = service.cadastrar(diaNaoLetivo);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(diaNaoLetivo);
    }

    @Test
    void naoDeveCadastrarComDataVazia() {
        diaNaoLetivo.setData(null);

        ResponseEntity<?> response = service.cadastrar(diaNaoLetivo);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void naoDeveCadastrarComDataDuplicada() {
        when(repository.findByData(diaNaoLetivo.getData())).thenReturn(diaNaoLetivo);

        ResponseEntity<?> response = service.cadastrar(diaNaoLetivo);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @SuppressWarnings("null")
    void deveRemoverComSucesso() {
        when(repository.existsById(diaNaoLetivo.getId())).thenReturn(true);

        ResponseEntity<?> response = service.remover(diaNaoLetivo.getId());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @SuppressWarnings("null")
    void naoDeveRemoverInexistente() {
        when(repository.existsById(diaNaoLetivo.getId())).thenReturn(false);

        ResponseEntity<?> response = service.remover(diaNaoLetivo.getId());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
