package br.com.melvin.sistema.model.frequencias;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class FrequenciaDiscente{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private Integer sala;

    @Column(nullable = false)
    private String matricula;

    @Column(nullable = false)
	private String nome;

    @Column(nullable = false)
	private String presenca_manha;

    @Column(nullable = false)
	private String presenca_tarde;

    @Column(nullable = false)
	private LocalDate data;

    private String justificativa;

}
