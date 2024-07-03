package br.com.melvin.sistema.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.melvin.sistema.model.Diario;
import br.com.melvin.sistema.services.DiarioService;

@RestController
@RequestMapping("/diarios")
public class DiarioController {

    @Autowired
    private DiarioService diarioService;

    @GetMapping("/captura/{matricula}")
    public Diario capturarPorMatricula(@PathVariable String matricula){
        return diarioService.capturaPorMatricula(matricula);
    }

    @GetMapping("/download/{matricula}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String matricula) {
        return diarioService.downloadFile(matricula);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam MultipartFile file,
                                        @RequestParam String matriculaAtrelada) {
        ResponseEntity<?> response = diarioService.upload(file, matriculaAtrelada);
        return response;
    }

    @PutMapping("/atualizar/{matriculaAtrelada}")
    public ResponseEntity<?> atualizarFile(@RequestParam MultipartFile file,
                                           @PathVariable String matriculaAtrelada) {
        ResponseEntity<?> response = diarioService.upload(file, matriculaAtrelada);
        return response;
    }
}
