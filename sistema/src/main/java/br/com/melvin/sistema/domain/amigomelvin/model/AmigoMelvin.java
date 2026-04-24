package br.com.melvin.sistema.domain.amigomelvin.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private BigDecimal valorMensal;

    @Enumerated(EnumType.STRING)
    private DonorStatus status;

    private String stripeCustomerId;

    private String subscriptionId;

    private Integer mesesContribuindo;

    private LocalDateTime dataInicio;
}
