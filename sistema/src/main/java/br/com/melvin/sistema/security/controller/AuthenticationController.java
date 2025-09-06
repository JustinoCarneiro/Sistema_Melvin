package br.com.melvin.sistema.security.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.melvin.sistema.repository.integrantes.VoluntarioRepository;
import br.com.melvin.sistema.security.config.TokenService;
import br.com.melvin.sistema.security.model.AuthenticationDTO;
import br.com.melvin.sistema.security.model.LoginResponseDTO;
import br.com.melvin.sistema.security.model.ResgisterDTO;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository repositoryUser;

    @Autowired
    private VoluntarioRepository repositoryVoluntario;
 
    @Autowired
    private TokenService tokenService;

    @Autowired
    private Argon2PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data){
        logger.info("Tentativa de login para o usuário: {}", data.login());

        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var token = tokenService.generateToken((User) auth.getPrincipal());

            logger.info("Login bem-sucedido para o usuário: {}", data.login());
            return ResponseEntity.ok(new LoginResponseDTO(token, ((User) auth.getPrincipal()).getRole().toString()));

        } catch (Exception e) {
            logger.error("Falha na autenticação para o usuário: {}. Erro: {}", data.login(), e.getMessage());
            return ResponseEntity.status(401).body("Matrícula ou senha inválida."); // Retornar uma resposta de erro clara
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ResgisterDTO dados) {
        // Adiciona um log inicial para ver se o método está sendo chamado
        System.out.println("Register endpoint called");

        if (this.repositoryVoluntario.findByMatricula(dados.login()) == null) {
            return ResponseEntity.badRequest().build();
        }

        if (this.repositoryUser.findByLogin(dados.login()) != null){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Matrícula já registrada.");
        }

        String encryptedPassword = passwordEncoder.encode(dados.password());
        User newUser = new User(dados.login(), encryptedPassword, dados.role());

        this.repositoryUser.save(newUser);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/alterar_senha/{matricula}/{senha}")
    public ResponseEntity<?> alterarSenha(@PathVariable String matricula, @PathVariable String senha) {
        System.out.println("Alterar Senha endpoint called");

        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = passwordEncoder.encode(senha);
        user.setPassword(encryptedPassword);
        repositoryUser.save(user);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/role_{matricula}")
    public ResponseEntity<?> role(@PathVariable String matricula) {
        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        UserRole role = user.getRole();
        return ResponseEntity.ok(role);
    }

    @GetMapping("/senha/{matricula}")
    public ResponseEntity<?> senha(@PathVariable String matricula){
        User user = repositoryUser.findByLogin(matricula);

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        String password = user.getPassword();
        return ResponseEntity.ok(password);
    }

    @PutMapping("/alterar_role/{matricula}/{role}")
    public ResponseEntity<?> alterarRole(@PathVariable String matricula, @PathVariable String role){
        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            user.setRole(userRole);
            repositoryUser.save(user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Role inválida");
        }
    }
}
