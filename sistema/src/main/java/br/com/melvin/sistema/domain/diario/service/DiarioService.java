package br.com.melvin.sistema.domain.diario.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.domain.diario.model.Diario;
import br.com.melvin.sistema.domain.diario.repository.DiarioRepository;
import br.com.melvin.sistema.shared.security.UploadSeguro;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@SuppressWarnings("null")
@Slf4j
public class DiarioService {

    @Value("${file.upload-dir-diarios}")
    private String uploadDir;

    @Autowired
    DiarioRepository repositoryDiario;

    public ResponseEntity<?> upload(MultipartFile file, String matriculaAtrelada) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Selecione um arquivo para enviar");
        }

        // O servidor decide o que aceita pelo conteúdo do arquivo (ver UploadSeguro), antes de tocar em disco ou banco.
        UploadSeguro.Arquivo arquivo;
        try {
            arquivo = UploadSeguro.validar(file, UploadSeguro.Tipo.DOCUMENTO);
        } catch (UploadSeguro.UploadRecusadoException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            log.error("Falha ao ler o arquivo enviado", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao ler o arquivo enviado.");
        }

        try {
            // Grava o arquivo novo primeiro: se falhar, o diário anterior continua intacto.
            Path novoCaminho = uploadFile(file, arquivo);

            // Verificar se já existe um diário com a mesma matrícula
            Diario existingDiario = repositoryDiario.findByMatriculaAtrelada(matriculaAtrelada);
            if (existingDiario != null) {
                String caminhoAnterior = existingDiario.getFilePath();

                // Atualizar os dados do diário existente com o novo arquivo
                existingDiario.setFileName(arquivo.nomeParaExibir());
                existingDiario.setFileType(arquivo.mime());
                existingDiario.setFilePath(novoCaminho.toString());
                repositoryDiario.save(existingDiario);
                deleteFile(caminhoAnterior);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo atualizado com sucesso: " + arquivo.nomeParaExibir());
            } else {
                // Criar e salvar a entidade Diario no banco de dados
                Diario diario = new Diario();
                diario.setMatriculaAtrelada(matriculaAtrelada);
                diario.setFileName(arquivo.nomeParaExibir());
                diario.setFileType(arquivo.mime());
                diario.setFilePath(novoCaminho.toString());

                repositoryDiario.save(diario);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo carregado com sucesso: " + arquivo.nomeParaExibir());
            }
        } catch (IOException e) {
            log.error("Falha ao gravar o diário", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao carregar o arquivo.");
        }
    }

    // O nome em disco é gerado aqui; o que o cliente mandou só serve de texto de exibição.
    private Path uploadFile(MultipartFile file, UploadSeguro.Arquivo arquivo) throws IOException {
        return uploadFileName(file, UUID.randomUUID().toString() + "." + arquivo.extensao());
    }

    private Path uploadFileName(MultipartFile file, String fileName) throws IOException {
        // Criar o diretório de upload se não existir
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Salvar o arquivo no sistema de arquivos
        Path filePath = uploadPath.resolve(fileName).normalize();
        if (!filePath.startsWith(uploadPath)) {
            throw new IOException("Caminho de destino fora da pasta de uploads.");
        }
        Files.copy(file.getInputStream(), filePath);

        return filePath;
    }
    
    private void deleteFile(String filePath) throws IOException {
        if (filePath != null) {
            Path fileToDelete = Paths.get(filePath);
            Files.deleteIfExists(fileToDelete);
        }
    }

    public ResponseEntity<?> deleteDiarioByMatricula(String matriculaAtrelada) {
        // Buscar o diário pela matrícula
        Diario diario = repositoryDiario.findByMatriculaAtrelada(matriculaAtrelada);
        
        if (diario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Diário não encontrado para a matrícula: " + matriculaAtrelada);
        }
    
        try {
            // Deletar o arquivo do sistema de arquivos
            deleteFile(diario.getFilePath());
            
            // Deletar o registro do banco de dados
            repositoryDiario.delete(diario);
            
            return ResponseEntity.status(HttpStatus.OK).body("Diário deletado com sucesso para a matrícula: " + matriculaAtrelada);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao deletar o diário: " + e.getMessage());
        }
    }

    public Diario capturaPorMatricula(String matricula){
        return repositoryDiario.findByMatriculaAtrelada(matricula);
    }

    public ResponseEntity<Resource> downloadFile(String matriculaAtrelada) {
        // Encontre o diário pelo número de matrícula
        Diario diario = repositoryDiario.findByMatriculaAtrelada(matriculaAtrelada);
        if (diario == null || diario.getFilePath() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try {
            // Localize o arquivo no sistema de arquivos
            Path filePath = Paths.get(diario.getFilePath()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Configure os cabeçalhos da resposta para o download do arquivo. O nome vem do banco (que pode ter
                // registro antigo com o nome cru do cliente): limpa e codifica, para nunca abrir um cabeçalho novo.
                HttpHeaders headers = new HttpHeaders();
                headers.setContentDisposition(ContentDisposition.attachment()
                        .filename(UploadSeguro.nomeSeguro(diario.getFileName()), StandardCharsets.UTF_8).build());

                // Só um tipo conhecido; qualquer outro vai como binário genérico, nunca como algo que o navegador execute.
                MediaType tipo = UploadSeguro.mimePermitido(diario.getFileType())
                        ? MediaType.parseMediaType(diario.getFileType())
                        : MediaType.APPLICATION_OCTET_STREAM;

                return ResponseEntity.ok()
                        .headers(headers)
                        .contentType(tipo)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
