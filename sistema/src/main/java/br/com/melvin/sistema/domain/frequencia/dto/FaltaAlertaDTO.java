package br.com.melvin.sistema.domain.frequencia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FaltaAlertaDTO {
    private String matricula;
    private String nome;
    private Long quantidade;
}
