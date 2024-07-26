package br.com.melvin.sistema.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.Aviso;
import br.com.melvin.sistema.repository.AvisoRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class AvisoService {
    @Autowired
    AvisoRepository repositorio;

    public List<Aviso> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Aviso aviso){
        Aviso savedAviso = repositorio.save(aviso);
        return new ResponseEntity<Aviso>(savedAviso, HttpStatus.CREATED);
    }

    public ResponseEntity<?> alterar(Aviso aviso){
        String resposta;
        Aviso existente = repositorio.findByTitulo(aviso.getTitulo());
        if(existente == null){
            resposta = "Aviso não encontrado!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setCorpo(aviso.getCorpo());
            existente.setStatus(aviso.getStatus());
            existente.setData_inicio(aviso.getData_inicio());
            existente.setData_final(aviso.getData_final());
            
            existente.setId(id);

            return new ResponseEntity<Aviso>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}

