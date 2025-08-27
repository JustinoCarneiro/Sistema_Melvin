package br.com.melvin.sistema.services;

import br.com.melvin.sistema.dto.AlunoRankingDTO;
import br.com.melvin.sistema.model.Avaliacao;
import br.com.melvin.sistema.repository.AvaliacaoRepository;
import br.com.melvin.sistema.repository.frequencias.FrequenciaDiscenteRepository;
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
    private AvaliacaoRepository avaliacaoRepository;

    public Long getAlunosPresentesHoje() {
        return frequenciaRepository.countPresentesByData(LocalDate.now());
    }

    public List<AlunoRankingDTO> getRankingAlunos(int limit) {
        List<Avaliacao> todasAvaliacoes = avaliacaoRepository.findAll();

        Map<String, Double> mediaPorAluno = todasAvaliacoes.stream()
                .collect(Collectors.groupingBy(
                        avaliacao -> avaliacao.getDiscente().getMatricula(),
                        Collectors.averagingDouble(Avaliacao::getNota)
                ));

        return mediaPorAluno.entrySet().stream()
                .map(entry -> {
                    String nome = todasAvaliacoes.stream()
                            .filter(a -> a.getDiscente().getMatricula().equals(entry.getKey()))
                            .findFirst()
                            .map(a -> a.getDiscente().getNome())
                            .orElse("N/A");
                    return new AlunoRankingDTO(nome, entry.getKey(), entry.getValue());
                })
                .sorted(Comparator.comparing(AlunoRankingDTO::getMediaGeral).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }
}