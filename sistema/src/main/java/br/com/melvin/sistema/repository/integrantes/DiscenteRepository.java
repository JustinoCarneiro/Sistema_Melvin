package br.com.melvin.sistema.repository.integrantes;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.melvin.sistema.model.integrantes.Discente;

public interface DiscenteRepository extends JpaRepository<Discente, UUID>{
    Discente findByMatricula(String matricula);

    void deleteByMatricula(String matricula);

    List<Discente> findAllBySala(Integer sala);

    @Query("SELECT d FROM Discente d ORDER BY d.matricula DESC")
    Discente findTopByOrderByMatriculaDesc();
}
