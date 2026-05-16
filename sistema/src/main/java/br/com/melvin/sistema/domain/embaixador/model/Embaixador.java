package br.com.melvin.sistema.domain.embaixador.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
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
@Table(name="embaixador")
public class Embaixador {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Convert(converter = SensitiveDataConverter.class)
    private String instagram;

    @Column(nullable = false)
    @Convert(converter = SensitiveDataConverter.class)
    private String contato;

    @Convert(converter = SensitiveDataConverter.class)
    private String email;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    private Boolean contatado;

    @Column(nullable = true)
    private String apelido;

    @Column(nullable = true)
    private String descricao;
}
