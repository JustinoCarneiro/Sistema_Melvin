package br.com.melvin.sistema.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.model.Avaliacao;
import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.repository.AvaliacaoRepository;
import br.com.melvin.sistema.repository.integrantes.DiscenteRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class AvaliacaoService {
    @Autowired
    private AvaliacaoRepository repository;

    @Autowired
    private DiscenteRepository discenteRepository;

    public List<Avaliacao> listarPorMatricula(String matricula) {
        return repository.findByDiscenteMatricula(matricula);
    }

    public ResponseEntity<?> adicionar(Avaliacao avaliacao) {
        if (avaliacao.getDiscente() == null || avaliacao.getDiscente().getMatricula() == null) {
            return new ResponseEntity<>("Matrícula do discente é obrigatória.", HttpStatus.BAD_REQUEST);
        }

        Discente discente = discenteRepository.findByMatricula(avaliacao.getDiscente().getMatricula());
        if (discente == null) {
            return new ResponseEntity<>("Discente não encontrado.", HttpStatus.NOT_FOUND);
        }

        // Associa o discente gerenciado à avaliação
        avaliacao.setDiscente(discente);

        if (avaliacao.getNota() < 1 || avaliacao.getNota() > 5) {
            return new ResponseEntity<>("A nota deve ser entre 1 e 5.", HttpStatus.BAD_REQUEST);
        }

        Avaliacao savedAvaliacao = repository.save(avaliacao);
        return new ResponseEntity<>(savedAvaliacao, HttpStatus.CREATED);
    }
}