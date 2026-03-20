package br.com.melvin.sistema.domain.cestas.controller;

import java.util.List;
import java.util.UUID; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; 
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.service.CestasService;

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
        // O serviço vai verificar se o ID está dentro do objeto 'cesta'
        return service.alterar(cesta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable UUID id) {
        return service.remover(id);
    }
}