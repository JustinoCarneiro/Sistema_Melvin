package br.com.melvin.sistema.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiscenteAvaliacaoDTO {
    private Double avaliacaoPresenca;
    private Double avaliacaoParticipacao;
    private Double avaliacaoComportamento;
    private Double avaliacaoRendimento;
    private Double avaliacaoPsicologico;
}