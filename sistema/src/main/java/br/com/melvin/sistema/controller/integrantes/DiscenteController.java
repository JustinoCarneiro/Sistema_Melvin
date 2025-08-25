package br.com.melvin.sistema.controller.integrantes;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // O wildcard (*) já inclui o RequestParam

import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.services.integrantes.DiscenteService;

@RestController
@RequestMapping("/discente")
public class DiscenteController {
    
    @Autowired
    private DiscenteService service;

    // MÉTODO 'listar' ATUALIZADO
    @GetMapping
    public List<Discente> listar(@RequestParam(value = "search", required = false) String searchTerm) {
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return service.searchDiscentes(searchTerm);
        } else {
            return service.listar();
        }
    }

    @GetMapping("/sala/{sala}")
    public List<Discente> listarPorSala(@PathVariable Integer sala) {
        return service.listarPorSala(sala);
    }
    
    @GetMapping("/matricula/{matricula}")
    public Discente capturaPorMatricula(@PathVariable String matricula){
        return service.capturaPorMatricula(matricula);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Discente discente){
        return service.cadastrar(discente);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Discente discente){
        return service.alterar(discente);
    }

    @DeleteMapping("/{matricula}")
    public ResponseEntity<String> remover(@PathVariable String matricula){
        return service.remover(matricula);
    }
}