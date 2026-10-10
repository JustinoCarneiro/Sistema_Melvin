package br.com.melvin.sistema.domain.amigomelvin.service;

import br.com.melvin.sistema.domain.amigomelvin.dto.AssinaturaRespostaDTO;
import br.com.melvin.sistema.domain.amigomelvin.dto.SubscriptionRequestDTO;
import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.model.DonorStatus;
import br.com.melvin.sistema.domain.amigomelvin.repository.AmigoMelvinRepository;
import br.com.melvin.sistema.shared.security.BlindIndex;
import br.com.melvin.sistema.shared.service.EmailService;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

    @Mock
    private EmailService emailService;

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
        // Alterar uma assinatura exige CPF E e-mail do mesmo cadastro (o mock devolve o mesmo hash para ambos).
        existente.setCpfHash("hash-x");
        existente.setEmailHash("hash-x");
        // Assinatura ATIVA em outro valor: deve ATUALIZAR (não criar nova).
        existente.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash(any())).thenReturn("hash-x");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-x"), any())).thenReturn(existente);
        when(repositorio.save(any(AmigoMelvin.class))).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(new BigDecimal("50"), existente.getValorMensal());
        // A resposta é pública: não devolve o cadastro (CPF, telefone, e-mail, ids do Stripe).
        assertTrue(response.getBody() instanceof AssinaturaRespostaDTO);
        assertTrue(((AssinaturaRespostaDTO) response.getBody()).atualizada());
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
    public void testProcessarAssinaturaCancelaSubscriptionOrfaSeConstraintFalha() throws Exception {
        // Corrida: o banco rejeita o insert pela constraint única de CPF DEPOIS
        // que o Stripe já criou a assinatura. A app deve cancelar a subscription
        // órfã no Stripe e retornar 409.
        SubscriptionRequestDTO dto = new SubscriptionRequestDTO(
                "Joao", "joao@email.com", "85988888888", "52998224725", new BigDecimal("30"),
                "tok_visa", "5", "Mensagem", "idem-key-4");

        when(blindIndex.hash(any())).thenReturn("hash-novo");
        when(repositorio.findFirstByCpfHashAndStatusIn(any(), any())).thenReturn(null);
        when(repositorio.findFirstByEmailHashAndStatusIn(any(), any())).thenReturn(null);

        com.stripe.model.Customer customer = mock(com.stripe.model.Customer.class);
        when(customer.getId()).thenReturn("cus_x");
        com.stripe.model.Subscription sub = mock(com.stripe.model.Subscription.class);
        when(sub.getId()).thenReturn("sub_orfa");
        when(stripeService.createCustomer(any(), any(), any(), any())).thenReturn(customer);
        when(stripeService.createSubscription(any(), any(), any(), any())).thenReturn(sub);

        when(repositorio.save(any(AmigoMelvin.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("dup"));

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dto);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(stripeService, times(1)).cancelSubscription("sub_orfa");
    }

    // ---- alterar ou substituir uma assinatura exige provar o cadastro: CPF E e-mail ----

    private SubscriptionRequestDTO dtoPadrao(String valor) {
        return new SubscriptionRequestDTO(
                "Maria", "maria@email.com", "85999999999", "52998224725", new BigDecimal(valor),
                "tok_visa", "5", "Mensagem", "idem-key-x");
    }

    @Test
    public void testProcessarAssinaturaMesmoCpfComOutroEmailNaoAlteraNada() throws Exception {
        // Quem só sabe o CPF de um doador não pode mexer na assinatura dele.
        AmigoMelvin existente = new AmigoMelvin();
        existente.setValorMensal(new BigDecimal("30"));
        existente.setSubscriptionId("sub_alvo");
        existente.setCpfHash("hash-cpf");
        existente.setEmailHash("hash-email-do-dono");
        existente.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash("52998224725")).thenReturn("hash-cpf");
        when(blindIndex.hash("maria@email.com")).thenReturn("hash-email-de-outra-pessoa");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-cpf"), any())).thenReturn(existente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dtoPadrao("900"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(new BigDecimal("30"), existente.getValorMensal());
        verify(stripeService, never()).updateSubscriptionAmount(any(), any(), any(), any());
        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
        verify(repositorio, never()).save(any(AmigoMelvin.class));
    }

    @Test
    public void testProcessarAssinaturaPendenteComOutroEmailNaoECancelada() throws Exception {
        // Substituir um cadastro PENDING cancela o anterior: também só vale com CPF e e-mail do mesmo cadastro.
        AmigoMelvin pendente = new AmigoMelvin();
        pendente.setSubscriptionId("sub_pendente");
        pendente.setCpfHash("hash-cpf");
        pendente.setEmailHash("hash-email-do-dono");
        pendente.setStatus(DonorStatus.PENDING);

        when(blindIndex.hash("52998224725")).thenReturn("hash-cpf");
        when(blindIndex.hash("maria@email.com")).thenReturn("hash-email-de-outra-pessoa");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-cpf"), any())).thenReturn(pendente);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dtoPadrao("30"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(DonorStatus.PENDING, pendente.getStatus());
        verify(stripeService, never()).cancelSubscription(any());
        verify(repositorio, never()).save(any(AmigoMelvin.class));
    }

    @Test
    public void testProcessarAssinaturaDeOutraPessoaComMesmoEmailCriaDoadorProprio() throws Exception {
        // Um casal pode usar o mesmo e-mail: o cadastro existente tem CPF diferente, então não é a mesma pessoa.
        AmigoMelvin doConjuge = new AmigoMelvin();
        doConjuge.setSubscriptionId("sub_conjuge");
        doConjuge.setCpfHash("hash-cpf-do-conjuge");
        doConjuge.setEmailHash("hash-email");
        doConjuge.setValorMensal(new BigDecimal("30"));
        doConjuge.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash("52998224725")).thenReturn("hash-cpf-proprio");
        when(blindIndex.hash("maria@email.com")).thenReturn("hash-email");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-cpf-proprio"), any())).thenReturn(null);
        when(repositorio.findFirstByEmailHashAndStatusIn(eq("hash-email"), any())).thenReturn(doConjuge);

        com.stripe.model.Customer customer = mock(com.stripe.model.Customer.class);
        when(customer.getId()).thenReturn("cus_novo");
        com.stripe.model.Subscription sub = mock(com.stripe.model.Subscription.class, RETURNS_DEEP_STUBS);
        when(sub.getId()).thenReturn("sub_novo");
        when(sub.getLatestInvoiceObject().getPaymentIntentObject().getClientSecret()).thenReturn("pi_novo_secret_x");
        when(stripeService.createCustomer(any(), any(), any(), any())).thenReturn(customer);
        when(stripeService.createSubscription(any(), any(), any(), any())).thenReturn(sub);
        when(repositorio.save(any(AmigoMelvin.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dtoPadrao("30"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(stripeService, times(1)).createCustomer(any(), any(), any(), any());
        verify(stripeService, never()).updateSubscriptionAmount(any(), any(), any(), any());
        assertEquals(DonorStatus.ACTIVE, doConjuge.getStatus());
        assertEquals(new BigDecimal("30"), doConjuge.getValorMensal());
    }

    @Test
    public void testProcessarAssinaturaNovaDevolveSoOClientSecret() throws Exception {
        when(blindIndex.hash(any())).thenReturn("hash-novo");
        when(repositorio.findFirstByCpfHashAndStatusIn(any(), any())).thenReturn(null);
        when(repositorio.findFirstByEmailHashAndStatusIn(any(), any())).thenReturn(null);

        com.stripe.model.Customer customer = mock(com.stripe.model.Customer.class);
        when(customer.getId()).thenReturn("cus_x");
        com.stripe.model.Subscription sub = mock(com.stripe.model.Subscription.class, RETURNS_DEEP_STUBS);
        when(sub.getId()).thenReturn("sub_x");
        when(sub.getLatestInvoiceObject().getPaymentIntentObject().getClientSecret()).thenReturn("pi_secret_abc");
        when(stripeService.createCustomer(any(), any(), any(), any())).thenReturn(customer);
        when(stripeService.createSubscription(any(), any(), any(), any())).thenReturn(sub);
        when(repositorio.save(any(AmigoMelvin.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dtoPadrao("30"));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody() instanceof AssinaturaRespostaDTO);
        AssinaturaRespostaDTO corpo = (AssinaturaRespostaDTO) response.getBody();
        assertEquals("pi_secret_abc", corpo.clientSecret());
        assertFalse(corpo.atualizada());
    }

    @Test
    public void testProcessarAssinaturaDeCadastroAntigoSemCpfAindaDeduplicaPorEmail() throws Exception {
        // Cadastros anteriores à exigência de CPF não têm cpfHash: o e-mail continua sendo a identidade deles.
        AmigoMelvin antigo = new AmigoMelvin();
        antigo.setValorMensal(new BigDecimal("30"));
        antigo.setSubscriptionId("sub_antigo");
        antigo.setEmailHash("hash-email");
        antigo.setStatus(DonorStatus.ACTIVE);

        when(blindIndex.hash("52998224725")).thenReturn("hash-cpf");
        when(blindIndex.hash("maria@email.com")).thenReturn("hash-email");
        when(repositorio.findFirstByCpfHashAndStatusIn(eq("hash-cpf"), any())).thenReturn(null);
        when(repositorio.findFirstByEmailHashAndStatusIn(eq("hash-email"), any())).thenReturn(antigo);

        ResponseEntity<?> response = amigoMelvinService.processarAssinatura(dtoPadrao("30"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
    }

    @Test
    public void testAdicionarManualNaoPodeEscolherOId() {
        AmigoMelvin amigo = new AmigoMelvin();
        amigo.setId(UUID.randomUUID());
        amigo.setNome("Amigo Manual");
        when(repositorio.save(any(AmigoMelvin.class))).thenAnswer(inv -> inv.getArgument(0));

        amigoMelvinService.adicionar(amigo);

        org.mockito.ArgumentCaptor<AmigoMelvin> salvo = org.mockito.ArgumentCaptor.forClass(AmigoMelvin.class);
        verify(repositorio).save(salvo.capture());
        assertNull(salvo.getValue().getId());
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
