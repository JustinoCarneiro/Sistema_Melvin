package br.com.melvin.sistema.domain.ocorrencia.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {
    // Nome do método derivado evitado propositalmente: os campos da entidade têm
    // underscore no nome (matricula_discente, data_ocorrencia, criado_em), o que
    // deixaria a derivação automática do Spring Data ambígua — mesmo padrão já
    // usado em FrequenciaDiscenteRepository para campos como presenca_manha.
    @Query("SELECT o FROM Ocorrencia o WHERE o.matricula_discente = :matricula ORDER BY o.data_ocorrencia DESC, o.criado_em DESC")
    List<Ocorrencia> findAllByMatriculaOrdenadoPorDataDesc(@Param("matricula") String matricula);
}
