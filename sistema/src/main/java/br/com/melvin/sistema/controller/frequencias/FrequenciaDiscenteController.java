package br.com.melvin.sistema.controller.frequencias;

import java.time.LocalDate;
import java.util.List;

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

import br.com.melvin.sistema.model.frequencias.FrequenciaDiscente;
import br.com.melvin.sistema.services.frequencias.FrequenciaDiscenteService;


@RestController
@RequestMapping("/frequenciadiscente")
public class FrequenciaDiscenteController {
    @Autowired
    private FrequenciaDiscenteService service;

    @GetMapping
    public List<FrequenciaDiscente> listar(){
        return service.listar();
    }

    @GetMapping("/{data}")
    public List<FrequenciaDiscente> listarFrequenciaPorData(@PathVariable LocalDate data){
        return service.listarFrequenciaPorData(data);
    }

    @GetMapping("/{data}/{matricula}")
    public FrequenciaDiscente capturarFrequencia(@PathVariable  String matricula, @PathVariable LocalDate data) {
        return service.capturarFrequencia(matricula, data);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody FrequenciaDiscente frequencia){
        return service.cadastrar(frequencia);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody FrequenciaDiscente frequencia){
        return service.alterar(frequencia);
    }

    @DeleteMapping("/{matricula}/{data}")
    public ResponseEntity<String> remover(@PathVariable String matricula, @PathVariable LocalDate data){
        return service.remover(matricula, data);
    }
}
