package br.com.melvin.sistema.domain.amigomelvin.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OneTimeDonationDTO(
    @Size(max = 120, message = "Nome muito longo.")
    String nome,

    @Size(max = 120, message = "E-mail muito longo.")
    String email,

    @Size(max = 40, message = "Contato muito longo.")
    String contato,

    @NotNull(message = "O valor é obrigatório.")
    @DecimalMin(value = "1.00", message = "O valor mínimo para doação é de R$ 1,00.")
    @DecimalMax(value = "100000.00", message = "Valor acima do permitido.")
    @Digits(integer = 6, fraction = 2, message = "Valor inválido.")
    BigDecimal valor,

    @Size(max = 100, message = "Dados do cartão inválidos.")
    String stripeToken
) {}
