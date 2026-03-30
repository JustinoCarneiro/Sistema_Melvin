package br.com.melvin.sistema.domain.permissao.repository;

import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

public interface PermissaoRegraRepository extends JpaRepository<PermissaoRegra, UUID> {
    Optional<PermissaoRegra> findByNomeRegra(String nomeRegra);
}
