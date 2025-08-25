package br.com.melvin.sistema.repository.integrantes;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import br.com.melvin.sistema.model.integrantes.Voluntario;
import java.util.List; // Importe a List

public interface VoluntarioRepository extends JpaRepository<Voluntario, UUID> {
    Voluntario findByMatricula(String matricula);
    Voluntario findTopByOrderByMatriculaDesc();
    void deleteByMatricula(String matricula);

    @Query("SELECT v FROM Voluntario v WHERE " +
           "(:search IS NULL OR LOWER(v.nome) LIKE LOWER(CONCAT('%', :search, '%')) OR v.matricula LIKE %:search% " +
           "OR LOWER(v.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Voluntario> searchByTerm(@Param("search") String search);
}