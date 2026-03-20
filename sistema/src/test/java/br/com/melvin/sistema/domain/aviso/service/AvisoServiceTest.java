package br.com.melvin.sistema.domain.aviso.service;

import br.com.melvin.sistema.domain.aviso.model.Aviso;
import br.com.melvin.sistema.domain.aviso.repository.AvisoRepository;
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
public class AvisoServiceTest {

    @Mock
    private AvisoRepository repositorio;

    @InjectMocks
    private AvisoService avisoService;

    @Test
    public void testAdicionarAviso() {
        Aviso aviso = new Aviso();
        aviso.setTitulo("Aviso Teste");

        when(repositorio.save(any(Aviso.class))).thenReturn(aviso);

        ResponseEntity<?> response = avisoService.adicionar(aviso);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(repositorio, times(1)).save(any(Aviso.class));
    }

    @Test
    public void testAlterarAvisoSucesso() {
        UUID id = UUID.randomUUID();
        Aviso existente = new Aviso();
        existente.setId(id);
        existente.setTitulo("Título Antigo");

        Aviso novo = new Aviso();
        novo.setTitulo("Título Novo");

        when(repositorio.findById(id)).thenReturn(Optional.of(existente));
        when(repositorio.save(any(Aviso.class))).thenReturn(existente);

        ResponseEntity<?> response = avisoService.alterar(id, novo);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Título Novo", ((Aviso) response.getBody()).getTitulo());
    }

    @Test
    public void testAlterarAvisoNaoEncontrado() {
        UUID id = UUID.randomUUID();
        Aviso novo = new Aviso();

        when(repositorio.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = avisoService.alterar(id, novo);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Aviso não encontrado!", response.getBody());
    }
}
