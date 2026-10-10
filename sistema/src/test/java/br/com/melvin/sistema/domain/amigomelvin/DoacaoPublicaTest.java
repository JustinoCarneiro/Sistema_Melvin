package br.com.melvin.sistema.domain.amigomelvin;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Subscription;

import br.com.melvin.sistema.domain.amigomelvin.service.StripeService;
import br.com.melvin.sistema.shared.service.EmailService;
import br.com.melvin.sistema.support.TestIps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Rotas públicas de doação: validam a entrada antes de falar com o Stripe ou gravar, e respondem só com o que o
 * site precisa (o clientSecret), nunca com o cadastro do doador. Beans reais (H2); Stripe e e-mail simulados.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DoacaoPublicaTest {

    private static final String CPF_VALIDO = "11144477735";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StripeService stripeService;

    @MockBean
    private EmailService emailService;

    @BeforeEach
    void stripeSimulado() throws Exception {
        PaymentIntent intencao = mock(PaymentIntent.class);
        when(intencao.getClientSecret()).thenReturn("pi_unica_secret");
        when(stripeService.createSinglePayment(any(), any())).thenReturn(intencao);

        Customer cliente = mock(Customer.class);
        when(cliente.getId()).thenReturn("cus_publico_1");
        Subscription assinatura = mock(Subscription.class, RETURNS_DEEP_STUBS);
        when(assinatura.getId()).thenReturn("sub_publico_1");
        when(assinatura.getLatestInvoiceObject().getPaymentIntentObject().getClientSecret()).thenReturn("pi_nova_secret");
        when(stripeService.createCustomer(any(), any(), any(), any())).thenReturn(cliente);
        when(stripeService.createSubscription(any(), any(), any(), any())).thenReturn(assinatura);
    }

    private int enviar(String caminho, String corpo) throws Exception {
        return mockMvc.perform(post(caminho).header("X-Real-IP", TestIps.novo())
                .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andReturn().getResponse().getStatus();
    }

    private String assinatura(String nome, String mensagem) {
        return "{\"nome\":\"" + nome + "\",\"email\":\"doador.publico@teste.invalid\",\"contato\":\"85988887777\","
                + "\"cpf\":\"" + CPF_VALIDO + "\",\"valor\":30,\"stripeToken\":\"tok_visa\",\"mensagem\":\"" + mensagem + "\"}";
    }

    // ---- doação única ----

    @Test
    void doacaoUnicaExigeValorDentroDoLimite() throws Exception {
        assertThat(enviar("/amigomelvin/one-time", "{}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/one-time", "{\"valor\":0}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/one-time", "{\"valor\":-5}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/one-time", "{\"valor\":0.5}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/one-time", "{\"valor\":1000000}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/one-time", "{\"valor\":10.999}")).isEqualTo(400);

        verify(stripeService, never()).createSinglePayment(any(), any());
    }

    @Test
    void doacaoUnicaValidaDevolveSoOClientSecret() throws Exception {
        String corpo = mockMvc.perform(post("/amigomelvin/one-time").header("X-Real-IP", TestIps.novo())
                .contentType(MediaType.APPLICATION_JSON).content("{\"valor\":50}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertThat(corpo).isEqualTo("pi_unica_secret");
    }

    // ---- doação de itens ----

    @Test
    void doacaoDeItensExigeNomeTelefoneETipo() throws Exception {
        assertThat(enviar("/amigomelvin/items", "{}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/items", "{\"nome\":\"Ana\",\"tipoItem\":\"Roupas\"}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/items", "{\"nome\":\"Ana\",\"telefone\":\"85900001111\"}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/items", "{\"nome\":\"  \",\"telefone\":\"85900001111\",\"tipoItem\":\"Roupas\"}")).isEqualTo(400);
        assertThat(enviar("/amigomelvin/items",
                "{\"nome\":\"Ana\",\"telefone\":\"85900001111\",\"tipoItem\":\"Roupas\",\"observacao\":\"" + "x".repeat(501) + "\"}"))
                .isEqualTo(400);
    }

    @Test
    void doacaoDeItensValidaEhRegistrada() throws Exception {
        assertThat(enviar("/amigomelvin/items",
                "{\"nome\":\"Ana Oliveira\",\"telefone\":\"85900001111\",\"tipoItem\":\"Roupas infantis\",\"observacao\":\"Tamanhos 4 a 8\"}"))
                .isEqualTo(201);
    }

    // ---- assinatura mensal ----

    @Test
    void assinaturaRecusaCamposAbsurdosAntesDeChamarOStripe() throws Exception {
        assertThat(enviar("/amigomelvin/subscribe", assinatura("x".repeat(121), "oi"))).isEqualTo(400);
        assertThat(enviar("/amigomelvin/subscribe", assinatura("Doador", "m".repeat(501)))).isEqualTo(400);

        verify(stripeService, never()).createCustomer(any(), any(), any(), any());
    }

    @Test
    void assinaturaNovaRespondeSoComOClientSecretSemDadosDoDoador() throws Exception {
        String corpo = mockMvc.perform(post("/amigomelvin/subscribe").header("X-Real-IP", TestIps.novo())
                .contentType(MediaType.APPLICATION_JSON).content(assinatura("Doador Publico", "Apoio de coração")))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertThat(corpo).contains("\"clientSecret\":\"pi_nova_secret\"").contains("\"atualizada\":false");
        assertThat(corpo)
                .doesNotContain(CPF_VALIDO)
                .doesNotContain("111.444.777-35")
                .doesNotContain("doador.publico@teste.invalid")
                .doesNotContain("85988887777")
                .doesNotContain("cus_publico_1")
                .doesNotContain("sub_publico_1")
                .doesNotContain("stripeCustomerId")
                .doesNotContain("subscriptionId");
    }
}
