package br.com.melvin.sistema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.model.AmigoMelvin;
import br.com.melvin.sistema.services.AmigoMelvinService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/amigomelvin")
public class AmigoMelvinController {
    
    @Autowired
    AmigoMelvinService service;

    @GetMapping
    public List<AmigoMelvin> listar(){
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody AmigoMelvin amigomelvin) {
        return service.adicionar(amigomelvin);
    }
    
    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody AmigoMelvin amigomelvin) {
        return service.alterar(amigomelvin);
    }
}
