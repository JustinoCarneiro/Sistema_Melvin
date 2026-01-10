package br.com.melvin.sistema.controller.frequencias;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.model.frequencias.FrequenciaDiscente;
import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.services.frequencias.FrequenciaDiscenteService;
import br.com.melvin.sistema.services.ExcelExportService;
import br.com.melvin.sistema.services.integrantes.DiscenteService;

@RestController
@RequestMapping("/frequenciadiscente")
public class FrequenciaDiscenteController {

    @Autowired
    private FrequenciaDiscenteService service;
    
    @Autowired
    private ExcelExportService excelExportService; // Serviço de Excel adicionado

    @Autowired
    private DiscenteService discenteService; // Serviço de Discentes adicionado

    @GetMapping
    public List<FrequenciaDiscente> listar(){
        return service.listar();
    }

    @GetMapping("/{data}")
    public List<FrequenciaDiscente> listarFrequenciaPorData(@PathVariable LocalDate data){
        return service.listarFrequenciaPorData(data);
    }

    @GetMapping("/{data}/{matricula}")
    public FrequenciaDiscente capturarFrequencia(@PathVariable String matricula, @PathVariable LocalDate data) {
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

    // --- Endpoint de Exportação ---
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportarFrequencias(
            @RequestParam int mes,
            @RequestParam int ano,
            @RequestParam(required = false) String sala,
            @RequestParam(required = false) String turno,
            @RequestParam(required = false) String busca
    ) throws IOException {
        
        // 1. Buscar todos os alunos e filtrar (igual ao frontend)
        List<Discente> todosAlunos = discenteService.listar(); 
        List<Discente> alunosFiltrados = todosAlunos.stream()
            .filter(a -> (sala == null || sala.equals("todos") || String.valueOf(a.getSala()).equals(sala)))
            .filter(a -> (turno == null || turno.equals("todos") || (a.getTurno() != null && a.getTurno().equalsIgnoreCase(turno))))
            .filter(a -> (busca == null || a.getNome().toLowerCase().contains(busca.toLowerCase())))
            .collect(Collectors.toList());

        // 2. Buscar todas as frequências
        List<FrequenciaDiscente> todasFrequencias = service.listar();

        // 3. Gerar Excel
        ByteArrayInputStream in = excelExportService.exportarFrequencia(alunosFiltrados, todasFrequencias, mes, ano);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=frequencia_" + mes + "_" + ano + ".xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }
}