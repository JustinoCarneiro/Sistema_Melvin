package br.com.melvin.sistema.services;

import br.com.melvin.sistema.dto.AlunoRankingDTO;
import br.com.melvin.sistema.model.Aviso;
import br.com.melvin.sistema.repository.AvisoRepository;
import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.repository.frequencias.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.repository.integrantes.DiscenteRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private FrequenciaDiscenteRepository frequenciaRepository;

    @Autowired
    private AvisoRepository avisoRepository;

    @Autowired
    private DiscenteRepository discenteRepository;

    public Long getAlunosPresentesHoje() {
        return frequenciaRepository.countPresentesByData(LocalDate.now());
    }

    // 4. Adicione o novo método para buscar avisos ativos
    public List<Aviso> getAvisosAtivos() {
        return avisoRepository.findAll().stream()
                .filter(Aviso::getStatus) // Filtra para manter apenas os que têm status == true
                .collect(Collectors.toList());
    }

    public List<AlunoRankingDTO> getRankingAlunos(int limit) {
        List<Discente> todosDiscentes = discenteRepository.findAll();

        return todosDiscentes.stream()
                .map(discente -> {
                    double media = (
                        (discente.getAvaliacaoPresenca() != null ? discente.getAvaliacaoPresenca() : 0.0) +
                        (discente.getAvaliacaoParticipacao() != null ? discente.getAvaliacaoParticipacao() : 0.0) +
                        (discente.getAvaliacaoComportamento() != null ? discente.getAvaliacaoComportamento() : 0.0) +
                        (discente.getAvaliacaoRendimento() != null ? discente.getAvaliacaoRendimento() : 0.0) +
                        (discente.getAvaliacaoPsicologico() != null ? discente.getAvaliacaoPsicologico() : 0.0)
                    ) / 5.0;
                    return new AlunoRankingDTO(discente.getNome(), discente.getMatricula(), media);
                })
                .sorted(Comparator.comparing(AlunoRankingDTO::getMediaGeral).reversed()) // Ordena pela maior média
                .limit(limit)
                .collect(Collectors.toList());
    }
}