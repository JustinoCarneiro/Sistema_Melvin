package br.com.melvin.sistema.security.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateDTO(
    @NotBlank @Size(max = 64) String login,
    @NotBlank @Size(max = 128) String newPassword
) {}
