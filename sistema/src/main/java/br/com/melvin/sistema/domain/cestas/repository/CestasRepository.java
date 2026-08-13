package br.com.melvin.sistema.domain.cestas.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;

public interface CestasRepository extends JpaRepository<Cestas, UUID>{
    Cestas findByNomeAndDataEntrega(String nome, LocalDate dataEntrega);

    void deleteByNomeAndDataEntrega(String nome, LocalDate dataEntrega);

    // US-7.4
    List<Cestas> findAllByStatus(StatusCesta status);

    // US-7.4 (reintroduzido): check-in por QR Code
    Cestas findByQrCodeToken(String qrCodeToken);
}
