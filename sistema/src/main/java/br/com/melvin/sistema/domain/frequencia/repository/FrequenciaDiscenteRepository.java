package br.com.melvin.sistema.domain.frequencia.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import br.com.melvin.sistema.domain.frequencia.dto.FaltaAlertaDTO;


public interface FrequenciaDiscenteRepository extends JpaRepository<FrequenciaDiscente, UUID>{
    FrequenciaDiscente findByMatriculaAndData(String matricula, LocalDate data);
    void deleteByMatriculaAndData(String matricula, LocalDate data);
    List<FrequenciaDiscente> findAllByData(LocalDate data);

    @Query("SELECT COUNT(DISTINCT f.matricula) FROM FrequenciaDiscente f WHERE f.data = :data AND (f.presenca_manha = 'P' OR f.presenca_tarde = 'P')")
    Long countPresentesByData(@Param("data") LocalDate data);

    @Query("SELECT new br.com.melvin.sistema.domain.frequencia.dto.FaltaAlertaDTO(f.matricula, COUNT(f.id)) FROM FrequenciaDiscente f WHERE f.data >= :inicioMes AND f.data <= :fimMes AND (f.presenca_manha = 'F' OR f.presenca_tarde = 'F') GROUP BY f.matricula HAVING COUNT(f.id) >= 3")
    List<FaltaAlertaDTO> findMatriculasComTresOuMaisFaltas(@Param("inicioMes") LocalDate inicioMes, @Param("fimMes") LocalDate fimMes);
}
