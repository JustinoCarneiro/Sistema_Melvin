package br.com.melvin.sistema.security.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;
import br.com.melvin.sistema.security.config.TokenService;
import br.com.melvin.sistema.security.model.PasswordUpdateDTO;
import br.com.melvin.sistema.security.model.ResgisterDTO;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.security.services.LoginAttemptService;
import br.com.melvin.sistema.security.services.PoliticaDeSenha;
import br.com.melvin.sistema.shared.dto.ErrorResponseDTO;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * O cargo TECH existe para separar o suporte técnico da administração do Instituto. Se o ADM pudesse criar um
 * acesso TECH, promover alguém a TECH ou redefinir a senha de um TECH, a separação não valeria nada. Também
 * cobre a regra mínima de senha e o cargo obrigatório no cadastro (um cargo vazio cai em ROLE_DIRE).
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationControllerAdminTest {

    private static final String SENHA_BOA = "cafe-com-pao-42";

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository repositoryUser;

    @Mock
    private VoluntarioRepository repositoryVoluntario;

    @Mock
    private TokenService tokenService;

    @Mock
    private Argon2PasswordEncoder passwordEncoder;

    @Mock
    private LoginAttemptService tentativas;

    @InjectMocks
    private AuthenticationController controller;

    private Authentication como(UserRole role) {
        User usuario = new User("quem-chama-" + role, "x", role);
        return new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
    }

    private String mensagem(ResponseEntity<?> resposta) {
        return ((ErrorResponseDTO) resposta.getBody()).message();
    }

    // ---- criar acesso ----

    @Test
    void admNaoCriaAcessoTecnico() {
        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("2026001", SENHA_BOA, UserRole.TECH), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void techCriaAcessoTecnico() {
        when(repositoryVoluntario.findByMatricula("2026001")).thenReturn(mock(Voluntario.class));
        when(passwordEncoder.encode(SENHA_BOA)).thenReturn("hash");

        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("2026001", SENHA_BOA, UserRole.TECH), como(UserRole.TECH));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(repositoryUser).save(any(User.class));
    }

    @Test
    void admCriaAcessoComumComSenhaBoa() {
        when(repositoryVoluntario.findByMatricula("2026002")).thenReturn(mock(Voluntario.class));
        when(passwordEncoder.encode(SENHA_BOA)).thenReturn("hash");

        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("2026002", SENHA_BOA, UserRole.PROF), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void cadastroRecusaSenhaFracaComAMensagemDaRegra() {
        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("2026003", "12345678", UserRole.PROF), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(mensagem(resposta)).isEqualTo(PoliticaDeSenha.MENSAGEM);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void cadastroRecusaAMatriculaComoSenha() {
        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("20260044", "20260044", UserRole.PROF), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void cadastroSemCargoNaoViraDiretor() {
        // User.getAuthorities() devolve ROLE_DIRE para qualquer cargo desconhecido, inclusive nulo.
        ResponseEntity<?> resposta = controller.register(new ResgisterDTO("2026005", SENHA_BOA, null), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void cadastroMantemOComportamentoParaMatriculaDesconhecidaEJaRegistrada() {
        when(repositoryVoluntario.findByMatricula("9990001")).thenReturn(null);
        assertThat(controller.register(new ResgisterDTO("9990001", SENHA_BOA, UserRole.PROF), como(UserRole.ADM)).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        when(repositoryVoluntario.findByMatricula("9990002")).thenReturn(mock(Voluntario.class));
        when(repositoryUser.findByLogin("9990002")).thenReturn(new User("9990002", "h", UserRole.PROF));
        assertThat(controller.register(new ResgisterDTO("9990002", SENHA_BOA, UserRole.PROF), como(UserRole.ADM)).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    // ---- redefinir senha ----

    @Test
    void admNaoRedefineASenhaDeUmTech() {
        when(repositoryUser.findByLogin("tech-1")).thenReturn(new User("tech-1", "hash", UserRole.TECH));

        ResponseEntity<?> resposta = controller.alterarSenha(new PasswordUpdateDTO("tech-1", SENHA_BOA), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void techRedefineASenhaDeOutroTech() {
        User alvo = new User("tech-2", "hash-antigo", UserRole.TECH);
        when(repositoryUser.findByLogin("tech-2")).thenReturn(alvo);
        when(passwordEncoder.encode(SENHA_BOA)).thenReturn("hash-novo");

        ResponseEntity<?> resposta = controller.alterarSenha(new PasswordUpdateDTO("tech-2", SENHA_BOA), como(UserRole.TECH));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(alvo.getPassword()).isEqualTo("hash-novo");
    }

    @Test
    void admRedefineASenhaDeUsuarioComum() {
        User alvo = new User("prof-1", "hash-antigo", UserRole.PROF);
        when(repositoryUser.findByLogin("prof-1")).thenReturn(alvo);
        when(passwordEncoder.encode(SENHA_BOA)).thenReturn("hash-novo");

        ResponseEntity<?> resposta = controller.alterarSenha(new PasswordUpdateDTO("prof-1", SENHA_BOA), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(alvo.getPassword()).isEqualTo("hash-novo");
    }

    @Test
    void redefinicaoRecusaSenhaFraca() {
        ResponseEntity<?> resposta = controller.alterarSenha(new PasswordUpdateDTO("prof-1", "123"), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(mensagem(resposta)).isEqualTo(PoliticaDeSenha.MENSAGEM);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void redefinicaoDeUsuarioInexistenteContinuaNaoEncontrado() {
        when(repositoryUser.findByLogin("ninguem")).thenReturn(null);

        ResponseEntity<?> resposta = controller.alterarSenha(new PasswordUpdateDTO("ninguem", SENHA_BOA), como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ---- alterar cargo ----

    @Test
    void admNaoPromoveNinguemATech() {
        User alvo = new User("prof-2", "hash", UserRole.PROF);
        when(repositoryUser.findByLogin("prof-2")).thenReturn(alvo);

        ResponseEntity<?> resposta = controller.alterarRole("prof-2", "tech", como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(alvo.getRole()).isEqualTo(UserRole.PROF);
        verify(repositoryUser, never()).save(any());
    }

    @Test
    void admNaoRebaixaNemAlteraOCargoDeUmTech() {
        User alvo = new User("tech-3", "hash", UserRole.TECH);
        when(repositoryUser.findByLogin("tech-3")).thenReturn(alvo);

        ResponseEntity<?> resposta = controller.alterarRole("tech-3", "prof", como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(alvo.getRole()).isEqualTo(UserRole.TECH);
    }

    @Test
    void techPromoveATech() {
        User alvo = new User("prof-3", "hash", UserRole.PROF);
        when(repositoryUser.findByLogin("prof-3")).thenReturn(alvo);

        ResponseEntity<?> resposta = controller.alterarRole("prof-3", "TECH", como(UserRole.TECH));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(alvo.getRole()).isEqualTo(UserRole.TECH);
    }

    @Test
    void admAlteraCargosComuns() {
        User alvo = new User("prof-4", "hash", UserRole.PROF);
        when(repositoryUser.findByLogin("prof-4")).thenReturn(alvo);

        ResponseEntity<?> resposta = controller.alterarRole("prof-4", "coor", como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(alvo.getRole()).isEqualTo(UserRole.COOR);
    }

    @Test
    void cargoInexistenteContinuaSendoRecusado() {
        when(repositoryUser.findByLogin("prof-5")).thenReturn(new User("prof-5", "hash", UserRole.PROF));

        ResponseEntity<?> resposta = controller.alterarRole("prof-5", "super-admin", como(UserRole.ADM));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
