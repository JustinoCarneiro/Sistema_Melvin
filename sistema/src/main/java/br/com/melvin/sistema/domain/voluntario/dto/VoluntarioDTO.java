package br.com.melvin.sistema.domain.voluntario.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoluntarioDTO {
    private String nome;
    private String funcao;

    public VoluntarioDTO(String nome, String funcao) {
        this.nome = nome;
        this.funcao = funcao;
    }
}
