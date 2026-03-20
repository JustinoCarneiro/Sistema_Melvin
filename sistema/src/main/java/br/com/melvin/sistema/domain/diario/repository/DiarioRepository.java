package br.com.melvin.sistema.domain.diario.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.diario.model.Diario;

public interface DiarioRepository extends JpaRepository<Diario, UUID>{
    Diario findByMatriculaAtrelada(String matriculaAtrelada);
}
