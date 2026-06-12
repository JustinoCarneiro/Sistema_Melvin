package br.com.melvin.sistema.domain.calendario.controller;

import br.com.melvin.sistema.domain.calendario.model.DiaNaoLetivo;
import br.com.melvin.sistema.domain.calendario.service.DiaNaoLetivoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/dias-nao-letivos")
public class DiaNaoLetivoController {

    @Autowired
    private DiaNaoLetivoService service;

    @GetMapping
    public List<DiaNaoLetivo> listar(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano
    ) {
        if (mes != null && ano != null) {
            return service.listarPorMes(mes, ano);
        }
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody DiaNaoLetivo diaNaoLetivo) {
        return service.cadastrar(diaNaoLetivo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remover(@PathVariable UUID id) {
        return service.remover(id);
    }
}
