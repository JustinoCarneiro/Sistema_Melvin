package br.com.melvin.sistema.services;

import java.util.List;
import java.util.Optional; // Importante
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

    // --- ALTERAÇÃO AQUI ---
    public ResponseEntity<?> alterar(UUID id, Aviso avisoAtualizado){
        // Busca pelo ID (Seguro e Único)
        Optional<Aviso> avisoOpt = repositorio.findById(id);

        if(avisoOpt.isEmpty()){
            return new ResponseEntity<String>("Aviso não encontrado!", HttpStatus.NOT_FOUND);
        } else {
            Aviso existente = avisoOpt.get();

            // Atualiza todos os campos, INCLUSIVE O TÍTULO
            existente.setTitulo(avisoAtualizado.getTitulo()); 
            existente.setCorpo(avisoAtualizado.getCorpo());
            existente.setStatus(avisoAtualizado.getStatus());
            existente.setData_inicio(avisoAtualizado.getData_inicio());
            existente.setData_final(avisoAtualizado.getData_final());
            
            // O ID já é o mesmo, não precisa setar novamente
            return new ResponseEntity<Aviso>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}