package br.com.melvin.sistema.domain.embaixador;

import br.com.melvin.sistema.support.TestIps;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import br.com.melvin.sistema.domain.embaixador.repository.EmbaixadorRepository;
import br.com.melvin.sistema.shared.service.EmailService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * O cadastro de embaixador é público: qualquer visitante manda o corpo da requisição. O corpo não pode
 * escolher o id (sobrescrever um embaixador que já existe, cujo id é público na lista do site), nem o status
 * de aprovação, e precisa ser validado antes de gravar e de mandar e-mail.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CadastroPublicoDeEmbaixadorTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmbaixadorRepository repositorio;

    @MockBean
    private EmailService emailService;

    private Embaixador existente;

    @BeforeEach
    void cadastroExistente() {
        existente = repositorio.findByNome("Embaixadora Aprovada");
        if (existente == null) {
            Embaixador e = new Embaixador();
            e.setNome("Embaixadora Aprovada");
            e.setContato("85911112222");
            e.setEmail("aprovada@teste.invalid");
            e.setInstagram("@aprovada");
            e.setStatus(true);
            e.setContatado(true);
            e.setDescricao("Já aprovada e publicada no site");
            existente = repositorio.save(e);
        }
    }

    private int enviar(String corpo) throws Exception {
        return mockMvc.perform(post("/embaixador").header("X-Real-IP", TestIps.novo()).contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andReturn().getResponse().getStatus();
    }

    @Test
    void cadastroValidoEntraComoNaoAprovadoENotificaOInstituto() throws Exception {
        long antes = repositorio.count();

        mockMvc.perform(post("/embaixador").header("X-Real-IP", TestIps.novo()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Candidata Nova\",\"contato\":\"85900001111\",\"email\":\"candidata@teste.invalid\",\"instagram\":\"@candidata\"}"))
                .andExpect(status().isCreated());

        assertThat(repositorio.count()).isEqualTo(antes + 1);
        Embaixador salva = repositorio.findByNome("Candidata Nova");
        assertThat(salva.getStatus()).isFalse();
        assertThat(salva.getContatado()).isFalse();
        verify(emailService, times(1)).sendEmail(eq("candidata@teste.invalid"), any(), any());
        verify(emailService, times(1)).notifyInstituto(any(), any());
    }

    @Test
    void corpoNaoPodeEscolherOIdNemAprovarASiMesmo() throws Exception {
        long antes = repositorio.count();
        UUID idDoExistente = existente.getId();

        // O atacante manda o id de quem já existe, com status aprovado e outro contato.
        int resposta = enviar("{\"id\":\"" + idDoExistente + "\",\"nome\":\"Nome Trocado\",\"contato\":\"85999990000\","
                + "\"email\":\"invasor@teste.invalid\",\"status\":true,\"contatado\":true,\"descricao\":\"texto do invasor\"}");

        assertThat(resposta).isEqualTo(201);
        assertThat(repositorio.count()).as("cria um cadastro novo em vez de sobrescrever").isEqualTo(antes + 1);

        Embaixador intacto = repositorio.findById(idDoExistente).orElseThrow();
        assertThat(intacto.getNome()).isEqualTo("Embaixadora Aprovada");
        assertThat(intacto.getContato()).isEqualTo("85911112222");
        assertThat(intacto.getEmail()).isEqualTo("aprovada@teste.invalid");
        assertThat(intacto.getStatus()).isTrue();

        Embaixador novo = repositorio.findByNome("Nome Trocado");
        assertThat(novo.getId()).isNotEqualTo(idDoExistente);
        assertThat(novo.getStatus()).as("o cadastro novo nunca nasce aprovado").isFalse();
        assertThat(novo.getDescricao()).as("a descrição só a administração define").isNull();
    }

    @Test
    void camposObrigatoriosEFormatoDoEmailSaoValidados() throws Exception {
        assertThat(enviar("{}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Sem Contato\",\"email\":\"sem.contato@teste.invalid\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Sem Email\",\"contato\":\"85900001111\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Email Ruim\",\"contato\":\"85900001111\",\"email\":\"isto-nao-e-email\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"   \",\"contato\":\"85900001111\",\"email\":\"a@teste.invalid\"}")).isEqualTo(400);

        verify(emailService, never()).sendEmail(any(), any(), any());
        verify(emailService, never()).notifyInstituto(any(), any());
    }

    @Test
    void tamanhosAbsurdosSaoRecusados() throws Exception {
        String longo = "x".repeat(500);

        assertThat(enviar("{\"nome\":\"" + longo + "\",\"contato\":\"85900001111\",\"email\":\"a@teste.invalid\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Fulano\",\"contato\":\"" + longo + "\",\"email\":\"a@teste.invalid\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Fulano\",\"contato\":\"85900001111\",\"email\":\"a@teste.invalid\",\"instagram\":\"" + longo + "\"}")).isEqualTo(400);
        assertThat(enviar("{\"nome\":\"Fulano\",\"contato\":\"85900001111\",\"email\":\"" + longo + "@teste.invalid\"}")).isEqualTo(400);
    }

    @Test
    void respostaNaoDevolveOCadastroInteiro() throws Exception {
        String corpo = mockMvc.perform(post("/embaixador").header("X-Real-IP", TestIps.novo()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nome\":\"Resposta Enxuta\",\"contato\":\"85900002222\",\"email\":\"enxuta@teste.invalid\"}"))
                .andReturn().getResponse().getContentAsString();

        assertThat(corpo).doesNotContain("85900002222").doesNotContain("enxuta@teste.invalid").doesNotContain("\"id\"");
    }
}
