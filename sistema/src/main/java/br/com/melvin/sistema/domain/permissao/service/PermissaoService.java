package br.com.melvin.sistema.domain.permissao.service;

import br.com.melvin.sistema.domain.permissao.dto.PermissaoRegraDTO;
import br.com.melvin.sistema.domain.permissao.model.PermissaoRegra;
import br.com.melvin.sistema.domain.permissao.repository.PermissaoRegraRepository;
import br.com.melvin.sistema.security.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PermissaoService {

    @Autowired
    private PermissaoRegraRepository repository;

    @Autowired
    private Environment environment;

    @PostConstruct
    public void initDefaultRules() {
        // Não inicializar no banco de dados durante os testes do Spring Boot
        if (Arrays.asList(environment.getActiveProfiles()).contains("test")) {
            return;
        }

        createIfNotFound("EDITAR_RENDIMENTO", "ADM,DIRE,COOR");
        createIfNotFound("GERENCIAR_FREQUENCIA", "ADM,DIRE,COOR,PROF");
        createIfNotFound("CADASTRAR_ALUNO", "ADM,COOR,DIRE,ASSIST");
        createIfNotFound("EDITAR_AVALIACAO_PSICO", "PSICO");
        createIfNotFound("GERENCIAR_CESTAS", "ADM,DIRE,AUX");
        createIfNotFound("GERENCIAR_VOLUNTARIOS", "ADM");
        createIfNotFound("GERENCIAR_EMBAIXADORES", "ADM,DIRE");
        createIfNotFound("GERENCIAR_AMIGOS", "ADM,DIRE");
        createIfNotFound("GERENCIAR_AVISOS", "ADM");
        createIfNotFound("VISUALIZAR_ALUNOS", "PROF,ADM,DIRE,COOR,ASSIST,PSICO");
        createIfNotFound("VISUALIZAR_RELATORIOS", "PROF,ADM,DIRE,COOR,ASSIST,PSICO");
    }

    private void createIfNotFound(String regra, String defaultRoles) {
        if (repository.findByNomeRegra(regra).isEmpty()) {
            PermissaoRegra nova = new PermissaoRegra();
            nova.setNomeRegra(regra);
            nova.setRolesPermitidas(defaultRoles);
            repository.save(nova);
        }
    }

    public List<PermissaoRegraDTO> listarTodas() {
        return repository.findAll().stream().map(r -> new PermissaoRegraDTO(
                r.getNomeRegra(),
                Arrays.asList(r.getRolesPermitidas().split(","))
        )).collect(Collectors.toList());
    }

    public ResponseEntity<?> atualizarRegra(String nomeRegra, List<String> roles) {
        Optional<PermissaoRegra> regraOpt = repository.findByNomeRegra(nomeRegra);
        if (regraOpt.isEmpty()) {
            return new ResponseEntity<>("Regra não encontrada", HttpStatus.NOT_FOUND);
        }

        PermissaoRegra regra = regraOpt.get();
        // Converte a lista para string separada por virgula
        String rolesStr = String.join(",", roles);
        regra.setRolesPermitidas(rolesStr);
        repository.save(regra);

        return new ResponseEntity<>(new PermissaoRegraDTO(regra.getNomeRegra(), roles), HttpStatus.OK);
    }

    public List<String> listarMinhasPermissoes(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return List.of();
        }
        
        User user = (User) authentication.getPrincipal();
        String userRoleStr = user.getRole().toString();

        return repository.findAll().stream()
                .filter(r -> Arrays.asList(r.getRolesPermitidas().split(",")).contains(userRoleStr))
                .map(PermissaoRegra::getNomeRegra)
                .collect(Collectors.toList());
    }

    public boolean hasPermission(Authentication authentication, String nomeRegra) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return false;
        }

        User user = (User) authentication.getPrincipal();
        String userRoleStr = user.getRole().toString();

        // Admin supremo? Pode acessar se quisermos:
        // Se definirmos que algo só PSICO pode, ADM não deveria acessar. Vamos respeitar a tabela.

        Optional<PermissaoRegra> regraOpt = repository.findByNomeRegra(nomeRegra);
        if (regraOpt.isEmpty()) return false;

        String[] rolesPermitidas = regraOpt.get().getRolesPermitidas().split(",");
        for (String r : rolesPermitidas) {
            if (r.trim().equals(userRoleStr)) {
                return true;
            }
        }
        return false;
    }
}
