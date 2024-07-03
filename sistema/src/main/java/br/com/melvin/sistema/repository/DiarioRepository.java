package br.com.melvin.sistema.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.Diario;

public interface DiarioRepository extends JpaRepository<Diario, UUID>{
    Diario findByMatriculaAtrelada(String matriculaAtrelada);
}
