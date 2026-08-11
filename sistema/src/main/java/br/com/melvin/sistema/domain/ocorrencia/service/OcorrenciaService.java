package br.com.melvin.sistema.domain.ocorrencia.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import br.com.melvin.sistema.domain.ocorrencia.repository.OcorrenciaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class OcorrenciaService {
    @Autowired
    private OcorrenciaRepository repository;

    @Autowired
    private DiscenteRepository repositoryDiscente;

    public ResponseEntity<?> cadastrar(Ocorrencia ocorrencia, String autorLogin) {
        if (ocorrencia.getMatricula_discente() == null || ocorrencia.getMatricula_discente().isEmpty()
                || ocorrencia.getCategoria() == null
                || ocorrencia.getDescricao() == null || ocorrencia.getDescricao().isEmpty()
                || ocorrencia.getData_ocorrencia() == null) {
            return new ResponseEntity<String>(
                    "As informações de matrícula, categoria, descrição e data são obrigatórias!",
                    HttpStatus.BAD_REQUEST);
        }

        if (repositoryDiscente.findByMatricula(ocorrencia.getMatricula_discente()) == null) {
            return new ResponseEntity<String>("Matricula não cadastrada!", HttpStatus.NOT_FOUND);
        }

        ocorrencia.setAutor_login(autorLogin);
        ocorrencia.setCriado_em(LocalDateTime.now());

        return new ResponseEntity<Ocorrencia>(repository.save(ocorrencia), HttpStatus.CREATED);
    }

    public List<Ocorrencia> listarPorDiscente(String matricula) {
        return repository.findAllByMatriculaOrdenadoPorDataDesc(matricula);
    }
}
