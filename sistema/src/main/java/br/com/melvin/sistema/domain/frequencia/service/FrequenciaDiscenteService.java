package br.com.melvin.sistema.domain.frequencia.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import br.com.melvin.sistema.domain.frequencia.dto.FaltaAlertaDTO;
import br.com.melvin.sistema.domain.frequencia.repository.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class FrequenciaDiscenteService {
    @Autowired
    private FrequenciaDiscenteRepository repository;

    @Autowired
    private DiscenteRepository repositoryDiscente;

    @Autowired
    private EmailService emailService;

    public List<FrequenciaDiscente> listar(){
        return repository.findAll();
    }

    public List<FrequenciaDiscente> listarFrequenciaPorData(LocalDate data){
        return repository.findAllByData(data);
    }

    public List<FaltaAlertaDTO> listarAlertasFaltas(LocalDate inicioMes, LocalDate fimMes){
        return repository.findMatriculasComQuatroOuMaisFaltasInjustificadas(inicioMes, fimMes);
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
        } else {
            Discente discente = repositoryDiscente.findByMatricula(frequencia.getMatricula());
            if(discente == null){
                resposta = "Matricula não cadastrada!";
                return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
            }
            try {
                FrequenciaDiscente salva = repository.save(frequencia);
                notificarFaltaResponsavel(salva, discente);
                return new ResponseEntity<FrequenciaDiscente>(salva, HttpStatus.CREATED);
            } catch (DataIntegrityViolationException e) {
                resposta = "Frequência já cadastrada!";
                return new ResponseEntity<String>(resposta, HttpStatus.CONFLICT);
            }
        }
    }

    // US-5.5: notifica o responsável por e-mail quando falta em qualquer turno é registrada.
    // Best-effort — EmailService já engole falha de envio internamente (não deve derrubar o cadastro de frequência).
    private void notificarFaltaResponsavel(FrequenciaDiscente frequencia, Discente discente) {
        notificarFaltaResponsavel(frequencia, discente, null, null);
    }

    // Variante para edição: `manhaAnterior`/`tardeAnterior` trazem o estado antes da
    // alteração, para notificar só a falta NOVA. Sem isso, ou a falta lançada em uma
    // segunda gravação do mesmo dia nunca avisa (fluxo real da tela de chamada, que
    // manda PUT quando matrícula+data já existem), ou reenvia o aviso a cada gravação.
    private void notificarFaltaResponsavel(FrequenciaDiscente frequencia, Discente discente,
                                           String manhaAnterior, String tardeAnterior) {
        boolean faltouManha = "F".equals(frequencia.getPresenca_manha()) && !"F".equals(manhaAnterior);
        boolean faltouTarde = "F".equals(frequencia.getPresenca_tarde()) && !"F".equals(tardeAnterior);
        if (!faltouManha && !faltouTarde) {
            return;
        }

        String emailResponsavel = discente.getEmail_responsavel();
        if (emailResponsavel == null || emailResponsavel.isBlank()) {
            return;
        }

        String turno = faltouManha && faltouTarde ? "manhã e tarde" : (faltouManha ? "manhã" : "tarde");
        String dataFormatada = frequencia.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String assunto = "Aviso de falta - " + frequencia.getNome();
        String corpo = "Informamos que " + frequencia.getNome() + " não compareceu ao Instituto no turno da "
                + turno + " do dia " + dataFormatada + ".";

        emailService.sendEmail(emailResponsavel, assunto, corpo);
    }

    public ResponseEntity<?> alterar(FrequenciaDiscente frequencia){
        String resposta;
        FrequenciaDiscente existente = repository.findByMatriculaAndData(frequencia.getMatricula(), frequencia.getData());
        if (existente == null) {
            resposta = "Frequência não cadastrada!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            // Estado anterior guardado ANTES da sobrescrita, para saber se a falta é nova (US-5.5).
            String manhaAnterior = existente.getPresenca_manha();
            String tardeAnterior = existente.getPresenca_tarde();

            existente.setNome(frequencia.getNome());
            existente.setPresenca_manha(frequencia.getPresenca_manha());
            existente.setPresenca_tarde(frequencia.getPresenca_tarde());
            existente.setJustificativa(frequencia.getJustificativa());
            existente.setSala(frequencia.getSala());

            existente.setId(id);

            FrequenciaDiscente salva = repository.save(existente);

            Discente discente = repositoryDiscente.findByMatricula(salva.getMatricula());
            if (discente != null) {
                notificarFaltaResponsavel(salva, discente, manhaAnterior, tardeAnterior);
            }

            return new ResponseEntity<FrequenciaDiscente>(salva, HttpStatus.OK);
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
