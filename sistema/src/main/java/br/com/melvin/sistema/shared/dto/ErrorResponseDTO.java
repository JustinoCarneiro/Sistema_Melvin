package br.com.melvin.sistema.shared.dto;

import java.time.LocalDateTime;

public record ErrorResponseDTO(
    int status,
    String message,
    LocalDateTime timestamp
) {
    public ErrorResponseDTO(int status, String message) {
        this(status, message, LocalDateTime.now());
    }
}
