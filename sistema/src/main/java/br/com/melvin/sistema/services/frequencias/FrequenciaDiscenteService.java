package br.com.melvin.sistema.services.frequencias;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.frequencias.FrequenciaDiscente;
import br.com.melvin.sistema.repository.frequencias.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.repository.integrantes.DiscenteRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class FrequenciaDiscenteService {
    @Autowired
    private FrequenciaDiscenteRepository repository;

    @Autowired
    private DiscenteRepository repositoryDiscente;

    public List<FrequenciaDiscente> listar(){
        return repository.findAll();
    }

    public List<FrequenciaDiscente> listarFrequenciaPorData(LocalDate data){
        return repository.findAllByData(data);
    }

    public FrequenciaDiscente capturarFrequencia(String matricula, LocalDate data){
        return repository.findByMatriculaAndData(matricula, data);
    }

    public ResponseEntity<?> cadastrar(FrequenciaDiscente frequencia){
        String resposta;
        if( frequencia.getMatricula() == null  || frequencia.getMatricula().isEmpty() ||
            frequencia.getNome() == null       || frequencia.getNome().isEmpty()      ||
            frequencia.getData() == null       ||
            frequencia.getSala() == null       ){
            resposta = "As informações de matricula, nome, presença, data e sala são obrigatórias!";
            return new ResponseEntity<String>(resposta, HttpStatus.BAD_REQUEST);
        } else if(repository.findByMatriculaAndData(frequencia.getMatricula(), frequencia.getData())!=null){
            resposta = "Frequência já cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.CONFLICT);
        } else if(repositoryDiscente.findByMatricula(frequencia.getMatricula())==null){
            resposta = "Matricula não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<FrequenciaDiscente>(repository.save(frequencia), HttpStatus.CREATED);
        }
    }

    public ResponseEntity<?> alterar(FrequenciaDiscente frequencia){
        String resposta;
        FrequenciaDiscente existente = repository.findByMatriculaAndData(frequencia.getMatricula(), frequencia.getData());
        if (existente == null) {
            resposta = "Frequência não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setNome(frequencia.getNome());
            existente.setPresenca_manha(frequencia.getPresenca_manha());
            existente.setPresenca_tarde(frequencia.getPresenca_tarde());
            existente.setJustificativa(frequencia.getJustificativa());
            existente.setSala(frequencia.getSala());

            existente.setId(id);

            return new ResponseEntity<FrequenciaDiscente>(repository.save(existente), HttpStatus.OK);
        }
    }

    // Método para remover discente
    public ResponseEntity<String> remover(String matricula, LocalDate data){
        String resposta;
        if(repository.findByMatriculaAndData(matricula, data)==null){
            resposta = "Frequência não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            repository.deleteByMatriculaAndData(matricula, data);
            resposta = "Frequência removida com sucesso!";
            return new ResponseEntity<String>(resposta, HttpStatus.OK);
        }
    }
}
