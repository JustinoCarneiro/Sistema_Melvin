package br.com.melvin.sistema.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.AmigoMelvin;
import br.com.melvin.sistema.repository.AmigoMelvinRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class AmigoMelvinService {
    @Autowired
    AmigoMelvinRepository repositorio;

    public List<AmigoMelvin> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(AmigoMelvin amigomelvin){
        AmigoMelvin savedAmigoMelvin = repositorio.save(amigomelvin);
        return new ResponseEntity<AmigoMelvin>(savedAmigoMelvin, HttpStatus.CREATED);
    }

    public ResponseEntity<?> alterar(AmigoMelvin amigomelvin){
        String resposta;
        AmigoMelvin existente = repositorio.findByNome(amigomelvin.getNome());
        if (existente == null) {
            resposta = "AmigoMelvin não cadastrado!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setContatado(amigomelvin.getContatado());
            existente.setEmail(amigomelvin.getEmail());
            existente.setStatus(amigomelvin.getStatus());
            existente.setContato(amigomelvin.getContato());
            existente.setFormaPagamento(amigomelvin.getFormaPagamento());
            existente.setValorMensal(amigomelvin.getValorMensal());

            existente.setId(id);

            return new ResponseEntity<AmigoMelvin>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}
