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
                "  .wrapper { padding: 40px 20px; width: 100%; background-color: #f4f7f6; display: flex; justify-content: center; }" +
                "  .container { max-width: 600px; width: 100%; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); margin: 0 auto; }" +
                "  .header { background-color: #F29F05; padding: 35px 20px; text-align: center; border-bottom: 4px solid #d98d04; }" +
                "  .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }" +
                "  .content { padding: 45px 40px; line-height: 1.7; font-size: 16px; color: #444444; }" +
                "  .content p { margin-bottom: 20px; }" +
                "  .footer { background-color: #fcfcfc; padding: 25px 40px; text-align: center; font-size: 14px; color: #888888; border-top: 1px solid #eeeeee; }" +
                "  .footer a { color: #F29F05; text-decoration: none; font-weight: bold; }" +
                "  .btn { display: inline-block; padding: 12px 28px; background-color: #F29F05; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 6px rgba(242, 159, 5, 0.25); }" +
                "</style></head><body>" +
                "<div class=\"wrapper\">" +
                "  <div class=\"container\">" +
                "    <div class=\"header\">" +
                "      <h1>Instituto Melvin</h1>" +
                "    </div>" +
                "    <div class=\"content\">" +
                "      " + formattedText +
                "    </div>" +
                "    <div class=\"footer\">" +
                "      <p>Obrigado por apoiar nossa causa!<br>" +
                "      <a href=\"https://institutomelvin.org\">institutomelvin.org</a></p>" +
                "    </div>" +
                "  </div>" +
                "</div>" +
                "</body></html>";

            helper.setText(htmlTemplate, true);
            
            emailSender.send(message);
            log.info("E-mail HTML enviado com sucesso para: {}", to);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail para: {}", to, e);
        }
    }
}
