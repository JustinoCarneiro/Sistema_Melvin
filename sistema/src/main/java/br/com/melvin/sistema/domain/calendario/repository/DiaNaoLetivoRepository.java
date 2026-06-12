package br.com.melvin.sistema.domain.calendario.repository;

import br.com.melvin.sistema.domain.calendario.model.DiaNaoLetivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DiaNaoLetivoRepository extends JpaRepository<DiaNaoLetivo, UUID> {
    List<DiaNaoLetivo> findByDataBetween(LocalDate start, LocalDate end);
    DiaNaoLetivo findByData(LocalDate data);
}
