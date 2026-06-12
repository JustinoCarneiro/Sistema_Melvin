package br.com.melvin.sistema.domain.calendario.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "dia_nao_letivo")
@Getter
@Setter
public class DiaNaoLetivo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private LocalDate data;

    @Column(nullable = false)
    private String descricao;
}
