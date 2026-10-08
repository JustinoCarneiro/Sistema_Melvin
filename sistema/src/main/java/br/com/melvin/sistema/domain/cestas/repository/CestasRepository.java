package br.com.melvin.sistema.domain.cestas.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;

public interface CestasRepository extends JpaRepository<Cestas, UUID>{
    Cestas findByNomeAndDataEntrega(String nome, LocalDate dataEntrega);

    void deleteByNomeAndDataEntrega(String nome, LocalDate dataEntrega);

    // US-7.4
    List<Cestas> findAllByStatus(StatusCesta status);

    // Cadastros legados de entrada/saída não participam do fluxo de solicitações.
    List<Cestas> findAllByStatusIsNull();

    // US-7.4 (reintroduzido): check-in por QR Code
    Cestas findByQrCodeToken(String qrCodeToken);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Cestas c
               set c.status = :statusAgendada,
                   c.dataRetirada = :dataRetirada,
                   c.qrCodeToken = :qrCodeToken
             where c.id = :id
               and c.status = :statusSolicitada
            """)
    int agendarSeSolicitada(
            @Param("id") UUID id,
            @Param("statusSolicitada") StatusCesta statusSolicitada,
            @Param("statusAgendada") StatusCesta statusAgendada,
            @Param("dataRetirada") LocalDate dataRetirada,
            @Param("qrCodeToken") String qrCodeToken);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Cestas c
               set c.status = :statusCancelada,
                   c.qrCodeToken = null
             where c.id = :id
               and c.status = :statusEsperado
            """)
    int cancelarSeStatusAtual(
            @Param("id") UUID id,
            @Param("statusEsperado") StatusCesta statusEsperado,
            @Param("statusCancelada") StatusCesta statusCancelada);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Cestas c
               set c.status = :statusEntregue,
                   c.entregueEm = :entregueEm
             where c.id = :id
               and c.status = :statusAgendada
            """)
    int confirmarEntregaSeAgendada(
            @Param("id") UUID id,
            @Param("statusAgendada") StatusCesta statusAgendada,
            @Param("statusEntregue") StatusCesta statusEntregue,
            @Param("entregueEm") LocalDateTime entregueEm);
}
