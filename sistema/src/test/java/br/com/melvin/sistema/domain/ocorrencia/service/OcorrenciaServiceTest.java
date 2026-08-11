package br.com.melvin.sistema.domain.ocorrencia.service;

import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.domain.ocorrencia.model.CategoriaOcorrencia;
import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import br.com.melvin.sistema.domain.ocorrencia.repository.OcorrenciaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * US-3.7: Registrar Ocorrências do Aluno (CLAUDE.md, Épico 3).
 */
@ExtendWith(MockitoExtension.class)
public @SuppressWarnings("null")
class OcorrenciaServiceTest {

    @Mock
    private OcorrenciaRepository repository;

    @Mock
    private DiscenteRepository repositoryDiscente;

    @InjectMocks
    private OcorrenciaService service;

    private Ocorrencia createOcorrencia(String matricula) {
        Ocorrencia o = new Ocorrencia();
        o.setMatricula_discente(matricula);
        o.setCategoria(CategoriaOcorrencia.COMPORTAMENTAL);
        o.setDescricao("Aluno interrompeu a aula por diversas vezes.");
        o.setData_ocorrencia(LocalDate.now());
        return o;
    }

    @Test
    public void testCadastrarComMatriculaValidaRetorna201EAssociaAutorETimestamp() {
        Ocorrencia ocorrencia = createOcorrencia("2026001");
        Discente discente = new Discente();
        discente.setMatricula("2026001");

        when(repositoryDiscente.findByMatricula("2026001")).thenReturn(discente);
        when(repository.save(any(Ocorrencia.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = service.cadastrar(ocorrencia, "PROF001");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());

        ArgumentCaptor<Ocorrencia> captor = ArgumentCaptor.forClass(Ocorrencia.class);
        verify(repository, times(1)).save(captor.capture());
        assertEquals("PROF001", captor.getValue().getAutor_login());
        assertNotNull(captor.getValue().getCriado_em());
    }

    @Test
    public void testCadastrarComMatriculaInexistenteRetorna404() {
        Ocorrencia ocorrencia = createOcorrencia("9999999");

        when(repositoryDiscente.findByMatricula("9999999")).thenReturn(null);

        ResponseEntity<?> response = service.cadastrar(ocorrencia, "PROF001");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(repository, never()).save(any(Ocorrencia.class));
    }

    @Test
    public void testListarPorDiscenteDelegaParaRepositorioOrdenado() {
        Ocorrencia recente = createOcorrencia("2026001");
        Ocorrencia antiga = createOcorrencia("2026001");
        when(repository.findAllByMatriculaOrdenadoPorDataDesc("2026001")).thenReturn(List.of(recente, antiga));

        List<Ocorrencia> resultado = service.listarPorDiscente("2026001");

        assertEquals(2, resultado.size());
        verify(repository, times(1)).findAllByMatriculaOrdenadoPorDataDesc(eq("2026001"));
    }
}
