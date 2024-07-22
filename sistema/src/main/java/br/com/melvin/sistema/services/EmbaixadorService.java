package br.com.melvin.sistema.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.Embaixador;
import br.com.melvin.sistema.repository.EmbaixadorRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class EmbaixadorService {
    @Autowired
    EmbaixadorRepository repositorio;

    public List<Embaixador> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Embaixador embaixador){
        Embaixador savedEmbaixador = repositorio.save(embaixador);
        return new ResponseEntity<Embaixador>(savedEmbaixador, HttpStatus.CREATED);
    }

    public ResponseEntity<?> alterar(Embaixador embaixador){
        String resposta;
        Embaixador existente = repositorio.findByNome(embaixador.getNome());
        if (existente == null) {
            resposta = "Embaixador não cadastrado!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setContatado(embaixador.getContatado());
            existente.setInstagram(embaixador.getInstagram());
            existente.setEmail(embaixador.getEmail());
            existente.setStatus(embaixador.getStatus());
            existente.setContato(embaixador.getContato());
            existente.setApelido(embaixador.getApelido());
            existente.setDescricao(embaixador.getDescricao());

            existente.setId(id);

            return new ResponseEntity<Embaixador>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}
