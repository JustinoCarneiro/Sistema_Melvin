package br.com.melvin.sistema.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.Embaixador;


public interface EmbaixadorRepository extends JpaRepository<Embaixador, UUID>{
    Embaixador findByNome(String nome);
}
