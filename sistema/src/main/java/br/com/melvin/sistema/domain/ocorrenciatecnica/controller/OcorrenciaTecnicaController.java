package br.com.melvin.sistema.domain.ocorrenciatecnica.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.ocorrenciatecnica.model.OcorrenciaTecnica;
import br.com.melvin.sistema.domain.ocorrenciatecnica.service.OcorrenciaTecnicaService;
import br.com.melvin.sistema.security.model.User;

@RestController
@RequestMapping("/ocorrencias-tecnicas")
public class OcorrenciaTecnicaController {
    @Autowired
    OcorrenciaTecnicaService service;

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody OcorrenciaTecnica ocorrencia, Authentication authentication) {
        String autorLogin = ((User) authentication.getPrincipal()).getLogin();
        return service.cadastrar(ocorrencia, autorLogin);
    }

    @GetMapping
    public List<OcorrenciaTecnica> listar() {
        return service.listar();
    }

    @PutMapping("/{id}/alternar-resolvido")
    public ResponseEntity<?> alternarResolvido(@PathVariable UUID id) {
        return service.alternarResolvido(id);
    }
}
