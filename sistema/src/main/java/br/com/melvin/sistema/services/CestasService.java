package br.com.melvin.sistema.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.Cestas;
import br.com.melvin.sistema.repository.CestasRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CestasService {
    @Autowired
    CestasRepository respositorio;

    public List<Cestas> listar(){
        return respositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Cestas cesta){
        Cestas savedCesta = respositorio.save(cesta);
        return new ResponseEntity<Cestas>(savedCesta, HttpStatus.CREATED); 
    }

    public ResponseEntity<?> alterar(Cestas cesta){
        String resposta;
        Cestas existente = respositorio.findByNomeAndDataEntrega(cesta.getNome(), cesta.getDataEntrega());

        if (existente == null) {
            resposta = "Entrega de cesta não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setContato(cesta.getContato());
            existente.setLider_celula(cesta.getLider_celula());
            existente.setRede(cesta.getRede());

            existente.setId(id);

            return new ResponseEntity<Cestas>(respositorio.save(existente), HttpStatus.OK);
        }
    }

    public ResponseEntity<String> remover(Cestas cesta){
        String resposta;

        if(respositorio.findByNomeAndDataEntrega(cesta.getNome(), cesta.getDataEntrega()) == null){
            resposta = "Entrega não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        }else{
            respositorio.deleteByNomeAndDataEntrega(cesta.getNome(), cesta.getDataEntrega());
            resposta = "Entrega removida com sucesso!";
            return new ResponseEntity<String>(resposta, HttpStatus.OK);
        }
    }
}
