package br.com.melvin.sistema.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="aviso")
public class Aviso {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private String corpo;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    private LocalDate data_inicio;

    @Column(nullable = true)
    private LocalDate data_final;
}
