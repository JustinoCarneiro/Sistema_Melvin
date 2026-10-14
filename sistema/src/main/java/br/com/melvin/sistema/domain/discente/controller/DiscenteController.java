package br.com.melvin.sistema.domain.discente.controller;

import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.InputStreamResource;
import java.io.ByteArrayInputStream;                  
import java.io.IOException; 

import br.com.melvin.sistema.domain.dashboard.service.NotaPsicologicaAcesso;
import br.com.melvin.sistema.domain.discente.dto.DiscenteAvaliacaoDTO;
import br.com.melvin.sistema.domain.discente.dto.DiscenteListagemDTO;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.service.DiscenteService;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/discente")
@SuppressWarnings("null")
public class DiscenteController {
    
    @Autowired
    private DiscenteService service;

    @Autowired
    private ObjectMapper objectMapper;

    // MÉTODO 'listar' ATUALIZADO PARA LGPD
    @GetMapping
    public List<DiscenteListagemDTO> listar(@RequestParam(value = "search", required = false) String searchTerm) {
        List<Discente> discentes;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            discentes = service.searchDiscentes(searchTerm);
        } else {
            discentes = service.listar();
        }
        return discentes.stream().map(DiscenteListagemDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/sala/{sala}")
    public List<DiscenteListagemDTO> listarPorSala(@PathVariable Integer sala) {
        return service.listarPorSala(sala).stream().map(DiscenteListagemDTO::new).collect(Collectors.toList());
    }
    
    @GetMapping("/matricula/{matricula}")
    public JsonNode capturaPorMatricula(@PathVariable String matricula, Authentication authentication){
        Discente discente = service.capturaPorMatricula(matricula);
        if (discente == null) {
            return null;
        }
        return fichaVisivelPara(discente, authentication);
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Discente discente, Authentication authentication){
        return semNotaPsicologicaParaQuemNaoVe(service.cadastrar(discente), authentication);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Discente discente, Authentication authentication){
        return semNotaPsicologicaParaQuemNaoVe(service.alterar(discente), authentication);
    }

    @DeleteMapping("/{matricula}")
    public ResponseEntity<String> remover(@PathVariable String matricula){
        return service.remover(matricula);
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportarDiscentes(@RequestParam(value = "search", required = false) String searchTerm,
                                                                 Authentication authentication) throws IOException {
        ByteArrayInputStream bais = service.exportarDiscentes(searchTerm, NotaPsicologicaAcesso.podeVer(authentication));

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=discentes.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(new InputStreamResource(bais));
    }

    @PutMapping("/{matricula}/avaliacoes")
    public ResponseEntity<?> alterarAvaliacoes(@PathVariable String matricula, @RequestBody DiscenteAvaliacaoDTO data) {
        return service.alterarAvaliacoes(matricula, data);
    }

    // A nota psicológica só vai para Psicologia e Coordenação. Para os demais o campo é omitido
    // (e não zerado), e a tela depende dessa ausência para esconder a linha. Monta-se uma cópia em
    // JSON para nunca alterar a entidade gerenciada pelo JPA.
    private ObjectNode fichaVisivelPara(Discente discente, Authentication authentication) {
        ObjectNode ficha = objectMapper.valueToTree(discente);
        if (!NotaPsicologicaAcesso.podeVer(authentication)) {
            ficha.remove("avaliacaoPsicologico");
        }
        return ficha;
    }

    // Cadastro e edição devolvem o aluno salvo: a resposta segue a mesma regra da consulta.
    private ResponseEntity<?> semNotaPsicologicaParaQuemNaoVe(ResponseEntity<?> resposta, Authentication authentication) {
        if (NotaPsicologicaAcesso.podeVer(authentication) || !(resposta.getBody() instanceof Discente salvo)) {
            return resposta;
        }
        return ResponseEntity.status(resposta.getStatusCode())
                .headers(resposta.getHeaders())
                .body(fichaVisivelPara(salvo, authentication));
    }
}
