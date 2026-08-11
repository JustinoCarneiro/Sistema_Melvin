package br.com.melvin.sistema.domain.ocorrencia.model;

import java.time.LocalDate;
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

// US-3.7: histórico de observações comportamentais/pedagógicas por aluno.
@Getter
@Setter
@Entity
@Table(name = "ocorrencia")
public class Ocorrencia {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String matricula_discente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaOcorrencia categoria;

    // Observação comportamental/pedagógica de menor — mesmo tratamento LGPD dos
    // demais dados sensíveis do Discente (doenca, medicacao, contato_pai etc).
    @Convert(converter = SensitiveDataConverter.class)
    @Column(columnDefinition = "TEXT", nullable = false)
    private String descricao;

    // Login (matrícula) do autor logado, não UUID — evita join só pra exibir "quem registrou".
    @Column(nullable = false)
    private String autor_login;

    @Column(nullable = false)
    private LocalDate data_ocorrencia;

    @Column(nullable = false)
    private LocalDateTime criado_em;
}
