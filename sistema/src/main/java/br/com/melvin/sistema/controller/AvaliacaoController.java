package br.com.melvin.sistema.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.melvin.sistema.model.Avaliacao;
import br.com.melvin.sistema.services.AvaliacaoService;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    @Autowired
    private AvaliacaoService service;

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Avaliacao avaliacao) {
        return service.adicionar(avaliacao);
    }

    @GetMapping("/aluno/{matricula}")
    public List<Avaliacao> listarPorMatricula(@PathVariable String matricula) {
        return service.listarPorMatricula(matricula);
    }
}