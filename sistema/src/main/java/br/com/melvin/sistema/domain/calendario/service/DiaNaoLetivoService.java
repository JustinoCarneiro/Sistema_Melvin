package br.com.melvin.sistema.domain.calendario.service;

import br.com.melvin.sistema.domain.calendario.model.DiaNaoLetivo;
import br.com.melvin.sistema.domain.calendario.repository.DiaNaoLetivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DiaNaoLetivoService {

    @Autowired
    private DiaNaoLetivoRepository repository;

    public List<DiaNaoLetivo> listar() {
        return repository.findAll();
    }

    public List<DiaNaoLetivo> listarPorMes(int mes, int ano) {
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
        return repository.findByDataBetween(inicio, fim);
    }

    public ResponseEntity<?> cadastrar(DiaNaoLetivo diaNaoLetivo) {
        if (diaNaoLetivo.getData() == null || diaNaoLetivo.getDescricao() == null || diaNaoLetivo.getDescricao().isEmpty()) {
            return new ResponseEntity<>("A data e a descrição são obrigatórias!", HttpStatus.BAD_REQUEST);
        }

        if (repository.findByData(diaNaoLetivo.getData()) != null) {
            return new ResponseEntity<>("Já existe um feriado/recesso cadastrado para esta data!", HttpStatus.CONFLICT);
        }

        try {
            return new ResponseEntity<>(repository.save(diaNaoLetivo), HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            return new ResponseEntity<>("Já existe um feriado/recesso cadastrado para esta data!", HttpStatus.CONFLICT);
        }
    }

    @SuppressWarnings("null")
    public ResponseEntity<?> remover(UUID id) {
        if (!repository.existsById(id)) {
            return new ResponseEntity<>("Dia não letivo não encontrado!", HttpStatus.NOT_FOUND);
        }
        repository.deleteById(id);
        return new ResponseEntity<>("Removido com sucesso!", HttpStatus.OK);
    }
}
