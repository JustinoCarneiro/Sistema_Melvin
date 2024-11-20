package br.com.melvin.sistema.model.integrantes;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

//Define a classe como entidade, irá gerar uma tabela Discente
@Table(name="voluntario")
@Entity
@Getter
@Setter
public class Voluntario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String matricula;

    @Column(nullable = false)
    private String nome;

	private String email;

    @Column(nullable = false)
	private String contato;

    @Column(nullable = false)
	private String funcao;

    private String aulaExtra;

    private String salaUm; 

    private String salaDois;

    @Column(nullable = false)
    private LocalDate data;

    private String cor;

    private String sexo;

    @Column(nullable = false)
    private String endereco;

    private String rg;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false)
    private String cidade;

    private String segunda;

    private String terca;

    private String quarta;

    private String quinta;

    private String sexta;

    @Column(nullable = false)
    private String status;
}
