package br.com.melvin.sistema.controller.integrantes;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import br.com.melvin.sistema.dto.VoluntarioDTO;
import br.com.melvin.sistema.model.integrantes.Voluntario;
import br.com.melvin.sistema.services.integrantes.VoluntarioService;

@RestController
@RequestMapping("/voluntario")
public class VoluntarioController {

    @Autowired
    private VoluntarioService service;

    @GetMapping
    public List<Voluntario> listar(){
        return service.listar();
    }

    @GetMapping("/nomesfuncoes")
    public ResponseEntity<List<VoluntarioDTO>> listarVoluntariosComNomeFuncao() {
        List<VoluntarioDTO> voluntarios = service.listarVoluntariosComNomeFuncao();
        return ResponseEntity.ok(voluntarios);
    }

    @GetMapping("/matricula/{matricula}")
    public Voluntario capturaPorMatricula(@PathVariable String matricula){
        return service.capturaPorMatricula(matricula);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Voluntario voluntario){
        return service.cadastrar(voluntario);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Voluntario voluntario){
        return service.alterar(voluntario);
    }

    @DeleteMapping("/{matricula}")
    public ResponseEntity<String> deletar(@PathVariable String matricula){
        return service.remover(matricula);
    }
}
