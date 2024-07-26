package br.com.melvin.sistema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.model.Aviso;
import br.com.melvin.sistema.services.AvisoService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/aviso")
public class AvisoController {
    @Autowired
    AvisoService service;

    @GetMapping
    public List<Aviso> listar(){
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Aviso aviso) {
        return service.adicionar(aviso);
    }
    
    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Aviso aviso) {
        return service.alterar(aviso);
    }
    
}
