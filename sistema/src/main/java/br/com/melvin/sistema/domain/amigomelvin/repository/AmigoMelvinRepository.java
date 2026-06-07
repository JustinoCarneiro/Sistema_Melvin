package br.com.melvin.sistema.domain.amigomelvin.repository;

import java.util.Collection;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.model.DonorStatus;


public interface AmigoMelvinRepository extends JpaRepository<AmigoMelvin, UUID>{
    AmigoMelvin findByNome(String nome);
    AmigoMelvin findBySubscriptionId(String subscriptionId);
    AmigoMelvin findByStripeCustomerId(String stripeCustomerId);
    AmigoMelvin findFirstByCpfHashAndStatusIn(String cpfHash, Collection<DonorStatus> statuses);
    AmigoMelvin findFirstByCpfHashOrderByDataInicioDesc(String cpfHash);
}
