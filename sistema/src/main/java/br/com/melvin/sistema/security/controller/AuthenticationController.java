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

import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;
import br.com.melvin.sistema.security.config.TokenService;
import br.com.melvin.sistema.security.model.AuthenticationDTO;
import br.com.melvin.sistema.security.model.LoginResponseDTO;
import br.com.melvin.sistema.security.model.ResgisterDTO;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.model.PasswordUpdateDTO;
import br.com.melvin.sistema.security.repository.UserRepository;

import br.com.melvin.sistema.shared.dto.ErrorResponseDTO;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;


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
    public ResponseEntity<?> login(@RequestBody @Valid AuthenticationDTO data){
        logger.info("Tentativa de login para o usuário: {}", data.login());

        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var token = tokenService.generateToken((User) auth.getPrincipal());
            var user = (User) auth.getPrincipal();

            logger.info("Login bem-sucedido para o usuário: {}", data.login());
            return ResponseEntity.ok(new LoginResponseDTO(token, user.getRole().toString()));

        } catch (BadCredentialsException e) {
            logger.warn("Falha na autenticação para o usuário: {}. Credenciais inválidas.", data.login());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO(HttpStatus.UNAUTHORIZED.value(), "Matrícula ou senha inválida."));
        } catch (Exception e) {
            logger.error("Erro inesperado durante login para o usuário: {}. Erro: {}", data.login(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro interno no servidor."));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ResgisterDTO dados) {

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

    @PutMapping("/alterar_senha")
    public ResponseEntity<?> alterarSenha(@RequestBody @Valid PasswordUpdateDTO data) {
        logger.info("Tentativa de alteração de senha para o usuário: {}", data.login());

        User user = repositoryUser.findByLogin(data.login());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }

        String encryptedPassword = passwordEncoder.encode(data.newPassword());
        user.setPassword(encryptedPassword);
        repositoryUser.save(user);

        logger.info("Senha alterada com sucesso para o usuário: {}", data.login());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/role_{matricula}")
    public ResponseEntity<?> role(@PathVariable String matricula) {
        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(HttpStatus.NOT_FOUND.value(), "Usuário não encontrado."));
        }
        
        UserRole role = user.getRole();
        return ResponseEntity.ok(role);
    }

    @PutMapping("/alterar_role/{matricula}/{role}")
    public ResponseEntity<?> alterarRole(@PathVariable String matricula, @PathVariable String role) {
        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(HttpStatus.NOT_FOUND.value(), "Usuário não encontrado."));
        }

        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            user.setRole(userRole);
            repositoryUser.save(user);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), "Role inválida"));
        }
    }
}
