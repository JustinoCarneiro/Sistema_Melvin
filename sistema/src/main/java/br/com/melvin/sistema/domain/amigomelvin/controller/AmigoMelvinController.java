package br.com.melvin.sistema.domain.amigomelvin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.service.AmigoMelvinService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import br.com.melvin.sistema.domain.amigomelvin.dto.SubscriptionRequestDTO;
import br.com.melvin.sistema.domain.amigomelvin.dto.OneTimeDonationDTO;
import br.com.melvin.sistema.domain.amigomelvin.dto.DoacaoItemDTO;


@RestController
@RequestMapping("/amigomelvin")
public class AmigoMelvinController {
    
    @Autowired
    AmigoMelvinService service;

    @GetMapping
    public List<AmigoMelvin> listar(){
        return service.listar();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(service.getStats());
    }

    @PostMapping
    public ResponseEntity<?> adicionar(@RequestBody AmigoMelvin amigomelvin) {
        return service.adicionar(amigomelvin);
    }
    
    @PostMapping("/subscribe")
    public ResponseEntity<?> assinar(@RequestBody SubscriptionRequestDTO dto) {
        return service.processarAssinatura(dto);
    }
    
    @PostMapping("/one-time")
    public ResponseEntity<?> oneTimeDonation(@RequestBody OneTimeDonationDTO dto) {
        return service.processarDoacaoUnica(dto);
    }

    @PostMapping("/items")
    public ResponseEntity<?> doacaoItens(@RequestBody DoacaoItemDTO dto) {
        return service.registrarDoacaoItem(dto);
    }
    
    @PutMapping
    public ResponseEntity<?> alterar(@RequestBody AmigoMelvin amigomelvin) {
        return service.alterar(amigomelvin);
    }
}
