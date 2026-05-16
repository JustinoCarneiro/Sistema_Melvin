package br.com.melvin.sistema.domain.voluntario.dto;

import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoluntarioListagemDTO {
    private String matricula;
    private String nome;
    private String funcao;
    private String email;
    private String status;

    public VoluntarioListagemDTO(Voluntario voluntario) {
        this.matricula = voluntario.getMatricula();
        this.nome = voluntario.getNome();
        this.funcao = voluntario.getFuncao();
        this.email = voluntario.getEmail();
        this.status = voluntario.getStatus();
    }
}
