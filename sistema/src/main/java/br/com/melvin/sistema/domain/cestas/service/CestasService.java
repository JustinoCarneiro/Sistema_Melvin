package br.com.melvin.sistema.domain.cestas.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.repository.CestasRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CestasService {
    
    @Autowired
    CestasRepository repositorio;

    public List<Cestas> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Cestas cesta){
        // Garante que é uma criação (ID null)
        cesta.setId(null); 
        Cestas savedCesta = repositorio.save(cesta);
        return new ResponseEntity<Cestas>(savedCesta, HttpStatus.CREATED); 
    }

    public ResponseEntity<?> alterar(Cestas cestaAtualizada){
        // Verifica se o ID veio na requisição
        if (cestaAtualizada.getId() == null) {
            return new ResponseEntity<String>("ID da doação não informado para alteração.", HttpStatus.BAD_REQUEST);
        }

        // Busca pelo ID (Muito mais seguro que Nome + Data)
        Optional<Cestas> existenteOpt = repositorio.findById(cestaAtualizada.getId());

        if (existenteOpt.isEmpty()) {
            return new ResponseEntity<String>("Doação não encontrada no banco de dados!", HttpStatus.NOT_FOUND);
        } else {
            Cestas existente = existenteOpt.get();

            // Atualiza TODOS os campos com os dados novos que vieram do Frontend
            existente.setNome(cestaAtualizada.getNome());
            existente.setCpf(cestaAtualizada.getCpf());
            existente.setContato(cestaAtualizada.getContato());
            existente.setOperacao(cestaAtualizada.getOperacao());
            
            // --- NOVO CAMPO ADICIONADO ---
            existente.setVoluntario(cestaAtualizada.getVoluntario());
            
            existente.setLider_celula(cestaAtualizada.getLider_celula());
            existente.setPastor_rede(cestaAtualizada.getPastor_rede());
            existente.setRede(cestaAtualizada.getRede());
            existente.setResponsavel(cestaAtualizada.getResponsavel());
            
            existente.setItens_doados(cestaAtualizada.getItens_doados());
            existente.setTipo(cestaAtualizada.getTipo());
            existente.setPeso(cestaAtualizada.getPeso());
            existente.setFrequencia(cestaAtualizada.getFrequencia());
            
            existente.setDataEntrega(cestaAtualizada.getDataEntrega());

            return new ResponseEntity<Cestas>(repositorio.save(existente), HttpStatus.OK);
        }
    }

    // Método de remover agora deve receber o ID, ou extrair o ID do objeto
    public ResponseEntity<String> remover(UUID id){
        if(!repositorio.existsById(id)){
            return new ResponseEntity<String>("Doação não encontrada!", HttpStatus.NOT_FOUND);
        } else {
            repositorio.deleteById(id);
            return new ResponseEntity<String>("Doação removida com sucesso!", HttpStatus.OK);
        }
    }
}