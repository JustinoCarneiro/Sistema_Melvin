package br.com.melvin.sistema.controller;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.model.Imagem;
import br.com.melvin.sistema.services.ImagemService;


@RestController
@RequestMapping("/imagens")
public class ImagemController {
    private static final Logger logger = LoggerFactory.getLogger(ImagemController.class);
    
    @Autowired
    private ImagemService service;

    @GetMapping("/lista")
    public List<Imagem> listar() {
        return service.listar();
    }

    @GetMapping("/captura/{id}/{tipo}")
    public ResponseEntity<Imagem> capturaPorIdAtrelado(@PathVariable UUID id, @PathVariable String tipo) {
        logger.info("Recebida solicitação GET /imagens/captura/{}/{}", id, tipo);

        Imagem imagem = service.capturaPorIdAtreladoeTipo(id, tipo);
        
        if (imagem != null) {
            return ResponseEntity.ok(imagem);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    
    @PostMapping("/upload/{id}/{tipo}")
    public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file,
                                        @PathVariable UUID id,
                                        @PathVariable String tipo       ) {
        ResponseEntity<?> response = service.upload(file, id, tipo);
        return response;
    }
    
    @PutMapping("/atualizar/{id}/{tipo}")
    public ResponseEntity<?> atualizarFile(@RequestParam MultipartFile file,
                                           @PathVariable UUID id,
                                           @PathVariable String tipo       ) {
        ResponseEntity<?> response = service.upload(file, id, tipo);
        return response;
    }
}
