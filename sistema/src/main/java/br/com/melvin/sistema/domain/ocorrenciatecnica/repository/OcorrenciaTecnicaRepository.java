package br.com.melvin.sistema.domain.ocorrenciatecnica.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.ocorrenciatecnica.model.OcorrenciaTecnica;

public interface OcorrenciaTecnicaRepository extends JpaRepository<OcorrenciaTecnica, UUID> {
    List<OcorrenciaTecnica> findAllByOrderByDataOcorrenciaDescCriadoEmDesc();
}
