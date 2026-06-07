package br.com.melvin.sistema.domain.amigomelvin.service;

import br.com.melvin.sistema.domain.amigomelvin.dto.SubscriptionRequestDTO;
import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.model.DonorStatus;
import br.com.melvin.sistema.domain.amigomelvin.repository.AmigoMelvinRepository;
import br.com.melvin.sistema.shared.security.BlindIndex;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public @SuppressWarnings("null")
class AmigoMelvinServiceTest {

    @Mock
    private AmigoMelvinRepository repositorio;

    @Mock
    private StripeService stripeService;

    @Mock
    private BlindIndex blindIndex;

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
    public void testProcessarAssinaturaBloqueiaMesmoCpfMesmoValor() throws Exception {
        SubscriptionRequestDTO dto = new SubscriptionRequestDTO(
                "Maria", "maria@email.com", "85999999999", "52998224725", new BigDecimal("50"),
                "tok_visa", "5", "Mensagem", "idem-key-1");

        AmigoMelvin existente = new AmigoMelvin();
        existente.setValorMensal(new BigDecimal("50"));
        existente.setSubscriptionId("sub_123");
        // A query findFirstByCpfHashAndStatusIn só retorna linhas ATIVA/PENDING;
        // o fixture precisa refletir isso para exercer o ramo de bloqueio.
        existente.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash(any())).thenReturn("hash-x");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-x"), any())).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        // Mesmo CPF + mesmo valor: nada de Stripe nem persistência.
        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
        verify(stripeService, never()).updateSubscriptionAmount(any(), any(), any(), any());
        verify(repositorio, never()).save(any(AmigoMelvin.class));
    }

    @Test
    public void testProcessarAssinaturaAtualizaQuandoCpfComOutroValor() throws Exception {
        SubscriptionRequestDTO dto = new SubscriptionRequestDTO(
                "Maria", "maria@email.com", "85999999999", "52998224725", new BigDecimal("50"),
                "tok_visa", "5", "Mensagem", "idem-key-1");

        AmigoMelvin existente = new AmigoMelvin();
        existente.setValorMensal(new BigDecimal("30"));
        existente.setSubscriptionId("sub_123");
        // Assinatura ATIVA em outro valor: deve ATUALIZAR (não criar nova).
        existente.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash(any())).thenReturn("hash-x");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-x"), any())).thenReturn(existente);
        when(repositorio.save(any(AmigoMelvin.class))).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(new BigDecimal("50"), existente.getValorMensal());
        // Atualiza a assinatura existente no Stripe; NÃO cria uma nova.
        verify(stripeService, times(1)).updateSubscriptionAmount(eq("sub_123"), any(), eq(new BigDecimal("50")), any());
        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
        verify(stripeService, never()).createSubscription(any(), any(), any(), any());
    }

    @Test
    public void testProcessarAssinaturaValorMinimo() {
        SubscriptionRequestDTO dto = new SubscriptionRequestDTO(
                "Joao", "joao@email.com", "85988888888", "52998224725", new BigDecimal("10"),
                "tok_visa", "5", "Mensagem", "idem-key-2");

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    public void testProcessarAssinaturaDedupPorEmailQuandoCpfNaoCasa() throws Exception {
        // Cobre o caso em que o CPF não identifica um existente (ex.: cadastro
        // antigo sem CPF): o fallback por e-mail deve bloquear a duplicata.
        SubscriptionRequestDTO dto = new SubscriptionRequestDTO(
                "Maria", "maria@email.com", "85999999999", "52998224725", new BigDecimal("30"),
                "tok_visa", "5", "Mensagem", "idem-key-3");

        AmigoMelvin existente = new AmigoMelvin();
        existente.setValorMensal(new BigDecimal("30"));
        existente.setSubscriptionId("sub_email");
        existente.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash(any())).thenReturn("hash-x");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-x"), any())).thenReturn(null);
        when(repositorio.findFirstByEmailHashAndStatusIn(eq("hash-x"), any())).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
        verify(repositorio, never()).save(any(AmigoMelvin.class));
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
