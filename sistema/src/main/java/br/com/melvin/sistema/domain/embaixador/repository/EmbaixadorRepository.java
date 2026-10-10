package br.com.melvin.sistema.domain.embaixador.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorPublicoDTO;
import br.com.melvin.sistema.domain.embaixador.model.Embaixador;


public interface EmbaixadorRepository extends JpaRepository<Embaixador, UUID>{
    Embaixador findByNome(String nome);

    // Projeção só com o que o site público mostra: contato, e-mail e Instagram nem são carregados.
    @Query("select new br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorPublicoDTO(e.id, e.nome, e.descricao) from Embaixador e where e.status = true")
    List<EmbaixadorPublicoDTO> findPublicos();
}
