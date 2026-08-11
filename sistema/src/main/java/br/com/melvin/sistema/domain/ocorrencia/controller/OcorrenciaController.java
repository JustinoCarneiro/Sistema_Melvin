package br.com.melvin.sistema.domain.ocorrencia.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import br.com.melvin.sistema.domain.ocorrencia.service.OcorrenciaService;
import br.com.melvin.sistema.security.model.User;

@RestController
@RequestMapping("/ocorrencias")
public class OcorrenciaController {
    @Autowired
    OcorrenciaService service;

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Ocorrencia ocorrencia, Authentication authentication) {
        String autorLogin = ((User) authentication.getPrincipal()).getLogin();
        return service.cadastrar(ocorrencia, autorLogin);
    }

    @GetMapping("/discente/{matricula}")
    public List<Ocorrencia> listarPorDiscente(@PathVariable String matricula) {
        return service.listarPorDiscente(matricula);
    }
}
