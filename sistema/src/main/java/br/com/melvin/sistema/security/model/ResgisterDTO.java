package br.com.melvin.sistema.security.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// O cargo é obrigatório: User.getAuthorities() trata qualquer cargo desconhecido, inclusive nulo, como ROLE_DIRE.
// A regra de qualidade da senha fica em PoliticaDeSenha (depende da matrícula).
public record ResgisterDTO(
    @NotBlank(message = "Informe a matrícula.")
    @Size(max = 64, message = "Matrícula inválida.")
    String login,

    @NotBlank(message = "Informe a senha.")
    @Size(max = 128, message = "Senha muito longa.")
    String password,

    @NotNull(message = "Informe o cargo.")
    UserRole role) {
}
