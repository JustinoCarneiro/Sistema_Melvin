package br.com.melvin.sistema.domain.amigomelvin.dto;

import java.math.BigDecimal;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubscriptionRequestDTO(
    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 120, message = "Nome muito longo.")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    @Size(max = 120, message = "E-mail muito longo.")
    String email,

    @NotBlank(message = "O contato é obrigatório.")
    @Size(max = 40, message = "Contato muito longo.")
    String contato,

    @NotBlank(message = "O CPF é obrigatório.")
    @CPF(message = "CPF inválido.")
    String cpf,

    @NotNull(message = "O valor é obrigatório.")
    @DecimalMax(value = "100000.00", message = "Valor acima do permitido.")
    @Digits(integer = 6, fraction = 2, message = "Valor inválido.")
    BigDecimal valor,

    @NotBlank(message = "Os dados do cartão são obrigatórios.")
    @Size(max = 100, message = "Dados do cartão inválidos.")
    String stripeToken,

    @Size(max = 20, message = "Dia inválido.")
    String dia,

    @Size(max = 500, message = "Mensagem muito longa.")
    String mensagem,

    // Chave gerada pelo frontend (1x por formulário) para tornar a assinatura
    // idempotente: reenvios da mesma tentativa não criam doadores duplicados.
    @Size(max = 100, message = "Chave de idempotência inválida.")
    String idempotencyKey
) {
}
