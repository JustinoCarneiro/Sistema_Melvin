package br.com.melvin.sistema.security.model;

public record ResgisterDTO(String login, String password, UserRole role) {
}
