package br.com.melvin.sistema.domain.amigomelvin.service;

import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.repository.AmigoMelvinRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AmigoMelvinServiceTest {

    @Mock
    private AmigoMelvinRepository repositorio;

    @InjectMocks
    private AmigoMelvinService amigoMelvinService;

    @Test
    public void testAdicionarAmigoMelvin() {
        AmigoMelvin amigo = new AmigoMelvin();
        amigo.setNome("Amigo Teste");

        when(repositorio.save(any(AmigoMelvin.class))).thenReturn(amigo);

        ResponseEntity<?> response = amigoMelvinService.adicionar(amigo);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(repositorio, times(1)).save(any(AmigoMelvin.class));
    }

    @Test
    public void testAlterarAmigoMelvinSucesso() {
        String nome = "Amigo Existente";
        AmigoMelvin existente = new AmigoMelvin();
        existente.setId(UUID.randomUUID());
        existente.setNome(nome);

        AmigoMelvin atualizado = new AmigoMelvin();
        atualizado.setNome(nome);
        atualizado.setEmail("novo@email.com");

        when(repositorio.findByNome(nome)).thenReturn(existente);
        when(repositorio.save(any(AmigoMelvin.class))).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.alterar(atualizado);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(repositorio, times(1)).save(any(AmigoMelvin.class));
    }

    @Test
    public void testAlterarAmigoMelvinNaoEncontrado() {
        String nome = "Amigo Inexistente";
        AmigoMelvin atualizado = new AmigoMelvin();
        atualizado.setNome(nome);

        when(repositorio.findByNome(nome)).thenReturn(null);

        ResponseEntity<?> response = amigoMelvinService.alterar(atualizado);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("AmigoMelvin não cadastrado!", response.getBody());
    }
}
