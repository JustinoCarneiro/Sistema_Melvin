package br.com.melvin.sistema.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.model.Imagem;
import br.com.melvin.sistema.repository.ImagemRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ImagemService {
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

        try{
            Imagem existingImagem = repositorio.findByIdAtreladoAndTipo(idAtrelado, tipo);

            if(existingImagem != null){
                deleteFile(existingImagem.getFilePath());

                existingImagem.setFileName(file.getOriginalFilename());
                existingImagem.setFileType(file.getContentType());
                existingImagem.setFilePath(null);
                repositorio.save(existingImagem);

                Path newFilePath = uploadFile(file, tipo);
                existingImagem.setFilePath(newFilePath.toString());
                repositorio.save(existingImagem);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo atualizado com sucesso: " + file.getOriginalFilename());
            } else {
                Path filePath = uploadFile(file, tipo);

                Imagem imagem = new Imagem();
                imagem.setIdAtrelado(idAtrelado);
                imagem.setFileType(file.getContentType());
                imagem.setFileName(file.getOriginalFilename());
                imagem.setFilePath(filePath.toString());
                imagem.setTipo(tipo);

                repositorio.save(imagem);

                return ResponseEntity.status(HttpStatus.OK).body("Arquivo carregado com sucesso: " + file.getOriginalFilename());
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao carregar o arquivo: " + e.getMessage());
        }
    }

    private Path uploadFile(MultipartFile file, String tipo) throws IOException {
        return uploadFileName(file, UUID.randomUUID().toString() + "_" + file.getOriginalFilename(), tipo);
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

    public Imagem capturaPorIdAtreladoeTipo(UUID id, String tipo){
        return repositorio.findByIdAtreladoAndTipo(id, tipo);
    }
}
