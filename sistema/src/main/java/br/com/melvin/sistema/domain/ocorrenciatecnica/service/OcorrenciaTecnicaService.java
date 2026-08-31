package br.com.melvin.sistema.domain.ocorrenciatecnica.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.ocorrenciatecnica.model.OcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.repository.OcorrenciaTecnicaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class OcorrenciaTecnicaService {
    @Autowired
    private OcorrenciaTecnicaRepository repository;

    public ResponseEntity<?> cadastrar(OcorrenciaTecnica ocorrencia, String autorLogin) {
        if (ocorrencia.getTitulo() == null || ocorrencia.getTitulo().isEmpty()
                || ocorrencia.getCategoria() == null
                || ocorrencia.getSeveridade() == null
                || ocorrencia.getDescricao() == null || ocorrencia.getDescricao().isEmpty()
                || ocorrencia.getDataOcorrencia() == null) {
            return new ResponseEntity<String>(
                    "As informações de título, categoria, severidade, descrição e data são obrigatórias!",
                    HttpStatus.BAD_REQUEST);
        }

        // Payload não pode forjar autor nem estado inicial — mesma cautela da US-7.4 com
        // campos de fluxo interno vindos no payload público.
        ocorrencia.setAutorLogin(autorLogin);
        ocorrencia.setCriadoEm(LocalDateTime.now());
        ocorrencia.setResolvido(false);

        return new ResponseEntity<OcorrenciaTecnica>(repository.save(ocorrencia), HttpStatus.CREATED);
    }

    public List<OcorrenciaTecnica> listar() {
        return repository.findAllByOrderByDataOcorrenciaDescCriadoEmDesc();
    }

    public ResponseEntity<?> alternarResolvido(UUID id) {
        Optional<OcorrenciaTecnica> ocorrenciaOpt = repository.findById(id);
        if (ocorrenciaOpt.isEmpty()) {
            return new ResponseEntity<String>("Ocorrência não encontrada!", HttpStatus.NOT_FOUND);
        }

        OcorrenciaTecnica ocorrencia = ocorrenciaOpt.get();
        ocorrencia.setResolvido(!ocorrencia.isResolvido());
        return new ResponseEntity<OcorrenciaTecnica>(repository.save(ocorrencia), HttpStatus.OK);
    }
}
