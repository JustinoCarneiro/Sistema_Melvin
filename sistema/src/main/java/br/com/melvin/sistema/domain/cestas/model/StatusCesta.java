package br.com.melvin.sistema.domain.cestas.model;

// US-7.4: máquina de estados da solicitação de cesta básica.
public enum StatusCesta {
    SOLICITADA,
    AGENDADA,
    ENTREGUE,
    CANCELADA
}
