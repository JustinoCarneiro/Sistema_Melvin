package br.com.melvin.sistema.domain.discente.dto;

import br.com.melvin.sistema.domain.discente.model.Discente;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscenteListagemDTO {
    private String matricula;
    private String nome;
    private String nome_pai;
    private String nome_mae;
    private String status;
    private Integer sala;

    public DiscenteListagemDTO(Discente discente) {
        this.matricula = discente.getMatricula();
        this.nome = discente.getNome();
        this.nome_pai = discente.getNome_pai();
        this.nome_mae = discente.getNome_mae();
        this.status = discente.getStatus();
        this.sala = discente.getSala();
    }
}
