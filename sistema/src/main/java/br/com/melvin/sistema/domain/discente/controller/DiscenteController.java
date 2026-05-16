package br.com.melvin.sistema.domain.discente.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.InputStreamResource;
import java.io.ByteArrayInputStream;                  
import java.io.IOException; 

import br.com.melvin.sistema.domain.discente.dto.DiscenteAvaliacaoDTO;
import br.com.melvin.sistema.domain.discente.dto.DiscenteListagemDTO;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.service.DiscenteService;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/discente")
@SuppressWarnings("null")
public class DiscenteController {
    
    @Autowired
    private DiscenteService service;

    // MÉTODO 'listar' ATUALIZADO PARA LGPD
    @GetMapping
    public List<DiscenteListagemDTO> listar(@RequestParam(value = "search", required = false) String searchTerm) {
        List<Discente> discentes;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            discentes = service.searchDiscentes(searchTerm);
        } else {
            discentes = service.listar();
        }
        return discentes.stream().map(DiscenteListagemDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/sala/{sala}")
    public List<DiscenteListagemDTO> listarPorSala(@PathVariable Integer sala) {
        return service.listarPorSala(sala).stream().map(DiscenteListagemDTO::new).collect(Collectors.toList());
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

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportarDiscentes(@RequestParam(value = "search", required = false) String searchTerm) throws IOException {
        ByteArrayInputStream bais = service.exportarDiscentes(searchTerm);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=discentes.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(new InputStreamResource(bais));
    }

    @PutMapping("/{matricula}/avaliacoes")
    public ResponseEntity<?> alterarAvaliacoes(@PathVariable String matricula, @RequestBody DiscenteAvaliacaoDTO data) {
        return service.alterarAvaliacoes(matricula, data);
    }
}