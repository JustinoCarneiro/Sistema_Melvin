package br.com.melvin.sistema.domain.amigomelvin.dto;

import java.math.BigDecimal;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubscriptionRequestDTO(
    @NotBlank(message = "O nome é obrigatório.")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    String email,

    @NotBlank(message = "O contato é obrigatório.")
    String contato,

    @NotBlank(message = "O CPF é obrigatório.")
    @CPF(message = "CPF inválido.")
    String cpf,

    @NotNull(message = "O valor é obrigatório.")
    BigDecimal valor,

    @NotBlank(message = "Os dados do cartão são obrigatórios.")
    String stripeToken,

    String dia,
    String mensagem,

    // Chave gerada pelo frontend (1x por formulário) para tornar a assinatura
    // idempotente: reenvios da mesma tentativa não criam doadores duplicados.
    String idempotencyKey
) {
}
