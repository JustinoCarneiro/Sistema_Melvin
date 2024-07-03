package br.com.melvin.sistema.repository.integrantes;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.melvin.sistema.model.integrantes.Voluntario;

public interface VoluntarioRepository extends JpaRepository<Voluntario, UUID>{
    Voluntario findByMatricula(String matricula);

    void deleteByMatricula(String matricula);

    @Query("SELECT v FROM Voluntario v ORDER BY v.matricula DESC")
    Voluntario findTopByOrderByMatriculaDesc();
}
