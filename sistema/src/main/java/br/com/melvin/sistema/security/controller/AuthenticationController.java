package br.com.melvin.sistema.security.controller;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
import br.com.melvin.sistema.security.services.LoginAttemptService;
import br.com.melvin.sistema.security.services.PoliticaDeSenha;

import br.com.melvin.sistema.shared.dto.ErrorResponseDTO;
import br.com.melvin.sistema.shared.security.ClientIp;
import br.com.melvin.sistema.shared.util.LogSanitizer;
import jakarta.servlet.http.HttpServletRequest;
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

    @Autowired
    private LoginAttemptService tentativas;

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    private static final String SO_TECH = "Apenas o Suporte Técnico pode gerenciar acessos técnicos.";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid AuthenticationDTO data, HttpServletRequest request){
        String ip = ClientIp.de(request);
        // A matrícula vem do cliente: sem limpar, uma quebra de linha forjaria linhas de log.
        String loginNoLog = LogSanitizer.limpar(data.login());

        if (tentativas.bloqueado(ip, data.login())) {
            logger.warn("Login bloqueado por excesso de tentativas. Usuário: {}. IP: {}", loginNoLog, LogSanitizer.limpar(ip));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(new ErrorResponseDTO(
                    HttpStatus.TOO_MANY_REQUESTS.value(), "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."));
        }

        // Cada verificação de senha (Argon2) ocupa 64 MB de heap: o excedente espera ou recebe 503.
        if (!tentativas.adquirirVaga()) {
            logger.warn("Login adiado: verificações de senha simultâneas no limite.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ErrorResponseDTO(
                    HttpStatus.SERVICE_UNAVAILABLE.value(), "O sistema está ocupado. Tente novamente em alguns instantes."));
        }

        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var token = tokenService.generateToken((User) auth.getPrincipal());
            var user = (User) auth.getPrincipal();

            tentativas.registrarSucesso(data.login());
            logger.info("Login bem-sucedido para o usuário: {}", loginNoLog);
            return ResponseEntity.ok(new LoginResponseDTO(token, user.getRole().toString()));

        } catch (BadCredentialsException e) {
            tentativas.registrarFalha(ip, data.login());
            logger.warn("Falha na autenticação para o usuário: {}. Credenciais inválidas. IP: {}", loginNoLog, LogSanitizer.limpar(ip));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO(HttpStatus.UNAUTHORIZED.value(), "Matrícula ou senha inválida."));
        } catch (Exception e) {
            logger.error("Erro inesperado durante login para o usuário: {}", loginNoLog, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Erro interno no servidor."));
        } finally {
            tentativas.liberarVaga();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid ResgisterDTO dados, Authentication authentication) {

        if (dados.role() == UserRole.TECH && !ehTech(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseDTO(HttpStatus.FORBIDDEN.value(), SO_TECH));
        }

        if (!PoliticaDeSenha.valida(dados.login(), dados.password())) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), PoliticaDeSenha.MENSAGEM));
        }

        if (this.repositoryVoluntario.findByMatricula(dados.login()) == null) {
            return ResponseEntity.badRequest().build();
        }

        if (this.repositoryUser.findByLogin(dados.login()) != null){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Matrícula já registrada.");
        }

        String encryptedPassword = passwordEncoder.encode(dados.password());
        User newUser = new User(dados.login(), encryptedPassword, dados.role());

        this.repositoryUser.save(newUser);

        logger.info("Acesso criado para o usuário {} com o cargo {} por {}.",
                LogSanitizer.limpar(dados.login()), dados.role(), LogSanitizer.limpar(authentication.getName()));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/alterar_senha")
    public ResponseEntity<?> alterarSenha(@RequestBody @Valid PasswordUpdateDTO data, Authentication authentication) {
        String loginNoLog = LogSanitizer.limpar(data.login());

        if (!PoliticaDeSenha.valida(data.login(), data.newPassword())) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), PoliticaDeSenha.MENSAGEM));
        }

        User user = repositoryUser.findByLogin(data.login());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }

        // O acesso técnico é separado da administração do Instituto: o ADM não redefine a senha de um TECH.
        if (user.getRole() == UserRole.TECH && !ehTech(authentication)) {
            logger.warn("Redefinição de senha do usuário técnico {} negada a {}.", loginNoLog, LogSanitizer.limpar(authentication.getName()));
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseDTO(HttpStatus.FORBIDDEN.value(), SO_TECH));
        }

        String encryptedPassword = passwordEncoder.encode(data.newPassword());
        user.setPassword(encryptedPassword);
        repositoryUser.save(user);

        logger.info("Senha do usuário {} redefinida por {}.", loginNoLog, LogSanitizer.limpar(authentication.getName()));
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
    public ResponseEntity<?> alterarRole(@PathVariable String matricula, @PathVariable String role, Authentication authentication) {
        User user = repositoryUser.findByLogin(matricula);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponseDTO(HttpStatus.NOT_FOUND.value(), "Usuário não encontrado."));
        }

        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase(Locale.ROOT));

            // Nem promover a TECH nem mexer em quem já é TECH: só o próprio Suporte Técnico.
            if ((userRole == UserRole.TECH || user.getRole() == UserRole.TECH) && !ehTech(authentication)) {
                logger.warn("Alteração de cargo do usuário {} para {} negada a {}.",
                        LogSanitizer.limpar(matricula), userRole, LogSanitizer.limpar(authentication.getName()));
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseDTO(HttpStatus.FORBIDDEN.value(), SO_TECH));
            }

            UserRole anterior = user.getRole();
            user.setRole(userRole);
            repositoryUser.save(user);
            logger.info("Cargo do usuário {} alterado de {} para {} por {}.",
                    LogSanitizer.limpar(matricula), anterior, userRole, LogSanitizer.limpar(authentication.getName()));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), "Role inválida"));
        }
    }

    private boolean ehTech(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(autoridade -> "ROLE_TECH".equals(autoridade.getAuthority()));
    }
}
