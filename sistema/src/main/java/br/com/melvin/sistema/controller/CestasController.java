package br.com.melvin.sistema.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.model.Cestas;
import br.com.melvin.sistema.services.CestasService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/cestas")
public class CestasController {

    @Autowired
    private CestasService service;

    @GetMapping
    public List<Cestas> listar(){
        return service.listar();
    }
    
    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Cestas cesta){
        return service.adicionar(cesta);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Cestas cesta){
        return service.alterar(cesta);
    }

    @DeleteMapping
    public ResponseEntity<String> deletar(@RequestBody Cestas cesta){
        return service.remover(cesta);
    }
}
