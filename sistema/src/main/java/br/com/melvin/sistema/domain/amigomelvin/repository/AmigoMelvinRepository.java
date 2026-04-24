package br.com.melvin.sistema.domain.amigomelvin.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;


public interface AmigoMelvinRepository extends JpaRepository<AmigoMelvin, UUID>{
    AmigoMelvin findByNome(String nome);
    AmigoMelvin findBySubscriptionId(String subscriptionId);
}
