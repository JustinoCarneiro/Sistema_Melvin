package br.com.melvin.sistema.services.integrantes;

import java.time.Year;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.repository.integrantes.DiscenteRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class DiscenteService {
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private DiscenteRepository discenteRepository;

    // Método para listar todos os discentes
    public List<Discente> listar(){
        return discenteRepository.findAll();
    }

    public List<Discente> listarPorSala(Integer sala){
        return discenteRepository.findAllBySala(sala);
    }

    public Discente capturaPorMatricula(String matricula){
        return discenteRepository.findByMatricula(matricula);
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
        while (discenteRepository.findByMatricula(newMatricula) != null) {
            nextNumber++;
            newMatricula = "%s%04d".formatted(yearPrefix, nextNumber);
        }
    
        return newMatricula;
    }

    // Método para cadastrar discente
    public ResponseEntity<?> cadastrar(Discente discente){
        String resposta;
        
        if(discenteRepository.findByMatricula(discente.getMatricula())!=null){
            resposta = "Matricula já cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.CONFLICT);
        } else if(discenteRepository.findByNome(discente.getNome())!=null){
            resposta = "Discente já matriculado!";
            return new ResponseEntity<String>(resposta, HttpStatus.CONFLICT);
        }
        
        discente.setMatricula(generateMatricula());
        
        Discente savedDiscente = discenteRepository.save(discente);

        return new ResponseEntity<Discente>(savedDiscente, HttpStatus.CREATED);

    }

    // Método para alterar discente
    public ResponseEntity<?> alterar(Discente discente){
        String resposta;
        Discente existente = discenteRepository.findByMatricula(discente.getMatricula());
        if (existente == null) {
            resposta = "Matrícula não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            // Mantém o id do discente existente
            UUID id = existente.getId();

            // Atualiza os campos do discente existente com os novos valores
            existente.setNome(discente.getNome());
            existente.setEmail(discente.getEmail());
            existente.setContato(discente.getContato());
            existente.setData(discente.getData());
            existente.setCor(discente.getCor());
            existente.setSexo(discente.getSexo());
            existente.setNacionalidade(discente.getNacionalidade());
            existente.setEndereco(discente.getEndereco());
            existente.setRg(discente.getRg());
            existente.setBairro(discente.getBairro());
            existente.setCidade(discente.getCidade());
            existente.setSala(discente.getSala());
            existente.setTurno(discente.getTurno());
            existente.setNome_pai(discente.getNome_pai());
            existente.setContato_pai(discente.getContato_pai());
            existente.setInstrucao_pai(discente.getInstrucao_pai());
            existente.setAlfabetizacao_pai(discente.getAlfabetizacao_pai());
            existente.setOcupacao_pai(discente.getOcupacao_pai());
            existente.setContato_trabalho_pai(discente.getContato_trabalho_pai());
            existente.setEstado_civil_pai(discente.getEstado_civil_pai());
            existente.setLocal_trabalho_pai(discente.getLocal_trabalho_pai());
            existente.setNome_mae(discente.getNome_mae());
            existente.setContato_mae(discente.getContato_mae());
            existente.setInstrucao_mae(discente.getInstrucao_mae());
            existente.setAlfabetizacao_mae(discente.getAlfabetizacao_mae());
            existente.setOcupacao_mae(discente.getOcupacao_mae());
            existente.setContato_trabalho_mae(discente.getContato_trabalho_mae());
            existente.setEstado_civil_mae(discente.getEstado_civil_mae());
            existente.setLocal_trabalho_mae(discente.getLocal_trabalho_mae());
            existente.setQtd_filho(discente.getQtd_filho());
            existente.setBeneficio_governo(discente.getBeneficio_governo());
            existente.setMeio_transporte(discente.getMeio_transporte());
            existente.setQtd_transporte(discente.getQtd_transporte());
            existente.setMora_familiar(discente.getMora_familiar());
            existente.setOutro_familiar(discente.getOutro_familiar());
            existente.setClt(discente.getClt());
            existente.setAutonomo(discente.getAutonomo());
            existente.setTodos_moram_casa(discente.getTodos_moram_casa());
            existente.setRenda_total(discente.getRenda_total());
            existente.setFamilia_congrega(discente.getFamilia_congrega());
            existente.setGostaria_congregar(discente.getGostaria_congregar());
            existente.setDoenca(discente.getDoenca());
            existente.setMedicacao(discente.getMedicacao());
            existente.setRemedio_instituto(discente.getRemedio_instituto());
            existente.setTratamento(discente.getTratamento());
            existente.setHorario_medicamento(discente.getHorario_medicamento());
            existente.setSaida_aluno(discente.getSaida_aluno());
            existente.setEsportes(discente.getEsportes());
            existente.setStatus(discente.getStatus());
            existente.setKarate(discente.isKarate());
            existente.setFutsal(discente.isFutsal());
            existente.setInformatica(discente.isInformatica());
            existente.setMusica(discente.isMusica());
            existente.setBallet(discente.isBallet());
            existente.setArtesanato(discente.isArtesanato());
            existente.setIngles(discente.isIngles());


            // Reatribui o id ao discente existente para garantir que ele não seja alterado
            existente.setId(id);

            // Salva o discente atualizado
            return new ResponseEntity<Discente>(discenteRepository.save(existente), HttpStatus.OK);
        }
    }

    // Método para remover discente
    public ResponseEntity<String> remover(String matricula){
        String resposta;
        if(discenteRepository.findByMatricula(matricula)==null){
            resposta = "Matricula não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            discenteRepository.deleteByMatricula(matricula);
            resposta = "Discente removido com sucesso!";
            return new ResponseEntity<String>(resposta, HttpStatus.OK);
        }
    }

    public List<Discente> searchDiscentes(String searchTerm) {
        // Se o termo de busca for nulo ou vazio, retorna todos os discentes
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return discenteRepository.findAll();
        }
        // Caso contrário, chama o método de busca avançada do repositório
        return discenteRepository.searchByTerm(searchTerm);
    }
}