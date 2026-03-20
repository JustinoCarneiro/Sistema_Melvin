package br.com.melvin.sistema.domain.cestas.service;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.repository.CestasRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CestasServiceTest {

    @Mock
    private CestasRepository repositorio;

    @InjectMocks
    private CestasService cestasService;

    @Test
    public void testAdicionarCesta() {
        Cestas cesta = new Cestas();
        cesta.setNome("Cesta Teste");
        
        when(repositorio.save(any(Cestas.class))).thenReturn(cesta);

        ResponseEntity<?> response = cestasService.adicionar(cesta);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(repositorio, times(1)).save(any(Cestas.class));
    }

    @Test
    public void testAlterarCestaSucesso() {
        UUID id = UUID.randomUUID();
        Cestas cestaExistente = new Cestas();
        cestaExistente.setId(id);
        cestaExistente.setNome("Nome Antigo");

        Cestas cestaAtualizada = new Cestas();
        cestaAtualizada.setId(id);
        cestaAtualizada.setNome("Nome Novo");

        when(repositorio.findById(id)).thenReturn(Optional.of(cestaExistente));
        when(repositorio.save(any(Cestas.class))).thenReturn(cestaAtualizada);

        ResponseEntity<?> response = cestasService.alterar(cestaAtualizada);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Nome Novo", ((Cestas) response.getBody()).getNome());
    }

    @Test
    public void testAlterarCestaSemId() {
        Cestas cesta = new Cestas();
        cesta.setId(null);

        ResponseEntity<?> response = cestasService.alterar(cesta);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("ID da doação não informado para alteração.", response.getBody());
    }

    @Test
    public void testAlterarCestaNaoEncontrada() {
        UUID id = UUID.randomUUID();
        Cestas cesta = new Cestas();
        cesta.setId(id);

        when(repositorio.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = cestasService.alterar(cesta);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Doação não encontrada no banco de dados!", response.getBody());
    }

    @Test
    public void testRemoverCestaSucesso() {
        UUID id = UUID.randomUUID();
        when(repositorio.existsById(id)).thenReturn(true);

        ResponseEntity<String> response = cestasService.remover(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Doação removida com sucesso!", response.getBody());
        verify(repositorio, times(1)).deleteById(id);
    }

    @Test
    public void testRemoverCestaNaoEncontrada() {
        UUID id = UUID.randomUUID();
        when(repositorio.existsById(id)).thenReturn(false);

        ResponseEntity<String> response = cestasService.remover(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Doação não encontrada!", response.getBody());
    }
}
