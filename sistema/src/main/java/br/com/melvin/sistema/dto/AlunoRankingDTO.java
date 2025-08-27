package br.com.melvin.sistema.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlunoRankingDTO {
    private String nome;
    private String matricula;
    private Double mediaGeral;

    public AlunoRankingDTO(String nome, String matricula, Double mediaGeral) {
        this.nome = nome;
        this.matricula = matricula;
        this.mediaGeral = mediaGeral;
    }
}