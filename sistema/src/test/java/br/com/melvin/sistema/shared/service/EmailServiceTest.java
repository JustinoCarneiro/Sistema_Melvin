package br.com.melvin.sistema.shared.service;

import java.util.Properties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * O texto das mensagens leva dados digitados por visitantes (nome, observações), e o e-mail sai do
 * remetente real do Instituto. O corpo é texto puro: nada do que o visitante digitou pode virar HTML
 * na caixa de quem recebe, e o assunto não pode carregar quebra de linha (injeção de cabeçalho).
 */
class EmailServiceTest {

    private JavaMailSender sender;
    private EmailService service;

    @BeforeEach
    void setUp() {
        sender = mock(JavaMailSender.class);
        when(sender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        service = new EmailService(sender);
    }

    private MimeMessage enviado() throws Exception {
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMessage mensagem = captor.getValue();
        // Os cabeçalhos de tipo das partes só existem depois de saveChanges(), que o envio real faz.
        mensagem.saveChanges();
        return mensagem;
    }

    private String html(Part parte) throws Exception {
        Object conteudo = parte.getContent();
        if (conteudo instanceof Multipart multipart) {
            StringBuilder acumulado = new StringBuilder();
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart filho = multipart.getBodyPart(i);
                acumulado.append(html(filho));
            }
            return acumulado.toString();
        }
        return parte.isMimeType("text/html") ? conteudo.toString() : "";
    }

    @Test
    void htmlDigitadoPeloVisitanteNaoViraHtmlNoEmail() throws Exception {
        service.sendEmail("destino@teste.invalid", "Assunto",
                "Olá <a href=\"https://golpe.example/entrar\">confirme sua conta aqui</a> <script>x()</script> & cia");

        String corpo = html(enviado());

        assertThat(corpo).doesNotContain("<a href=\"https://golpe");
        assertThat(corpo).doesNotContain("<script>");
        assertThat(corpo).contains("&lt;a href=&quot;https://golpe.example/entrar&quot;&gt;");
        assertThat(corpo).contains("&lt;script&gt;x()&lt;/script&gt;");
        assertThat(corpo).contains("&amp; cia");
    }

    @Test
    void mantemQuebrasDeLinhaEAcentuacao() throws Exception {
        service.sendEmail("destino@teste.invalid", "Assunto", "Olá, João — obrigado!\nAté logo.");

        String corpo = html(enviado());

        assertThat(corpo).contains("Olá, João — obrigado!<br>Até logo.");
    }

    @Test
    void assuntoNaoAceitaQuebraDeLinhaNemInjetaCabecalho() throws Exception {
        service.sendEmail("destino@teste.invalid", "Novo cadastro: Fulano\r\nBcc: alvo@teste.invalid", "texto");

        MimeMessage mensagem = enviado();

        assertThat(mensagem.getHeader("Bcc")).isNull();
        assertThat(mensagem.getSubject()).doesNotContain("\r").doesNotContain("\n");
        assertThat(mensagem.getSubject()).startsWith("Novo cadastro: Fulano");
    }

    @Test
    void destinatarioComQuebraDeLinhaNaoEnviaNada() throws Exception {
        service.sendEmail("destino@teste.invalid\r\nBcc: alvo@teste.invalid", "Assunto", "texto");

        org.mockito.Mockito.verify(sender, org.mockito.Mockito.never()).send(any(MimeMessage.class));
    }
}
