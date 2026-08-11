package br.com.melvin.sistema.domain.cestas.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

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
@Table(name="cestas")
public class Cestas {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String operacao;
    private String nome;
    @Convert(converter = SensitiveDataConverter.class)
    private String cpf; 
    @Convert(converter = SensitiveDataConverter.class)
    private String contato;
    
    private Boolean voluntario;

    // --- Campos Eclesiásticos ---
    private String rede;
    private String lider_celula;
    private String pastor_rede;
    private String responsavel;

    // --- Campos da Doação ---
    private String itens_doados;
    private String tipo;         
    private Double peso;        
    private String frequencia;   
    
    // REMOVIDO: private Boolean status;
    private LocalDate dataEntrega;

    // --- US-7.4: Solicitação com agendamento e check-in por QR Code ---
    // status é null pra registros antigos (cadastro direto, sem fluxo de solicitação).
    @Enumerated(EnumType.STRING)
    private StatusCesta status;

    // Quem preencheu o link público (pode ser qualquer nível da hierarquia,
    // não só o supervisor de setor) e a célula/beneficiário continua identificado
    // pelos campos já existentes (rede, lider_celula).
    private String nomeSolicitante;

    @Enumerated(EnumType.STRING)
    private NivelHierarquico nivelSolicitante;

    private LocalDate dataRetirada;
    private String qrCodeToken;
    private LocalDateTime entregueEm;
}