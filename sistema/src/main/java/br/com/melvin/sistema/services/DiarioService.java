package br.com.melvin.sistema.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.model.Diario;
import br.com.melvin.sistema.repository.DiarioRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class DiarioService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    DiarioRepository repositoryDiario;

    public ResponseEntity<?> upload(MultipartFile file, String matriculaAtrelada) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Selecione um arquivo para enviar");
        }

        try {
            // Verificar se já existe um diário com a mesma matrícula
            Diario existingDiario = repositoryDiario.findByMatriculaAtrelada(matriculaAtrelada);
            if (existingDiario != null) {
                deleteFile(existingDiario.getFilePath());
                // Atualizar os dados do diário existente com o novo arquivo
                existingDiario.setFileName(file.getOriginalFilename());
                existingDiario.setFileType(file.getContentType());
                existingDiario.setFilePath(null); // Limpar o caminho antigo para gerar um novo
                repositoryDiario.save(existingDiario);
                // Definir o novo caminho do arquivo
                Path newFilePath = uploadFile(file);
                existingDiario.setFilePath(newFilePath.toString());
                repositoryDiario.save(existingDiario);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo atualizado com sucesso: " + file.getOriginalFilename());
            } else {
                // Se não existir, fazer o upload normalmente
                Path filePath = uploadFile(file);

                // Criar e salvar a entidade Diario no banco de dados
                Diario diario = new Diario();
                diario.setMatriculaAtrelada(matriculaAtrelada);
                diario.setFileName(file.getOriginalFilename());
                diario.setFileType(file.getContentType());
                diario.setFilePath(filePath.toString());

                repositoryDiario.save(diario);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo carregado com sucesso: " + file.getOriginalFilename());
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao carregar o arquivo: " + e.getMessage());
        }
    }

    private Path uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, UUID.randomUUID().toString() + "_" + file.getOriginalFilename());
    }

    private Path uploadFile(MultipartFile file, String fileName) throws IOException {
        // Criar o diretório de upload se não existir
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Salvar o arquivo no sistema de arquivos
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return filePath;
    }
    
    private void deleteFile(String filePath) throws IOException {
        if (filePath != null) {
            Path fileToDelete = Paths.get(filePath);
            Files.deleteIfExists(fileToDelete);
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
                // Configure os cabeçalhos da resposta para o download do arquivo
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"");

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
