package br.com.melvin.sistema.shared.security;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import br.com.melvin.sistema.shared.security.UploadSeguro.Arquivo;
import br.com.melvin.sistema.shared.security.UploadSeguro.Tipo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * O arquivo enviado é entrada do usuário. Quem decide o que ele é são os primeiros bytes (não o nome nem o tipo
 * que o navegador declara), e o nome que vai para o disco e para o cabeçalho de download nunca é o do cliente.
 */
class UploadSeguroTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F', 0, 1, 1, 0, 0, 1};
    private static final byte[] GIF = "GIF89a\u0001\u0000\u0001\u0000".getBytes(StandardCharsets.ISO_8859_1);
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0x10, 0, 0, 0, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' '};
    private static final byte[] AVIF = {0, 0, 0, 0x1C, 'f', 't', 'y', 'p', 'a', 'v', 'i', 'f', 0, 0, 0, 0};
    private static final byte[] PDF = "%PDF-1.7\n%âãÏÓ\n".getBytes(StandardCharsets.ISO_8859_1);
    private static final byte[] ZIP = {'P', 'K', 3, 4, 0x14, 0, 6, 0, 8, 0, 0, 0, 0x21, 0, 0, 0};
    private static final byte[] OLE = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1, 0, 0, 0, 0, 0, 0, 0, 0};
    private static final byte[] HTML = "<html><script>alert(document.cookie)</script></html>".getBytes(StandardCharsets.UTF_8);
    private static final byte[] SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\"/>".getBytes(StandardCharsets.UTF_8);

    private MockMultipartFile arquivo(String nome, byte[] conteudo) {
        return new MockMultipartFile("file", nome, "application/octet-stream", conteudo);
    }

    // ---- imagens ----

    @Test
    void aceitaOsFormatosDeImagemDoSistemaPeloConteudo() throws Exception {
        assertThat(UploadSeguro.validar(arquivo("foto.png", PNG), Tipo.IMAGEM).mime()).isEqualTo("image/png");
        assertThat(UploadSeguro.validar(arquivo("foto.jpg", JPEG), Tipo.IMAGEM).mime()).isEqualTo("image/jpeg");
        assertThat(UploadSeguro.validar(arquivo("foto.jpeg", JPEG), Tipo.IMAGEM).extensao()).isEqualTo("jpg");
        assertThat(UploadSeguro.validar(arquivo("foto.gif", GIF), Tipo.IMAGEM).mime()).isEqualTo("image/gif");
        assertThat(UploadSeguro.validar(arquivo("foto.webp", WEBP), Tipo.IMAGEM).mime()).isEqualTo("image/webp");
        // O Instituto já usa avif nos avisos.
        assertThat(UploadSeguro.validar(arquivo("aviso.avif", AVIF), Tipo.IMAGEM).mime()).isEqualTo("image/avif");
    }

    @Test
    void extensaoEmMaiusculasEhAceita() throws Exception {
        Arquivo validado = UploadSeguro.validar(arquivo("FOTO.PNG", PNG), Tipo.IMAGEM);

        assertThat(validado.extensao()).isEqualTo("png");
        assertThat(validado.nomeParaExibir()).isEqualTo("FOTO.png");
    }

    @Test
    void recusaHtmlEsvgDisfarcadosDeImagem() {
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.png", HTML), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.svg", SVG), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.png", SVG), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
    }

    @Test
    void recusaExtensoesExecutaveisOuDeMarcacaoMesmoComConteudoDeImagem() {
        for (String nome : new String[] {"x.html", "x.htm", "x.svg", "x.js", "x.jsp", "x.php", "x.exe", "x.sh", "x.xml", "x.png.html"}) {
            assertThatThrownBy(() -> UploadSeguro.validar(arquivo(nome, PNG), Tipo.IMAGEM))
                    .as(nome).isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        }
    }

    @Test
    void recusaImagemCujoConteudoNaoBateComAExtensao() {
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.png", JPEG), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.jpg", PDF), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
    }

    @Test
    void recusaSemExtensaoOuVazio() {
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("semextensao", PNG), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("foto.png", new byte[0]), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo(null, PNG), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
    }

    // ---- documentos (diário) ----

    @Test
    void aceitaOsDocumentosDoDiarioPeloConteudo() throws Exception {
        assertThat(UploadSeguro.validar(arquivo("diario.pdf", PDF), Tipo.DOCUMENTO).mime()).isEqualTo("application/pdf");
        assertThat(UploadSeguro.validar(arquivo("diario.docx", ZIP), Tipo.DOCUMENTO).mime())
                .isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(UploadSeguro.validar(arquivo("diario.odt", ZIP), Tipo.DOCUMENTO).mime())
                .isEqualTo("application/vnd.oasis.opendocument.text");
        assertThat(UploadSeguro.validar(arquivo("diario.doc", OLE), Tipo.DOCUMENTO).mime()).isEqualTo("application/msword");
        assertThat(UploadSeguro.validar(arquivo("diario.rtf", "{\\rtf1\\ansi".getBytes(StandardCharsets.US_ASCII)), Tipo.DOCUMENTO).mime())
                .isEqualTo("application/rtf");
        // Foto do diário em papel.
        assertThat(UploadSeguro.validar(arquivo("diario.jpg", JPEG), Tipo.DOCUMENTO).mime()).isEqualTo("image/jpeg");
    }

    @Test
    void documentoRecusaConteudoQueNaoBateComAExtensao() {
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("diario.pdf", HTML), Tipo.DOCUMENTO))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("diario.docx", PNG), Tipo.DOCUMENTO))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("diario.exe", ZIP), Tipo.DOCUMENTO))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("diario.html", HTML), Tipo.DOCUMENTO))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
    }

    @Test
    void imagemNaoAceitaDocumento() {
        assertThatThrownBy(() -> UploadSeguro.validar(arquivo("aviso.pdf", PDF), Tipo.IMAGEM))
                .isInstanceOf(UploadSeguro.UploadRecusadoException.class);
    }

    // ---- nome ----

    @Test
    void nomeDoClienteNuncaCarregaCaminhoNemCaractereDeControle() throws Exception {
        Arquivo a = UploadSeguro.validar(arquivo("../../etc/passwd/foto.png", PNG), Tipo.IMAGEM);
        assertThat(a.nomeParaExibir()).isEqualTo("foto.png");

        Arquivo b = UploadSeguro.validar(arquivo("C:\\Users\\x\\Desktop\\foto.png", PNG), Tipo.IMAGEM);
        assertThat(b.nomeParaExibir()).isEqualTo("foto.png");

        Arquivo c = UploadSeguro.validar(arquivo("foto\r\nContent-Type: text/html\".png", PNG), Tipo.IMAGEM);
        assertThat(c.nomeParaExibir()).doesNotContain("\r").doesNotContain("\n").doesNotContain("\"");
        assertThat(c.nomeParaExibir()).endsWith(".png");
    }

    @Test
    void nomeComAcentoEEspacoEhPreservado() throws Exception {
        Arquivo a = UploadSeguro.validar(arquivo("Diário de Classe - João (1ª turma).pdf", PDF), Tipo.DOCUMENTO);

        assertThat(a.nomeParaExibir()).isEqualTo("Diário de Classe - João (1ª turma).pdf");
    }

    @Test
    void nomeMuitoLongoEhCortadoMantendoAExtensao() throws Exception {
        Arquivo a = UploadSeguro.validar(arquivo("a".repeat(400) + ".png", PNG), Tipo.IMAGEM);

        assertThat(a.nomeParaExibir().length()).isLessThanOrEqualTo(100);
        assertThat(a.nomeParaExibir()).endsWith(".png");
    }

    @Test
    void nomeSeguroLimpaNomesAntigosJaGravados() {
        assertThat(UploadSeguro.nomeSeguro("../../x\r\ny.pdf")).doesNotContain("..").doesNotContain("\n").doesNotContain("/");
        assertThat(UploadSeguro.nomeSeguro(null)).isEqualTo("arquivo");
        assertThat(UploadSeguro.nomeSeguro("   ")).isEqualTo("arquivo");
        assertThat(UploadSeguro.nomeSeguro(".htaccess")).doesNotStartWith(".");
    }
}
