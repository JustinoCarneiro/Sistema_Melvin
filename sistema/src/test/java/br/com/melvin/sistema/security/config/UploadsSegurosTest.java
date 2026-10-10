package br.com.melvin.sistema.security.config;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import br.com.melvin.sistema.domain.imagem.model.Imagem;
import br.com.melvin.sistema.domain.imagem.repository.ImagemRepository;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;

/**
 * Os arquivos enviados pela administração (foto de embaixador e de aviso, diário) são servidos pelo mesmo domínio
 * do sistema. O servidor decide o que aceita pelo conteúdo, dá o nome ao arquivo e manda cabeçalhos que impedem o
 * navegador de executar o que quer que esteja ali. Usa beans reais (H2), JWT real e o disco de verdade (/tmp).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UploadsSegurosTest {

    private static final File PASTA_AVISOS = new File("/tmp/imagens_avisos/");
    private static final File PASTA_DIARIOS = new File("/tmp/diarios/");

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};
    private static final byte[] ZIP = {'P', 'K', 3, 4, 0x14, 0, 6, 0, 8, 0, 0, 0, 0x21, 0, 0, 0, 'x', 'y'};
    private static final byte[] HTML = "<html><script>alert(document.cookie)</script></html>".getBytes(StandardCharsets.UTF_8);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImagemRepository imagemRepository;

    @Autowired
    private TokenService tokenService;

    private String bearer(String login, UserRole role) {
        User usuario = userRepository.findByLogin(login);
        if (usuario == null) {
            usuario = userRepository.save(new User(login, "senha-que-o-teste-nao-usa", role));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    private Set<String> arquivosEm(File pasta) {
        String[] nomes = pasta.list();
        return nomes == null ? new HashSet<>() : new HashSet<>(Arrays.asList(nomes));
    }

    private MvcResult enviarImagem(String tipo, String nome, byte[] conteudo) throws Exception {
        return mockMvc.perform(multipart("/imagens/upload/{id}/{tipo}", UUID.randomUUID(), tipo)
                .file(new MockMultipartFile("file", nome, "image/png", conteudo))
                .header(HttpHeaders.AUTHORIZATION, bearer("9800001", UserRole.ADM))).andReturn();
    }

    private MvcResult enviarDiario(String matricula, String nome, byte[] conteudo) throws Exception {
        return mockMvc.perform(multipart("/diarios/upload")
                .file(new MockMultipartFile("file", nome, "application/octet-stream", conteudo))
                .param("matriculaAtrelada", matricula)
                .header(HttpHeaders.AUTHORIZATION, bearer("9800001", UserRole.ADM))).andReturn();
    }

    // ---- imagens ----

    @Test
    void imagemComConteudoDeHtmlEhRecusadaENadaVaiParaODisco() throws Exception {
        Set<String> antes = arquivosEm(PASTA_AVISOS);

        MvcResult resposta = enviarImagem("aviso", "foto.png", HTML);

        assertThat(resposta.getResponse().getStatus()).isEqualTo(400);
        assertThat(arquivosEm(PASTA_AVISOS)).isEqualTo(antes);
    }

    @Test
    void svgComoImagemEhRecusado() throws Exception {
        MvcResult resposta = enviarImagem("aviso", "logo.svg", "<svg onload=\"alert(1)\"/>".getBytes(StandardCharsets.UTF_8));

        assertThat(resposta.getResponse().getStatus()).isEqualTo(400);
    }

    @Test
    void imagemValidaGanhaNomeDoServidorENomeLimpoNoBanco() throws Exception {
        Set<String> antes = arquivosEm(PASTA_AVISOS);

        MvcResult resposta = enviarImagem("aviso", "../../minha foto \"1\".png", PNG);

        assertThat(resposta.getResponse().getStatus()).isEqualTo(200);
        Set<String> novos = arquivosEm(PASTA_AVISOS).stream().filter(n -> !antes.contains(n)).collect(Collectors.toSet());
        assertThat(novos).hasSize(1);
        assertThat(novos.iterator().next()).matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.png$");

        Imagem salva = imagemRepository.findAll().stream()
                .filter(i -> i.getFilePath().endsWith(novos.iterator().next())).findFirst().orElseThrow();
        assertThat(salva.getFileName()).isEqualTo("minha foto _1_.png");
        assertThat(salva.getFileType()).isEqualTo("image/png");
        assertThat(Path.of(salva.getFilePath()).getParent()).isEqualTo(PASTA_AVISOS.toPath().toAbsolutePath().normalize());
    }

    @Test
    void tipoDeImagemDesconhecidoEhRecusado() throws Exception {
        assertThat(enviarImagem("qualquer-coisa", "foto.png", PNG).getResponse().getStatus()).isEqualTo(400);
    }

    // ---- diário ----

    @Test
    void diarioExecutavelOuComConteudoQueNaoBateEhRecusado() throws Exception {
        Set<String> antes = arquivosEm(PASTA_DIARIOS);

        assertThat(enviarDiario("20269991", "diario.exe", ZIP).getResponse().getStatus()).isEqualTo(400);
        assertThat(enviarDiario("20269991", "diario.docx", PNG).getResponse().getStatus()).isEqualTo(400);
        assertThat(enviarDiario("20269991", "diario.html", HTML).getResponse().getStatus()).isEqualTo(400);

        assertThat(arquivosEm(PASTA_DIARIOS)).isEqualTo(antes);
    }

    @Test
    void diarioValidoEhGravadoEBaixadoComNomeLimpoEComoAnexo() throws Exception {
        MvcResult envio = enviarDiario("20269992", "Diário da 1ª turma.docx", ZIP);
        assertThat(envio.getResponse().getStatus()).isEqualTo(200);

        MvcResult download = mockMvc.perform(get("/diarios/download/{matricula}", "20269992")
                .header(HttpHeaders.AUTHORIZATION, bearer("9800002", UserRole.COOR))).andReturn();

        assertThat(download.getResponse().getStatus()).isEqualTo(200);
        assertThat(download.getResponse().getContentAsByteArray()).isEqualTo(ZIP);
        String disposicao = download.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(disposicao).startsWith("attachment");
        assertThat(disposicao).doesNotContain("\r").doesNotContain("\n");
        assertThat(download.getResponse().getContentType())
                .isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        // O arquivo em disco leva o nome gerado pelo servidor, não o do cliente.
        assertThat(arquivosEm(PASTA_DIARIOS)).anyMatch(n -> n.matches("^[0-9a-f-]{36}\\.docx$"));
        assertThat(Files.list(PASTA_DIARIOS.toPath()).map(p -> p.getFileName().toString()).collect(Collectors.toList()))
                .noneMatch(n -> n.contains("Diário"));
    }

    @Test
    void nomeAntigoComCaracteresPerigososNaoVaiParaOCabecalhoDeDownload() throws Exception {
        // Registro antigo, gravado quando o nome do cliente ia direto para o banco.
        enviarDiario("20269993", "diario.docx", ZIP);
        br.com.melvin.sistema.domain.diario.model.Diario d = diarioRepository.findByMatriculaAtrelada("20269993");
        d.setFileName("antigo\r\nSet-Cookie: x=1\".docx");
        diarioRepository.save(d);

        MvcResult download = mockMvc.perform(get("/diarios/download/{matricula}", "20269993")
                .header(HttpHeaders.AUTHORIZATION, bearer("9800002", UserRole.COOR))).andReturn();

        String disposicao = download.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(disposicao).doesNotContain("\r").doesNotContain("\n").doesNotContain("Set-Cookie: x=1\"");
        assertThat(download.getResponse().getHeader("Set-Cookie")).isNull();
    }

    @Autowired
    private br.com.melvin.sistema.domain.diario.repository.DiarioRepository diarioRepository;

    // ---- arquivos servidos pelo caminho estático ----

    @Test
    void arquivosServidosPeloCaminhoEstaticoNaoPodemExecutarNadaNoNavegador() throws Exception {
        MvcResult resposta = mockMvc.perform(get("/app/docs/imagens_avisos/qualquer.png")).andReturn();

        assertThat(resposta.getResponse().getHeader("Content-Security-Policy")).contains("default-src 'none'").contains("sandbox");
        assertThat(resposta.getResponse().getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
    }
}
