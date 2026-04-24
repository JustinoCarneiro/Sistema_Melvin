package br.com.melvin.sistema.domain.amigomelvin.dto;

import java.math.BigDecimal;

public record OneTimeDonationDTO(
    String nome,
    String email,
    String contato,
    BigDecimal valor,
    String stripeToken
) {}
