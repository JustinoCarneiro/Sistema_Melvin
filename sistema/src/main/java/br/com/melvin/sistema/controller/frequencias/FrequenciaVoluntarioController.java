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

import br.com.melvin.sistema.model.frequencias.FrequenciaVoluntario;
import br.com.melvin.sistema.services.frequencias.FrequenciaVoluntarioService;

@RestController
@RequestMapping("/frequenciavoluntario")
public class FrequenciaVoluntarioController {
    @Autowired
    private FrequenciaVoluntarioService service;

    @GetMapping
    public List<FrequenciaVoluntario> listar(){
        return service.listar();
    }

    @GetMapping("/{data}")
    public List<FrequenciaVoluntario> listarFrequenciaPorData(@PathVariable LocalDate data){
        return service.listarFrequenciaPorData(data);
    }

    @GetMapping("/{data}/{matricula}")
    public FrequenciaVoluntario capturarFrequencia(@PathVariable  String matricula, @PathVariable LocalDate data) {
        return service.capturarFrequencia(matricula, data);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody FrequenciaVoluntario frequencia){
        return service.cadastrar(frequencia);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody FrequenciaVoluntario frequencia){
        return service.alterar(frequencia);
    }

    @DeleteMapping("/{matricula}/{data}")
    public ResponseEntity<String> remover(@PathVariable String matricula, @PathVariable LocalDate data){
        return service.remover(matricula, data);
    }
}
