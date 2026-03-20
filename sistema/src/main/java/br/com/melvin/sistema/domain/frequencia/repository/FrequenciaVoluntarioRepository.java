package br.com.melvin.sistema.domain.frequencia.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.frequencia.model.FrequenciaVoluntario;
import java.util.List;
import java.util.UUID;


public interface FrequenciaVoluntarioRepository extends JpaRepository<FrequenciaVoluntario, UUID>{
    FrequenciaVoluntario findByMatriculaAndData(String matricula, LocalDate data);
    void deleteByMatriculaAndData(String matricula, LocalDate data);
    List<FrequenciaVoluntario> findAllByData(LocalDate data);
}
