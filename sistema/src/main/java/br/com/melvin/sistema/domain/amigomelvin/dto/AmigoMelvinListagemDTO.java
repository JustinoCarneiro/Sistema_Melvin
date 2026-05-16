package br.com.melvin.sistema.domain.amigomelvin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.model.DonorStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AmigoMelvinListagemDTO {
    private UUID id;
    private String nome;
    private String contato;
    private String email;
    private BigDecimal valorMensal;
    private DonorStatus status;
    private Integer mesesContribuindo;
    private LocalDateTime dataInicio;
    private String diaPreferido;
    private String mensagem;

    public AmigoMelvinListagemDTO(AmigoMelvin amigomelvin) {
        this.id = amigomelvin.getId();
        this.nome = amigomelvin.getNome();
        this.contato = amigomelvin.getContato();
        this.email = amigomelvin.getEmail();
        this.valorMensal = amigomelvin.getValorMensal();
        this.status = amigomelvin.getStatus();
        this.mesesContribuindo = amigomelvin.getMesesContribuindo();
        this.dataInicio = amigomelvin.getDataInicio();
        this.diaPreferido = amigomelvin.getDiaPreferido();
        this.mensagem = amigomelvin.getMensagem();
    }
}
