package br.com.melvin.sistema.shared.security;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.web.multipart.MultipartFile;

/**
 * Validação dos arquivos enviados (fotos de embaixador e de aviso, diário de classe).
 *
 * <p>O arquivo é entrada do usuário e depois é servido pelo mesmo domínio do sistema. Um HTML ou SVG com script
 * enviado como "foto" rodaria no navegador de quem abrisse o link, com acesso ao token de login. Por isso:
 * <ul>
 *   <li>só entra extensão de uma lista curta (imagens raster e documentos), nunca HTML, SVG, XML ou script;</li>
 *   <li>o conteúdo precisa começar com os bytes certos para aquela extensão — o tipo que o navegador declara
 *       e o nome não valem como prova;</li>
 *   <li>o nome gravado em disco é gerado pelo servidor; o nome do cliente só vira texto de exibição, já limpo
 *       de caminho e de caracteres de controle.</li>
 * </ul>
 */
public final class UploadSeguro {

    public enum Tipo { IMAGEM, DOCUMENTO }

    public record Arquivo(String nomeParaExibir, String extensao, String mime) {
    }

    /** Arquivo recusado; a mensagem é própria para mostrar a quem enviou. */
    public static class UploadRecusadoException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public UploadRecusadoException(String mensagem) {
            super(mensagem);
        }
    }

    private enum Assinatura { JPEG, PNG, GIF, WEBP, AVIF, PDF, ZIP, OLE, RTF }

    private record Formato(String extensao, String mime, Assinatura assinatura, boolean imagem) {
    }

    private static final String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static final String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private static final Map<String, Formato> FORMATOS = Map.ofEntries(
            Map.entry("jpg", new Formato("jpg", "image/jpeg", Assinatura.JPEG, true)),
            Map.entry("jpeg", new Formato("jpg", "image/jpeg", Assinatura.JPEG, true)),
            Map.entry("png", new Formato("png", "image/png", Assinatura.PNG, true)),
            Map.entry("gif", new Formato("gif", "image/gif", Assinatura.GIF, true)),
            Map.entry("webp", new Formato("webp", "image/webp", Assinatura.WEBP, true)),
            Map.entry("avif", new Formato("avif", "image/avif", Assinatura.AVIF, true)),
            Map.entry("pdf", new Formato("pdf", "application/pdf", Assinatura.PDF, false)),
            Map.entry("docx", new Formato("docx", DOCX, Assinatura.ZIP, false)),
            Map.entry("xlsx", new Formato("xlsx", XLSX, Assinatura.ZIP, false)),
            Map.entry("odt", new Formato("odt", "application/vnd.oasis.opendocument.text", Assinatura.ZIP, false)),
            Map.entry("ods", new Formato("ods", "application/vnd.oasis.opendocument.spreadsheet", Assinatura.ZIP, false)),
            Map.entry("doc", new Formato("doc", "application/msword", Assinatura.OLE, false)),
            Map.entry("xls", new Formato("xls", "application/vnd.ms-excel", Assinatura.OLE, false)),
            Map.entry("rtf", new Formato("rtf", "application/rtf", Assinatura.RTF, false)));

    private static final Pattern EXTENSAO_VALIDA = Pattern.compile("^[a-z0-9]{1,5}$");
    private static final Pattern FORA_DO_PERMITIDO = Pattern.compile("[^\\p{L}\\p{N} ._()\\-]");
    private static final int TAMANHO_MAXIMO_DO_NOME = 100;
    private static final String NOME_PADRAO = "arquivo";

    private UploadSeguro() {
    }

    public static Arquivo validar(MultipartFile file, Tipo tipo) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new UploadRecusadoException("Selecione um arquivo para enviar.");
        }

        String nome = nomeSeguro(file.getOriginalFilename());
        int ponto = nome.lastIndexOf('.');
        String extensaoInformada = ponto >= 0 ? nome.substring(ponto + 1).toLowerCase(Locale.ROOT) : "";
        Formato formato = EXTENSAO_VALIDA.matcher(extensaoInformada).matches() ? FORMATOS.get(extensaoInformada) : null;

        if (formato == null || (tipo == Tipo.IMAGEM && !formato.imagem())) {
            throw new UploadRecusadoException(tipo == Tipo.IMAGEM
                    ? "Tipo de arquivo não permitido. Envie uma imagem JPG, PNG, GIF, WEBP ou AVIF."
                    : "Tipo de arquivo não permitido. Envie PDF, DOC, DOCX, ODT, RTF, XLS, XLSX, ODS ou uma imagem.");
        }

        byte[] cabecalho;
        try (InputStream in = file.getInputStream()) {
            cabecalho = in.readNBytes(16);
        }
        if (!corresponde(formato.assinatura(), cabecalho)) {
            throw new UploadRecusadoException("O conteúdo do arquivo não corresponde ao tipo informado.");
        }

        String base = nome.substring(0, ponto);
        return new Arquivo(base + "." + formato.extensao(), formato.extensao(), formato.mime());
    }

    /** Se o tipo MIME é um dos que o sistema aceita enviar (para decidir o Content-Type de um download antigo). */
    public static boolean mimePermitido(String mime) {
        return mime != null && FORMATOS.values().stream().anyMatch(f -> f.mime().equals(mime));
    }

    /**
     * Texto de exibição derivado do nome que o cliente mandou: sem caminho, sem caractere de controle ou aspas, sem
     * ponto no começo, com no máximo 100 caracteres (preservando a extensão). Serve também para limpar nomes
     * antigos já gravados antes de usá-los em um cabeçalho de download.
     */
    public static String nomeSeguro(String original) {
        if (original == null || original.isBlank()) {
            return NOME_PADRAO;
        }
        String nome = original;
        int barra = Math.max(nome.lastIndexOf('/'), nome.lastIndexOf('\\'));
        if (barra >= 0) {
            nome = nome.substring(barra + 1);
        }
        nome = nome.chars()
                .filter(c -> !Character.isISOControl(c))
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
        nome = FORA_DO_PERMITIDO.matcher(nome).replaceAll("_");
        nome = nome.replaceAll("\\.{2,}", ".").replaceAll(" {2,}", " ").trim();
        nome = nome.replaceAll("^[. ]+", "");
        if (nome.isEmpty()) {
            return NOME_PADRAO;
        }
        if (nome.length() > TAMANHO_MAXIMO_DO_NOME) {
            int ponto = nome.lastIndexOf('.');
            String extensao = ponto >= 0 && nome.length() - ponto <= 7 ? nome.substring(ponto) : "";
            nome = nome.substring(0, TAMANHO_MAXIMO_DO_NOME - extensao.length()) + extensao;
        }
        return nome;
    }

    private static boolean corresponde(Assinatura assinatura, byte[] b) {
        return switch (assinatura) {
            case JPEG -> comeca(b, 0, 0xFF, 0xD8, 0xFF);
            case PNG -> comeca(b, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A);
            case GIF -> comeca(b, 0, 'G', 'I', 'F', '8') && (b.length > 4 && (b[4] == '7' || b[4] == '9')) && b.length > 5 && b[5] == 'a';
            case WEBP -> comeca(b, 0, 'R', 'I', 'F', 'F') && comeca(b, 8, 'W', 'E', 'B', 'P');
            case AVIF -> comeca(b, 4, 'f', 't', 'y', 'p') && (comeca(b, 8, 'a', 'v', 'i', 'f') || comeca(b, 8, 'a', 'v', 'i', 's'));
            case PDF -> comeca(b, 0, '%', 'P', 'D', 'F', '-');
            case ZIP -> comeca(b, 0, 'P', 'K', 0x03, 0x04);
            case OLE -> comeca(b, 0, 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1);
            case RTF -> comeca(b, 0, '{', '\\', 'r', 't', 'f');
        };
    }

    private static boolean comeca(byte[] dados, int inicio, int... esperado) {
        if (dados.length < inicio + esperado.length) {
            return false;
        }
        for (int i = 0; i < esperado.length; i++) {
            if ((dados[inicio + i] & 0xFF) != esperado[i]) {
                return false;
            }
        }
        return true;
    }
}
