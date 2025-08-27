package br.com.melvin.sistema.repository.frequencias;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.melvin.sistema.model.frequencias.FrequenciaDiscente;


public interface FrequenciaDiscenteRepository extends JpaRepository<FrequenciaDiscente, UUID>{
    FrequenciaDiscente findByMatriculaAndData(String matricula, LocalDate data);
    void deleteByMatriculaAndData(String matricula, LocalDate data);
    List<FrequenciaDiscente> findAllByData(LocalDate data);

    @Query("SELECT COUNT(DISTINCT f.matricula) FROM FrequenciaDiscente f WHERE f.data = :data AND (f.presenca_manha = 'P' OR f.presenca_tarde = 'P')")
    Long countPresentesByData(@Param("data") LocalDate data);
}
