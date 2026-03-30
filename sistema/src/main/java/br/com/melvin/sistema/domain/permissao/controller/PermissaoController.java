package br.com.melvin.sistema.domain.permissao.controller;

import br.com.melvin.sistema.domain.permissao.dto.PermissaoRegraDTO;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissoes")
public class PermissaoController {

    @Autowired
    private PermissaoService permissaoService;

    // Apenas Admins devem poder listar e editar todas as regras
    @GetMapping
    public ResponseEntity<List<PermissaoRegraDTO>> listarTodas() {
        return ResponseEntity.ok(permissaoService.listarTodas());
    }

    @PutMapping("/{nomeRegra}")
    public ResponseEntity<?> atualizarRegra(@PathVariable String nomeRegra, @RequestBody List<String> roles) {
        return permissaoService.atualizarRegra(nomeRegra, roles);
    }

    // Qualquer usuário logado pode ver o que ele pode acessar
    @GetMapping("/minhas")
    public ResponseEntity<List<String>> listarMinhasPermissoes(Authentication authentication) {
        return ResponseEntity.ok(permissaoService.listarMinhasPermissoes(authentication));
    }
}
