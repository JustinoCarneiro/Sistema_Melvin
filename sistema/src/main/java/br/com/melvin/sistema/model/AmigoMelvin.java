package br.com.melvin.sistema.model;

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
@Table(name="amigomelvin")
public class AmigoMelvin {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String contato;

    private String email;

    @Column(nullable = false)
    private String formaPagamento;

    @Column(nullable = false)
    private String valorMensal;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    private Boolean contatado;
}
