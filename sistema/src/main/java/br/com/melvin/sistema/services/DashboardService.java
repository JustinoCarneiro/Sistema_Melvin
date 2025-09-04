package br.com.melvin.sistema.services;

import br.com.melvin.sistema.dto.AlunoRankingDTO;
import br.com.melvin.sistema.model.Aviso;
import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.repository.AvisoRepository;
import br.com.melvin.sistema.repository.frequencias.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.repository.integrantes.DiscenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    public List<Aviso> getAvisosAtivos() {
        return avisoRepository.findAll().stream()
                .filter(Aviso::getStatus)
                .collect(Collectors.toList());
    }

    // MÉTODO DE RANKING ATUALIZADO PARA ACEITAR ORDENAÇÃO
    public List<AlunoRankingDTO> getRankingAlunos(int limit, String sortBy) {
        List<Discente> todosDiscentes = discenteRepository.findAll();

        // Define o comparador com base no critério 'sortBy'
        Comparator<Discente> comparator = switch (sortBy) {
            case "presenca" -> Comparator.comparing(Discente::getAvaliacaoPresenca, Comparator.nullsLast(Comparator.naturalOrder()));
            case "participacao" -> Comparator.comparing(Discente::getAvaliacaoParticipacao, Comparator.nullsLast(Comparator.naturalOrder()));
            case "comportamento" -> Comparator.comparing(Discente::getAvaliacaoComportamento, Comparator.nullsLast(Comparator.naturalOrder()));
            case "rendimento" -> Comparator.comparing(Discente::getAvaliacaoRendimento, Comparator.nullsLast(Comparator.naturalOrder()));
            case "psicologico" -> Comparator.comparing(Discente::getAvaliacaoPsicologico, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> null; // Será usado para a média geral
        };

        Stream<AlunoRankingDTO> rankingStream;

        if (comparator != null) {
            // Ordena diretamente pela categoria específica
            rankingStream = todosDiscentes.stream()
                .sorted(comparator.reversed()) // .reversed() para pegar os maiores primeiro
                .map(discente -> new AlunoRankingDTO(
                    discente.getNome(),
                    discente.getMatricula(),
                    getNotaPorCategoria(discente, sortBy) // Pega a nota da categoria específica
                ));
        } else {
            rankingStream = todosDiscentes.stream()
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
                .sorted(Comparator.comparing(AlunoRankingDTO::getMediaGeral).reversed());
        }

        return rankingStream.limit(limit).collect(Collectors.toList());
    }

    // Método auxiliar para pegar a nota da categoria correta
    private Double getNotaPorCategoria(Discente discente, String categoria) {
        return switch (categoria) {
            case "presenca" -> discente.getAvaliacaoPresenca();
            case "participacao" -> discente.getAvaliacaoParticipacao();
            case "comportamento" -> discente.getAvaliacaoComportamento();
            case "rendimento" -> discente.getAvaliacaoRendimento();
            case "psicologico" -> discente.getAvaliacaoPsicologico();
            default -> 0.0;
        };
    }
}