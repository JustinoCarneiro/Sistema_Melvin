package br.com.melvin.sistema.domain.embaixador.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * O que o formulário público de embaixador pode enviar. O corpo da requisição é do visitante, então ele não
 * escolhe id (sobrescreveria um cadastro que já existe), status de aprovação nem descrição: isso é da
 * administração. Os tetos de tamanho valem também para a coluna cifrada (o texto cifrado é maior que o original).
 */
public record EmbaixadorCadastroDTO(
    @NotBlank(message = "Informe o nome.")
    @Size(max = 120, message = "Nome muito longo.")
    String nome,

    @NotBlank(message = "Informe o contato.")
    @Size(max = 40, message = "Contato muito longo.")
    String contato,

    @Size(max = 60, message = "Instagram muito longo.")
    String instagram,

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "E-mail inválido.")
    @Size(max = 120, message = "E-mail muito longo.")
    String email
) {
}
