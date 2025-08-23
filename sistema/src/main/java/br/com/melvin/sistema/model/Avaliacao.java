package br.com.melvin.sistema.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import br.com.melvin.sistema.model.integrantes.Discente;

@Getter
@Setter
@Entity
@Table(name="avaliacao")
public class Avaliacao {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "discente_id", nullable = false)
    private Discente discente;

    @Column(nullable = false)
    private String nomeAula;

    // ALTERAÇÃO AQUI: De Integer para Double
    @Column(nullable = false)
    private Double nota; 

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = true)
    private String comentario;
}