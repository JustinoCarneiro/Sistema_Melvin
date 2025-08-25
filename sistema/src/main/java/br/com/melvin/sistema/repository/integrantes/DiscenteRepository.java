package br.com.melvin.sistema.repository.integrantes;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // Certifique-se de que este import está presente
import br.com.melvin.sistema.model.integrantes.Discente;

public interface DiscenteRepository extends JpaRepository<Discente, UUID>{
    Discente findByMatricula(String matricula);
    Discente findByNome(String nome);
    void deleteByMatricula(String matricula);
    List<Discente> findAllBySala(Integer sala);
    Discente findTopByOrderByMatriculaDesc();

    @Query("SELECT d FROM Discente d WHERE " +
           "(:search IS NULL OR LOWER(d.nome) LIKE LOWER(CONCAT('%', :search, '%')) OR d.matricula LIKE %:search% OR d.rg LIKE %:search% " +
           "OR LOWER(d.nome_pai) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.nome_mae) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Discente> searchByTerm(@Param("search") String search);
}