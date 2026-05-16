package br.com.melvin.sistema.domain.amigomelvin.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import br.com.melvin.sistema.shared.security.SensitiveDataConverter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name="doacao_item")
public class DoacaoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    @Convert(converter = SensitiveDataConverter.class)
    private String telefone;

    @Column(nullable = false)
    private String tipoItem;

    private String observacao;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;
}
