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
@Table(name="discente")
@Entity
@Getter
@Setter
public class Discente{

    //Define a variável "id" como o id da tabela
    @Id     

    //Define que o id seja auto incrementado
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    //Define que o campo não pode ser nulo
    @Column(nullable = false, unique = true)
    private String matricula;

    @Column(nullable = false)
    private String nome;

	private String email;

	private String contato;

    private String sexo;

    @Column(nullable = false)
    private LocalDate data;

    private String cor;

    private String nacionalidade;

    @Column(nullable = false)
    private String endereco;

    @Column(nullable = false)
    private String bairro;
    
    @Column(nullable = false)
    private String cidade;

    private String rg;

    @Column(nullable = false)
    private Integer sala;

    @Column(nullable = false)
    private String turno;

    private String nome_pai;

    private String contato_pai;

    private String instrucao_pai;

    private String ocupacao_pai;

    private String local_trabalho_pai;

    private String contato_trabalho_pai;

    private String alfabetizacao_pai;

    private String estado_civil_pai;

    private String nome_mae;

    private String contato_mae;

    private String instrucao_mae;

    private String ocupacao_mae;

    private String local_trabalho_mae;

    private String contato_trabalho_mae;

    private String alfabetizacao_mae;

    private String estado_civil_mae;

    private String qtd_filho;

    private String beneficio_governo;

    private String meio_transporte;

    private String qtd_transporte;

    private String mora_familiar;

    private String outro_familiar;

    private String todos_moram_casa;

    private String renda_total;

    private String clt;

    private String autonomo;

    private String familia_congrega;

    private String gostaria_congregar;

    private String doenca;

    private String medicacao;

    private String remedio_instituto;

    private String tratamento;

    private String horario_medicamento;

    private String esportes;

    private String saida_aluno;

    private String contato_saida;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean karate;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean ballet;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean informatica;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean futsal;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean artesanato;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean musica;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean ingles;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean teatro;

    @Column(columnDefinition = "numeric(3,1) default 0.0")
    private Double avaliacaoPresenca;

    @Column(columnDefinition = "numeric(3,1) default 0.0")
    private Double avaliacaoParticipacao;

    @Column(columnDefinition = "numeric(3,1) default 0.0")
    private Double avaliacaoComportamento;

    @Column(columnDefinition = "numeric(3,1) default 0.0")
    private Double avaliacaoRendimento;

    @Column(columnDefinition = "numeric(3,1) default 0.0")
    private Double avaliacaoPsicologico;
}
