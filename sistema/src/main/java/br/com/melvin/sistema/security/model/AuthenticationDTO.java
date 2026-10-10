package br.com.melvin.sistema.security.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Os tetos de tamanho evitam gastar uma verificação de senha (64 MB de heap no Argon2) com uma entrada gigante.
public record AuthenticationDTO(
    @NotBlank(message = "Informe a matrícula.")
    @Size(max = 64, message = "Matrícula inválida.")
    String login,

    @NotBlank(message = "Informe a senha.")
    @Size(max = 128, message = "Senha inválida.")
    String password) {
}
