package br.com.melvin.sistema.domain.imagem.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.domain.imagem.model.Imagem;
import br.com.melvin.sistema.domain.imagem.repository.ImagemRepository;
import br.com.melvin.sistema.shared.security.UploadSeguro;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class ImagemService {
    // Tipos de imagem que o sistema conhece (o tipo escolhe a pasta); qualquer outro texto é recusado.
    private static final Set<String> TIPOS_PERMITIDOS = Set.of("embaixador", "aviso");

    @Value("${file.upload-dir-imagensembaixadores}")
    private String uploadDirEmbaixadores;

    @Value("${file.upload-dir-imagensavisos}")
    private String uploadDirAvisos;

    @Autowired
    ImagemRepository repositorio;

    public List<Imagem> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> upload(MultipartFile file, UUID idAtrelado, String tipo) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Selecione um arquivo para enviar");
        }

        if (!TIPOS_PERMITIDOS.contains(tipo)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tipo de imagem inválido.");
        }

        // O servidor decide o que aceita pelo conteúdo do arquivo (ver UploadSeguro), antes de tocar em disco ou banco.
        UploadSeguro.Arquivo arquivo;
        try {
            arquivo = UploadSeguro.validar(file, UploadSeguro.Tipo.IMAGEM);
        } catch (UploadSeguro.UploadRecusadoException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            log.error("Falha ao ler o arquivo enviado", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao ler o arquivo enviado.");
        }

        try{
            Imagem existingImagem = repositorio.findByIdAtreladoAndTipo(idAtrelado, tipo);

            // Grava o arquivo novo primeiro: se falhar, a imagem anterior continua intacta.
            Path newFilePath = uploadFile(file, tipo, arquivo);

            if(existingImagem != null){
                String caminhoAnterior = existingImagem.getFilePath();

                existingImagem.setFileName(arquivo.nomeParaExibir());
                existingImagem.setFileType(arquivo.mime());
                existingImagem.setFilePath(newFilePath.toString());
                repositorio.save(existingImagem);
                deleteFile(caminhoAnterior);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo atualizado com sucesso: " + arquivo.nomeParaExibir());
            } else {
                Imagem imagem = new Imagem();
                imagem.setIdAtrelado(idAtrelado);
                imagem.setFileType(arquivo.mime());
                imagem.setFileName(arquivo.nomeParaExibir());
                imagem.setFilePath(newFilePath.toString());
                imagem.setTipo(tipo);

                repositorio.save(imagem);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo carregado com sucesso: " + arquivo.nomeParaExibir());
            }
        } catch (IOException e) {
            log.error("Falha ao gravar a imagem", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao carregar o arquivo.");
        }
    }

    // O nome em disco é gerado aqui; o que o cliente mandou só serve de texto de exibição.
    private Path uploadFile(MultipartFile file, String tipo, UploadSeguro.Arquivo arquivo) throws IOException {
        return uploadFileName(file, UUID.randomUUID().toString() + "." + arquivo.extensao(), tipo);
    }

    private Path uploadFileName(MultipartFile file, String fileName, String tipo) throws IOException {
        Path uploadPath;

        if("embaixador".equals(tipo)){
            uploadPath = Paths.get(uploadDirEmbaixadores).toAbsolutePath().normalize();
        } else {
            uploadPath = Paths.get(uploadDirAvisos).toAbsolutePath().normalize();
        }

        if(!Files.exists(uploadPath)){
            Files.createDirectories(uploadPath);
        }

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

    public Imagem capturaPorIdAtreladoeTipo(UUID id, String tipo){
        return repositorio.findByIdAtreladoAndTipo(id, tipo);
    }
}
