package br.com.melvin.sistema.domain.embaixador.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorCadastroDTO;
import br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorPublicoDTO;
import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import br.com.melvin.sistema.domain.embaixador.service.EmbaixadorService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/embaixador")
public class EmbaixadorController {
    
    @Autowired
    EmbaixadorService service;

    @GetMapping
    public List<Embaixador> listar(){
        return service.listar();
    }

    @GetMapping("/publicos")
    public List<EmbaixadorPublicoDTO> listarPublicos(){
        return service.listarPublicos();
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody @Valid EmbaixadorCadastroDTO dados) {
        return service.cadastrar(dados);
    }
    
    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Embaixador embaixador) {
        return service.alterar(embaixador);
    }
}
