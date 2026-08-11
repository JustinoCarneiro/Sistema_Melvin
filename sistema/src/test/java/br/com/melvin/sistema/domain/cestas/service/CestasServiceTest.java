package br.com.melvin.sistema.domain.cestas.service;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.NivelHierarquico;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;
import br.com.melvin.sistema.domain.cestas.repository.CestasRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
public class CestasServiceTest {

    @Mock
    private CestasRepository repositorio;

    @Mock
    private EmailService emailService;

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

    // ============ US-7.4: Solicitação de Cesta ============

    private Cestas createSolicitacao() {
        Cestas c = new Cestas();
        c.setNomeSolicitante("Maria Líder");
        c.setNome("José Beneficiário");
        c.setNivelSolicitante(NivelHierarquico.SETOR);
        c.setLider_celula("João da Célula 3");
        c.setRede("Rede Norte");
        return c;
    }

    @Test
    public void testSolicitarComDadosValidosCriaComStatusSolicitada() {
        Cestas solicitacao = createSolicitacao();
        when(repositorio.save(any(Cestas.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = cestasService.solicitar(solicitacao);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ArgumentCaptor<Cestas> captor = ArgumentCaptor.forClass(Cestas.class);
        verify(repositorio, times(1)).save(captor.capture());
        assertEquals(StatusCesta.SOLICITADA, captor.getValue().getStatus());
        assertNull(captor.getValue().getId());
        assertNull(captor.getValue().getQrCodeToken());
    }

    @Test
    public void testSolicitarNotificaCoordenacao() {
        // Critério de aceite da US-7.4: "a solicitação é criada com status
        // SOLICITADA E A COORDENAÇÃO É NOTIFICADA". Sem isso o pedido entra no
        // sistema e ninguém fica sabendo — a coordenação teria que ficar abrindo
        // a tela pra conferir, o que derrota o propósito do fluxo.
        Cestas solicitacao = createSolicitacao();
        when(repositorio.save(any(Cestas.class))).thenAnswer(invocation -> invocation.getArgument(0));

        cestasService.solicitar(solicitacao);

        verify(emailService, times(1)).notifyInstituto(anyString(), anyString());
    }

    @Test
    public void testSolicitacaoInvalidaNaoNotificaCoordenacao() {
        Cestas solicitacao = createSolicitacao();
        solicitacao.setNomeSolicitante(null);

        cestasService.solicitar(solicitacao);

        verify(emailService, never()).notifyInstituto(anyString(), anyString());
    }

    @Test
    public void testSolicitarSemNomeSolicitanteRetorna400() {
        Cestas solicitacao = createSolicitacao();
        solicitacao.setNomeSolicitante(null);

        ResponseEntity<?> response = cestasService.solicitar(solicitacao);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(repositorio, never()).save(any(Cestas.class));
    }

    @Test
    public void testSolicitarSemNomeDoBeneficiarioRetorna400() {
        // `nome` é NOT NULL no banco (herdado do cadastro direto): sem essa
        // validação o insert estoura 500 em vez de devolver erro tratado.
        Cestas solicitacao = createSolicitacao();
        solicitacao.setNome(null);

        ResponseEntity<?> response = cestasService.solicitar(solicitacao);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(repositorio, never()).save(any(Cestas.class));
    }

    @Test
    public void testSolicitarSemNivelHierarquicoRetorna400() {
        Cestas solicitacao = createSolicitacao();
        solicitacao.setNivelSolicitante(null);

        ResponseEntity<?> response = cestasService.solicitar(solicitacao);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(repositorio, never()).save(any(Cestas.class));
    }

    @Test
    public void testSolicitarIgnoraCamposDeFluxoInternoEnviadosNoPayload() {
        // Requisitante mal-intencionado (ou bug de frontend) não deve conseguir
        // criar uma solicitação já ENTREGUE/com token só preenchendo o payload.
        Cestas solicitacao = createSolicitacao();
        solicitacao.setStatus(StatusCesta.ENTREGUE);
        solicitacao.setQrCodeToken("token-forjado");
        solicitacao.setEntregueEm(LocalDateTime.now());
        when(repositorio.save(any(Cestas.class))).thenAnswer(invocation -> invocation.getArgument(0));

        cestasService.solicitar(solicitacao);

        ArgumentCaptor<Cestas> captor = ArgumentCaptor.forClass(Cestas.class);
        verify(repositorio).save(captor.capture());
        assertEquals(StatusCesta.SOLICITADA, captor.getValue().getStatus());
        assertNull(captor.getValue().getQrCodeToken());
        assertNull(captor.getValue().getEntregueEm());
    }

    @Test
    public void testListarSolicitacoesDelegaParaRepositorioFiltrandoPorStatus() {
        when(repositorio.findAllByStatus(StatusCesta.SOLICITADA)).thenReturn(List.of(new Cestas()));

        List<Cestas> resultado = cestasService.listarSolicitacoes();

        assertEquals(1, resultado.size());
        verify(repositorio, times(1)).findAllByStatus(StatusCesta.SOLICITADA);
    }

    @Test
    public void testValidarSolicitacaoPendenteGeraTokenEAgenda() {
        UUID id = UUID.randomUUID();
        Cestas existente = createSolicitacao();
        existente.setId(id);
        existente.setStatus(StatusCesta.SOLICITADA);
        LocalDate dataRetirada = LocalDate.now().plusDays(3);

        when(repositorio.findById(id)).thenReturn(Optional.of(existente));
        when(repositorio.save(any(Cestas.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = cestasService.validar(id, dataRetirada);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Cestas resultado = (Cestas) response.getBody();
        assertEquals(StatusCesta.AGENDADA, resultado.getStatus());
        assertEquals(dataRetirada, resultado.getDataRetirada());
        assertNotNull(resultado.getQrCodeToken());
    }

    @Test
    public void testValidarSolicitacaoInexistenteRetorna404() {
        UUID id = UUID.randomUUID();
        when(repositorio.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = cestasService.validar(id, LocalDate.now());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    public void testValidarSolicitacaoJaAgendadaRetorna409() {
        UUID id = UUID.randomUUID();
        Cestas existente = createSolicitacao();
        existente.setId(id);
        existente.setStatus(StatusCesta.AGENDADA);

        when(repositorio.findById(id)).thenReturn(Optional.of(existente));

        ResponseEntity<?> response = cestasService.validar(id, LocalDate.now());

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(repositorio, never()).save(any(Cestas.class));
    }

    @Test
    public void testCheckinComTokenAgendadoMarcaEntregue() {
        Cestas existente = createSolicitacao();
        existente.setStatus(StatusCesta.AGENDADA);
        existente.setQrCodeToken("token-valido");

        when(repositorio.findByQrCodeToken("token-valido")).thenReturn(existente);
        when(repositorio.save(any(Cestas.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = cestasService.checkin("token-valido");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Cestas resultado = (Cestas) response.getBody();
        assertEquals(StatusCesta.ENTREGUE, resultado.getStatus());
        assertNotNull(resultado.getEntregueEm());
    }

    @Test
    public void testCheckinComTokenInexistenteRetorna404() {
        when(repositorio.findByQrCodeToken("token-invalido")).thenReturn(null);

        ResponseEntity<?> response = cestasService.checkin("token-invalido");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    public void testCheckinComTokenJaEntregueRetorna409ENaoAlteraEntregueEm() {
        LocalDateTime entregueOriginal = LocalDateTime.now().minusDays(1);
        Cestas existente = createSolicitacao();
        existente.setStatus(StatusCesta.ENTREGUE);
        existente.setQrCodeToken("token-usado");
        existente.setEntregueEm(entregueOriginal);

        when(repositorio.findByQrCodeToken("token-usado")).thenReturn(existente);

        ResponseEntity<?> response = cestasService.checkin("token-usado");

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(entregueOriginal, existente.getEntregueEm());
        verify(repositorio, never()).save(any(Cestas.class));
    }
}
