package br.com.melvin.sistema.controller;

import br.com.melvin.sistema.dto.AlunoRankingDTO;
import br.com.melvin.sistema.model.Aviso; 
import br.com.melvin.sistema.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService service;

    @GetMapping("/presentes")
    public Map<String, Long> getAlunosPresentesHoje() {
        return Map.of("presentes", service.getAlunosPresentesHoje());
    }

    @GetMapping("/ranking")
    public List<AlunoRankingDTO> getRankingAlunos(@RequestParam(defaultValue = "media") String sortBy) {
        return service.getRankingAlunos(5, sortBy); // Retorna o Top 5
    }

    // 2. Adicione o novo endpoint para buscar os avisos ativos
    @GetMapping("/avisos")
    public List<Aviso> getAvisosAtivos() {
        return service.getAvisosAtivos();
    }
}