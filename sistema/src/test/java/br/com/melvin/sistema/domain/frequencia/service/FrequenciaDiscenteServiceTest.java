package br.com.melvin.sistema.domain.frequencia.service;

import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import br.com.melvin.sistema.domain.frequencia.repository.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * US-5.5: Notificação Automática de Falta ao Responsável (CLAUDE.md, Épico 5).
 */
@ExtendWith(MockitoExtension.class)
public @SuppressWarnings("null")
class FrequenciaDiscenteServiceTest {

    @Mock
    private FrequenciaDiscenteRepository repository;

    @Mock
    private DiscenteRepository repositoryDiscente;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private FrequenciaDiscenteService service;

    private Discente createDiscente(String matricula, String emailResponsavel) {
        Discente discente = new Discente();
        discente.setMatricula(matricula);
        discente.setNome("Aluno Teste");
        discente.setEmail_responsavel(emailResponsavel);
        return discente;
    }

    private FrequenciaDiscente createFrequencia(String matricula, String presencaManha, String presencaTarde) {
        FrequenciaDiscente f = new FrequenciaDiscente();
        f.setMatricula(matricula);
        f.setNome("Aluno Teste");
        f.setSala(1);
        f.setData(LocalDate.now());
        f.setPresenca_manha(presencaManha);
        f.setPresenca_tarde(presencaTarde);
        return f;
    }

    @Test
    public void testFaltaManhaComEmailResponsavelDisparaNotificacao() {
        FrequenciaDiscente frequencia = createFrequencia("2026001", "F", "P");
        Discente discente = createDiscente("2026001", "responsavel@email.com");

        when(repository.findByMatriculaAndData(eq("2026001"), any())).thenReturn(null);
        when(repositoryDiscente.findByMatricula("2026001")).thenReturn(discente);
        when(repository.save(any(FrequenciaDiscente.class))).thenReturn(frequencia);

        service.cadastrar(frequencia);

        verify(emailService, times(1)).sendEmail(eq("responsavel@email.com"), anyString(), anyString());
    }

    @Test
    public void testFaltaTardeComEmailResponsavelDisparaNotificacao() {
        FrequenciaDiscente frequencia = createFrequencia("2026001", "P", "F");
        Discente discente = createDiscente("2026001", "responsavel@email.com");

        when(repository.findByMatriculaAndData(eq("2026001"), any())).thenReturn(null);
        when(repositoryDiscente.findByMatricula("2026001")).thenReturn(discente);
        when(repository.save(any(FrequenciaDiscente.class))).thenReturn(frequencia);

        service.cadastrar(frequencia);

        verify(emailService, times(1)).sendEmail(eq("responsavel@email.com"), anyString(), anyString());
    }

    @Test
    public void testSemFaltaNaoDisparaNotificacao() {
        FrequenciaDiscente frequencia = createFrequencia("2026001", "P", "P");
        Discente discente = createDiscente("2026001", "responsavel@email.com");

        when(repository.findByMatriculaAndData(eq("2026001"), any())).thenReturn(null);
        when(repositoryDiscente.findByMatricula("2026001")).thenReturn(discente);
        when(repository.save(any(FrequenciaDiscente.class))).thenReturn(frequencia);

        service.cadastrar(frequencia);

        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void testFaltaSemEmailResponsavelNaoQuebraFluxoNemDisparaEmail() {
        FrequenciaDiscente frequencia = createFrequencia("2026001", "F", "P");
        Discente discente = createDiscente("2026001", null);

        when(repository.findByMatriculaAndData(eq("2026001"), any())).thenReturn(null);
        when(repositoryDiscente.findByMatricula("2026001")).thenReturn(discente);
        when(repository.save(any(FrequenciaDiscente.class))).thenReturn(frequencia);

        var response = service.cadastrar(frequencia);

        org.junit.jupiter.api.Assertions.assertEquals(org.springframework.http.HttpStatus.CREATED, response.getStatusCode());
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }
}
