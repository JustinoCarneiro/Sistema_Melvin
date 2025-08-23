package br.com.melvin.sistema.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.melvin.sistema.model.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {
    List<Avaliacao> findByDiscenteMatricula(String matricula);
    List<Avaliacao> findByDiscenteMatriculaAndNomeAula(String matricula, String nomeAula);
}