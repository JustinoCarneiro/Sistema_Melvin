package br.com.melvin.sistema.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.AmigoMelvin;


public interface AmigoMelvinRepository extends JpaRepository<AmigoMelvin, UUID>{
    AmigoMelvin findByNome(String nome);
}
