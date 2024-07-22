package br.com.melvin.sistema.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.Imagem;


public interface ImagemRepository extends JpaRepository<Imagem, UUID>{
    Imagem findByIdAtreladoAndTipo(UUID idAtrelado, String tipo);
}
