package br.com.melvin.sistema.shared.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;

    @Async
    @SuppressWarnings("null")
    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("contato@institutomelvin.org", "Instituto Social Melvin");
            helper.setTo(to);
            helper.setSubject(subject);

            // Transforma as quebras de linha em <br> para manter a formatação no HTML
            String formattedText = text.replace("\n", "<br>");

            // Template HTML elegante com as cores do Melvin
            String htmlTemplate = "<!DOCTYPE html>" +
                "<html><head><meta charset=\"utf-8\">" +
                "<style>" +
                "  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }" +
                "  .wrapper { padding: 40px 20px; width: 100%; background-color: #f4f7f6; }" +
                "  .container { max-width: 600px; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); margin: 0 auto; border-top: 8px solid #044D8C; }" +
                "  .header { padding: 40px 20px 20px; text-align: center; }" +
                "  .header h1 { color: #044D8C; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }" +
                "  .header p { color: #7EA629; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-top: 8px; }" +
                "  .content { padding: 20px 45px 30px; line-height: 1.8; font-size: 16px; color: #444444; }" +
                "  .content p { margin-bottom: 20px; }" +
                "  .instagram-box { background-color: #fff9f0; padding: 30px 40px; text-align: center; border-top: 2px dashed #f2e2c4; border-bottom: 2px dashed #f2e2c4; margin: 10px 0; }" +
                "  .instagram-box p { color: #666666; margin: 0 0 15px 0; font-size: 15px; font-weight: 500; }" +
                "  .insta-btn { display: inline-block; padding: 12px 30px; background-color: #044D8C; color: #ffffff !important; text-decoration: none; border-radius: 30px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(4, 77, 140, 0.3); transition: background-color 0.3s; }" +
                "  .footer { background-color: #ffffff; padding: 30px 40px 40px; text-align: center; font-size: 13px; color: #888888; }" +
                "  .footer a { color: #044D8C; text-decoration: none; font-weight: bold; }" +
                "</style></head><body>" +
                "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"wrapper\"><tr><td align=\"center\">" +
                "  <div class=\"container\">" +
                "    <div class=\"header\">" +
                "      <h1>Instituto Melvin</h1>" +
                "      <p>Transformando histórias com amor</p>" +
                "    </div>" +
                "    <div class=\"content\">" +
                "      " + formattedText +
                "    </div>" +
                "    <div class=\"instagram-box\">" +
                "      <p>Para acompanhar a diferença que você está fazendo, siga nosso Instagram:</p>" +
                "      <a href=\"https://instagram.com/instituto_melvin\" class=\"insta-btn\">@instituto_melvin</a>" +
                "    </div>" +
                "    <div class=\"footer\">" +
                "      <p>Feito com amor em Fortaleza.<br><br>" +
                "      <a href=\"https://institutomelvin.org\">institutomelvin.org</a></p>" +
                "    </div>" +
                "  </div>" +
                "</td></tr></table>" +
                "</body></html>";

            helper.setText(htmlTemplate, true);
            
            emailSender.send(message);
            log.info("E-mail HTML enviado com sucesso para: {}", to);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail para: {}", to, e);
        }
    }
}
