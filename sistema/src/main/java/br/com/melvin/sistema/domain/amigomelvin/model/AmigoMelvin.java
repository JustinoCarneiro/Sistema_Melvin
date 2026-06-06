package br.com.melvin.sistema.domain.amigomelvin.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import br.com.melvin.sistema.shared.security.SensitiveDataConverter;

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
    @Convert(converter = SensitiveDataConverter.class)
    private String contato;

    @Convert(converter = SensitiveDataConverter.class)
    private String email;

    // Blind index (HMAC) do e-mail para permitir deduplicação sem descriptografar.
    @Column(name = "email_hash")
    private String emailHash;

    @Convert(converter = SensitiveDataConverter.class)
    private String cpf;

    // Blind index (HMAC) do CPF (apenas dígitos) para deduplicação por doador.
    @Column(name = "cpf_hash")
    private String cpfHash;

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

    @Column(name = "last_processed_invoice_id")
    private String lastProcessedInvoiceId;

    private String diaPreferido;

    @Column(columnDefinition = "TEXT")
    private String mensagem;
}
