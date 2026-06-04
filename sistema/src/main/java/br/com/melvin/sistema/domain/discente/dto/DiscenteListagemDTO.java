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
    private String turno;
    private boolean ingles;
    private boolean karate;
    private boolean informatica;
    private boolean musica;
    private boolean teatro;
    private boolean ballet;
    private boolean futsal;
    private boolean artesanato;

    public DiscenteListagemDTO(Discente discente) {
        this.matricula = discente.getMatricula();
        this.nome = discente.getNome();
        this.nome_pai = discente.getNome_pai();
        this.nome_mae = discente.getNome_mae();
        this.status = discente.getStatus();
        this.sala = discente.getSala();
        this.turno = discente.getTurno();
        this.ingles = discente.isIngles();
        this.karate = discente.isKarate();
        this.informatica = discente.isInformatica();
        this.musica = discente.isMusica();
        this.teatro = discente.isTeatro();
        this.ballet = discente.isBallet();
        this.futsal = discente.isFutsal();
        this.artesanato = discente.isArtesanato();
    }
}
