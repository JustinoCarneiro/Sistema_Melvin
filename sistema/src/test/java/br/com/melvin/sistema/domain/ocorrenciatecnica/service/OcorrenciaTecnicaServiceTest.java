package br.com.melvin.sistema.domain.ocorrenciatecnica.service;

import br.com.melvin.sistema.domain.ocorrenciatecnica.model.CategoriaOcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.model.OcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.model.SeveridadeOcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.repository.OcorrenciaTecnicaRepository;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Ocorrências Técnicas: registro de achados técnicos do sistema (bugs, incidentes, decisões,
 * manutenção, segurança), exclusivo do cargo TECH (US-1.5, CLAUDE.md Épico 1).
 */
@ExtendWith(MockitoExtension.class)
public @SuppressWarnings("null")
class OcorrenciaTecnicaServiceTest {

    @Mock
    private OcorrenciaTecnicaRepository repository;

    @InjectMocks
    private OcorrenciaTecnicaService service;

    private OcorrenciaTecnica createOcorrencia() {
        OcorrenciaTecnica o = new OcorrenciaTecnica();
        o.setTitulo("Hash Argon2 corrompido via SSH");
        o.setCategoria(CategoriaOcorrenciaTecnica.BUG);
        o.setSeveridade(SeveridadeOcorrenciaTecnica.ALTA);
        o.setDescricao("O $ do formato Argon2 foi expandido pelo shell remoto ao passar por ssh com aspas duplas.");
        o.setDataOcorrencia(LocalDate.now());
        return o;
    }

    @Test
    public void testCadastrarComDadosValidosRetorna201EAssociaAutorETimestamp() {
        OcorrenciaTecnica ocorrencia = createOcorrencia();
        when(repository.save(any(OcorrenciaTecnica.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = service.cadastrar(ocorrencia, "2026009");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());

        ArgumentCaptor<OcorrenciaTecnica> captor = ArgumentCaptor.forClass(OcorrenciaTecnica.class);
        verify(repository, times(1)).save(captor.capture());
        assertEquals("2026009", captor.getValue().getAutorLogin());
        assertNotNull(captor.getValue().getCriadoEm());
        assertFalse(captor.getValue().isResolvido());
    }

    @Test
    public void testCadastrarPayloadForjadoNaoConsegueMarcarComoResolvidoDeSaida() {
        // Mesma cautela da US-7.4: payload não pode forjar estado interno (resolvido=true).
        OcorrenciaTecnica ocorrencia = createOcorrencia();
        ocorrencia.setResolvido(true);
        when(repository.save(any(OcorrenciaTecnica.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.cadastrar(ocorrencia, "2026009");

        ArgumentCaptor<OcorrenciaTecnica> captor = ArgumentCaptor.forClass(OcorrenciaTecnica.class);
        verify(repository).save(captor.capture());
        assertFalse(captor.getValue().isResolvido());
    }

    @Test
    public void testCadastrarSemTituloRetorna400() {
        OcorrenciaTecnica ocorrencia = createOcorrencia();
        ocorrencia.setTitulo(null);

        ResponseEntity<?> response = service.cadastrar(ocorrencia, "2026009");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(repository, never()).save(any(OcorrenciaTecnica.class));
    }

    @Test
    public void testCadastrarSemDescricaoRetorna400() {
        OcorrenciaTecnica ocorrencia = createOcorrencia();
        ocorrencia.setDescricao("");

        ResponseEntity<?> response = service.cadastrar(ocorrencia, "2026009");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(repository, never()).save(any(OcorrenciaTecnica.class));
    }

    @Test
    public void testListarDelegaParaRepositorioOrdenado() {
        when(repository.findAllByOrderByDataOcorrenciaDescCriadoEmDesc())
                .thenReturn(List.of(createOcorrencia(), createOcorrencia()));

        List<OcorrenciaTecnica> resultado = service.listar();

        assertEquals(2, resultado.size());
        verify(repository, times(1)).findAllByOrderByDataOcorrenciaDescCriadoEmDesc();
    }

    @Test
    public void testAlternarResolvidoDeFalsoParaVerdadeiro() {
        UUID id = UUID.randomUUID();
        OcorrenciaTecnica ocorrencia = createOcorrencia();
        ocorrencia.setResolvido(false);
        when(repository.findById(id)).thenReturn(Optional.of(ocorrencia));
        when(repository.save(any(OcorrenciaTecnica.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = service.alternarResolvido(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(((OcorrenciaTecnica) response.getBody()).isResolvido());
    }

    @Test
    public void testAlternarResolvidoComIdInexistenteRetorna404() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = service.alternarResolvido(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(repository, never()).save(any(OcorrenciaTecnica.class));
    }
}
