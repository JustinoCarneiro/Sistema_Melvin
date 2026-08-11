package br.com.melvin.sistema.domain.cestas.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.cestas.dto.ValidarSolicitacaoDTO;
import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.service.CestasService;
import br.com.melvin.sistema.shared.service.QrCodeService;
import com.google.zxing.WriterException;

@RestController
@RequestMapping("/cestas")
public class CestasController {

    @Autowired
    private CestasService service;

    @Autowired
    private QrCodeService qrCodeService;

    @GetMapping
    public List<Cestas> listar(){
        return service.listar();
    }

    // ============ US-7.4: Solicitação de Cesta ============

    @PostMapping("/solicitacao")
    public ResponseEntity<?> solicitar(@RequestBody Cestas solicitacao) {
        return service.solicitar(solicitacao);
    }

    @GetMapping("/solicitacoes")
    public List<Cestas> listarSolicitacoes() {
        return service.listarSolicitacoes();
    }

    @PutMapping("/solicitacao/{id}/validar")
    public ResponseEntity<?> validar(@PathVariable UUID id, @RequestBody ValidarSolicitacaoDTO dto) {
        return service.validar(id, dto.dataRetirada());
    }

    @PostMapping("/checkin/{qrCodeToken}")
    public ResponseEntity<?> checkin(@PathVariable String qrCodeToken) {
        return service.checkin(qrCodeToken);
    }

    @GetMapping(value = "/qrcode/{qrCodeToken}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrcode(@PathVariable String qrCodeToken) {
        try {
            byte[] png = qrCodeService.gerarPng(qrCodeToken);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
        } catch (WriterException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody Cestas cesta){
        return service.adicionar(cesta);
    }

    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody Cestas cesta){
        // O serviço vai verificar se o ID está dentro do objeto 'cesta'
        return service.alterar(cesta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> remover(@PathVariable UUID id) {
        return service.remover(id);
    }
}