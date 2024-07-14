package br.com.melvin.sistema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.model.Embaixador;
import br.com.melvin.sistema.services.EmbaixadorService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/embaixador")
public class EmbaixadorController {
    
    @Autowired
    EmbaixadorService service;

    @GetMapping
    public List<Embaixador> listar(){
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Embaixador embaixador) {
        return service.adicionar(embaixador);
    }
    
    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Embaixador embaixador) {
        return service.alterar(embaixador);
    }
}
