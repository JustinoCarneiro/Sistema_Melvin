package br.com.melvin.sistema.services.integrantes;

import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.dto.VoluntarioDTO;
import br.com.melvin.sistema.model.integrantes.Voluntario;
import br.com.melvin.sistema.repository.integrantes.VoluntarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class VoluntarioService {
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private VoluntarioRepository voluntarioRepository;

    public List<Voluntario> listar(){
        return voluntarioRepository.findAll();
    }

    public Voluntario capturaPorMatricula(String matricula){
        return voluntarioRepository.findByMatricula(matricula);
    }

    public List<VoluntarioDTO> listarVoluntariosComNomeFuncao() {
        return voluntarioRepository.findAll().stream()
                .filter(Voluntario::getStatus)
                .map(voluntario -> new VoluntarioDTO(voluntario.getNome(), voluntario.getFuncao()))
                .collect(Collectors.toList());
    }

    private synchronized String generateMatricula() {
        int currentYear = Year.now().getValue();
        String yearPrefix = String.valueOf(currentYear);
    
        Query query = entityManager.createNativeQuery("SELECT COUNT(*) FROM discente");
        int count = ((Number) query.getSingleResult()).intValue();
        int nextNumber = count + 1;
    
        // Gera a matrícula
        String newMatricula = "%s%04d".formatted(yearPrefix, nextNumber);
    
        // Verifica se a matrícula já existe
        while (voluntarioRepository.findByMatricula(newMatricula) != null) {
            nextNumber++;
            newMatricula = "%s%04d".formatted(yearPrefix, nextNumber);
        }
    
        return newMatricula;
    }

    public ResponseEntity<?> cadastrar(Voluntario voluntario){
        String resposta;
        if( voluntario.getNome() == null       || voluntario.getNome().isEmpty()      ||
            voluntario.getContato() == null    || voluntario.getContato().isEmpty()   ||
            voluntario.getFuncao() == null     || voluntario.getFuncao().isEmpty()    ||
            voluntario.getData() == null       || 
            voluntario.getEndereco() == null   || voluntario.getEndereco().isEmpty()  ||
            voluntario.getCidade() == null     || voluntario.getCidade().isEmpty()    ||
            voluntario.getBairro() == null     || voluntario.getBairro().isEmpty()    ||
            voluntario.getRg() == null         || voluntario.getRg().isEmpty()           ){
            resposta = "As informações de nome, contato, função, data, endereço, cidade, bairro, rg são obrigatórias!";
            return new ResponseEntity<String>(resposta, HttpStatus.BAD_REQUEST);
        } else if(voluntarioRepository.findByMatricula(voluntario.getMatricula())!=null){
            resposta = "Matricula já cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.CONFLICT);
        }

        voluntario.setMatricula(generateMatricula());

        Voluntario savedVoluntario = voluntarioRepository.save(voluntario);

        return new ResponseEntity<Voluntario>(savedVoluntario, HttpStatus.CREATED);
    }

    public ResponseEntity<?> alterar(Voluntario voluntario){
        String resposta;
        Voluntario existente = voluntarioRepository.findByMatricula(voluntario.getMatricula());
        if (existente == null) {
            resposta = "Matrícula não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setNome(voluntario.getNome());
            existente.setEmail(voluntario.getEmail());
            existente.setContato(voluntario.getContato());
            existente.setData(voluntario.getData());
            existente.setCor(voluntario.getCor());
            existente.setSexo(voluntario.getSexo());
            existente.setEndereco(voluntario.getEndereco());
            existente.setRg(voluntario.getRg());
            existente.setBairro(voluntario.getBairro());
            existente.setCidade(voluntario.getCidade());
            existente.setFuncao(voluntario.getFuncao());
            existente.setSala(voluntario.getSala());
            existente.setSegunda(voluntario.getSegunda());
            existente.setTerca(voluntario.getTerca());
            existente.setQuarta(voluntario.getQuarta());
            existente.setQuinta(voluntario.getQuinta());
            existente.setSexta(voluntario.getSexta());
            existente.setStatus(voluntario.getStatus());

            existente.setId(id);

            return new ResponseEntity<Voluntario>(voluntarioRepository.save(existente), HttpStatus.OK);
        }
    }

    // Método para remover voluntario
    public ResponseEntity<String> remover(String matricula){
        String resposta;
        if(voluntarioRepository.findByMatricula(matricula)==null){
            resposta = "Matricula não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            voluntarioRepository.deleteByMatricula(matricula);
            resposta = "Voluntario removido com sucesso!";
            return new ResponseEntity<String>(resposta, HttpStatus.OK);
        }
    }
}
