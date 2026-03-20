package br.com.melvin.sistema.domain.voluntario.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.melvin.sistema.domain.voluntario.dto.VoluntarioDTO;
import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.service.VoluntarioService;

@RestController
@RequestMapping("/voluntario")
public class VoluntarioController {

    @Autowired
    private VoluntarioService service;

    @GetMapping
    public List<Voluntario> listar(@RequestParam(value = "search", required = false) String searchTerm) {
        return service.searchVoluntarios(searchTerm);
    }

    @GetMapping("/nomesfuncoes")
    public ResponseEntity<List<VoluntarioDTO>> listarVoluntariosComNomeFuncao() {
        List<VoluntarioDTO> voluntarios = service.listarVoluntariosComNomeFuncao();
        return ResponseEntity.ok(voluntarios);
    }

    @GetMapping("/matricula/{matricula}")
    public Voluntario capturaPorMatricula(@PathVariable String matricula){
        return service.capturaPorMatricula(matricula);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Voluntario voluntario){
        return service.cadastrar(voluntario);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Voluntario voluntario){
        return service.alterar(voluntario);
    }

    @DeleteMapping("/{matricula}")
    public ResponseEntity<String> deletar(@PathVariable String matricula){
        return service.remover(matricula);
    }
}
