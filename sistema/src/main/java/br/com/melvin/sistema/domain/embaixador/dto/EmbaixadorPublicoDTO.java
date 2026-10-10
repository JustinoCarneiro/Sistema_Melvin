package br.com.melvin.sistema.domain.embaixador.dto;

import java.util.UUID;

import lombok.Getter;

/**
 * Embaixador como o site público o mostra: nome, descrição e o caminho da foto (se houver).
 * Contato, e-mail e Instagram de quem se cadastrou ficam fora de propósito.
 */
@Getter
public class EmbaixadorPublicoDTO {
    private final UUID id;
    private final String nome;
    private final String descricao;
    private final String fotoPath;

    public EmbaixadorPublicoDTO(UUID id, String nome, String descricao, String fotoPath) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.fotoPath = fotoPath;
    }
}
