package br.com.melvin.sistema.repository;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.Cestas;

public interface CestasRepository extends JpaRepository<Cestas, UUID>{
    Cestas findByNomeAndDataEntrega(String nome, LocalDate dataEntrega);

    void deleteByNomeAndDataEntrega(String nome, LocalDate dataEntrega);
}
