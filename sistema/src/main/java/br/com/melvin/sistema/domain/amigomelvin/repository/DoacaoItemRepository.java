package br.com.melvin.sistema.domain.amigomelvin.repository;

import br.com.melvin.sistema.domain.amigomelvin.model.DoacaoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DoacaoItemRepository extends JpaRepository<DoacaoItem, UUID> {
}
