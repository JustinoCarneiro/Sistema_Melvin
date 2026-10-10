package br.com.melvin.sistema.domain.amigomelvin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoacaoItemDTO(
    @NotBlank(message = "Informe o nome.")
    @Size(max = 120, message = "Nome muito longo.")
    String nome,

    @NotBlank(message = "Informe o telefone.")
    @Size(max = 40, message = "Telefone muito longo.")
    String telefone,

    @NotBlank(message = "Informe o tipo do item.")
    @Size(max = 60, message = "Tipo de item muito longo.")
    String tipoItem,

    @Size(max = 500, message = "Observação muito longa.")
    String observacao
) {}
