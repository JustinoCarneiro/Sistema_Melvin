package br.com.melvin.sistema.domain.embaixador.dto;

import java.util.UUID;

import lombok.Getter;

/**
 * Embaixador como o site público o mostra: só nome e descrição (o id liga a foto).
 * Contato, e-mail e Instagram de quem se cadastrou ficam fora de propósito.
 */
@Getter
public class EmbaixadorPublicoDTO {
    private final UUID id;
    private final String nome;
    private final String descricao;

    public EmbaixadorPublicoDTO(UUID id, String nome, String descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }
}
