package br.com.melvin.sistema.domain.embaixador.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import br.com.melvin.sistema.domain.embaixador.repository.EmbaixadorRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class EmbaixadorService {
    
    private final EmbaixadorRepository repositorio;
    private final EmailService emailService;

    public List<Embaixador> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Embaixador embaixador){
        log.info("Recebendo nova solicitação de embaixador: {}", embaixador.getNome());
        
        // Garante que novos cadastros via site comecem como não aprovados e não contatados
        embaixador.setStatus(false);
        embaixador.setContatado(false);
        
        Embaixador savedEmbaixador = repositorio.save(embaixador);

        // Notifica o solicitante
        emailService.sendEmail(
            embaixador.getEmail(),
            "Recebemos sua solicitação - Embaixadores Melvin",
            "Olá " + embaixador.getNome() + "!\n\n" +
            "Ficamos muito felizes com seu interesse em ser um embaixador do Instituto Melvin. " +
            "Recebemos seus dados e nossa equipe entrará em contato com você em breve pelo WhatsApp ou e-mail para conversarmos sobre os próximos passos.\n\n" +
            "Sua voz faz a diferença!"
        );

        // Notifica o Instituto (Admin)
        emailService.sendEmail(
            "contato@institutomelvin.org",
            "Novo Candidato a Embaixador: " + embaixador.getNome(),
            "Uma nova solicitação de embaixador foi recebida pelo site.\n\n" +
            "Nome: " + embaixador.getNome() + "\n" +
            "E-mail: " + embaixador.getEmail() + "\n" +
            "Contato/WhatsApp: " + embaixador.getContato() + "\n" +
            "Instagram: " + embaixador.getInstagram() + "\n\n" +
            "Acesse o painel administrativo para gerenciar esta solicitação."
        );

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
