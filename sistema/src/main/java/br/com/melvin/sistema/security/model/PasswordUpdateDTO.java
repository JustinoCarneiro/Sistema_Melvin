package br.com.melvin.sistema.security.model;

import jakarta.validation.constraints.NotBlank;

public record PasswordUpdateDTO(
    @NotBlank String login,
    @NotBlank String newPassword
) {}
