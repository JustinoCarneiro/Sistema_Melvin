package br.com.melvin.sistema.domain.ocorrenciatecnica.model;

import java.time.LocalDate;
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

// Registro de achados técnicos do próprio sistema (bugs, incidentes, decisões técnicas,
// manutenção, segurança) — exclusivo do cargo TECH (US-1.5), separado da administração real
// do Instituto. Diferente de Ocorrencia (US-3.7, sobre alunos), aqui não há
// SensitiveDataConverter: é dado técnico interno, não dado pessoal sujeito à LGPD.
@Getter
@Setter
@Entity
@Table(name = "ocorrencia_tecnica")
public class OcorrenciaTecnica {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaOcorrenciaTecnica categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeveridadeOcorrenciaTecnica severidade;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @Column(nullable = false)
    private boolean resolvido;

    // Login (matrícula) do autor logado, não UUID — mesmo padrão de Ocorrencia (evita join só
    // pra exibir "quem registrou").
    @Column(nullable = false)
    private String autorLogin;

    @Column(nullable = false)
    private LocalDate dataOcorrencia;

    @Column(nullable = false)
    private LocalDateTime criadoEm;
}
