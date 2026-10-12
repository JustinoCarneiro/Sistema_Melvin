package br.com.melvin.sistema.domain.discente.service;

import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.repository.DiscenteRepository;
import br.com.melvin.sistema.domain.diario.service.DiarioService;
import br.com.melvin.sistema.domain.frequencia.repository.FrequenciaDiscenteRepository;
import br.com.melvin.sistema.domain.ocorrencia.model.CategoriaOcorrencia;
import br.com.melvin.sistema.domain.ocorrencia.model.Ocorrencia;
import br.com.melvin.sistema.domain.ocorrencia.repository.OcorrenciaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import br.com.melvin.sistema.domain.discente.dto.DiscenteAvaliacaoDTO;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

@ExtendWith(MockitoExtension.class)
public class DiscenteServiceTest {

    @Mock
    private DiscenteRepository discenteRepository;

    @Mock
    private PermissaoService permissaoService;

    @Mock
    private FrequenciaDiscenteRepository frequenciaDiscenteRepository;

    @Mock
    private OcorrenciaRepository ocorrenciaRepository;

    @Mock
    private DiarioService diarioService;

    @InjectMocks
    private DiscenteService discenteService;

    @Test
    public void testCadastrarDiscenteComMatriculadoExistente() {
        Discente discente = new Discente();
        discente.setMatricula("12345");
        discente.setNome("João");

        when(discenteRepository.findByMatricula("12345")).thenReturn(discente);

        ResponseEntity<?> response = discenteService.cadastrar(discente);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Matricula já cadastrada!", response.getBody());
    }

    @Test
    public void testAlterarPersisteEmailDoResponsavel() {
        // US-5.5: alterar() copia campo a campo; se o e-mail do responsável ficar de
        // fora da cópia, a edição de um aluno JÁ EXISTENTE descarta o campo em
        // silêncio e a notificação de falta nunca dispara (todo aluno em produção
        // já existe, então esse é o caminho real de preenchimento).
        Discente existente = new Discente();
        existente.setMatricula("2026001");
        existente.setNome("Aluno");

        Discente atualizado = new Discente();
        atualizado.setMatricula("2026001");
        atualizado.setNome("Aluno");
        atualizado.setEmail_responsavel("responsavel@email.com");

        when(discenteRepository.findByMatricula("2026001")).thenReturn(existente);
        when(discenteRepository.save(org.mockito.ArgumentMatchers.any(Discente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        discenteService.alterar(atualizado);

        assertEquals("responsavel@email.com", existente.getEmail_responsavel());
    }

    @Test
    public void testAlterarPersisteContatoDeSaida() {
        // `contato_saida` é quem está autorizado a retirar a criança do Instituto —
        // dado de segurança. O campo é editável no formulário, mas ficava de fora da
        // cópia do alterar(), então a alteração era descartada em silêncio (PUT 200).
        Discente existente = new Discente();
        existente.setMatricula("2026001");
        existente.setContato_saida("85911110000");

        Discente atualizado = new Discente();
        atualizado.setMatricula("2026001");
        atualizado.setContato_saida("85922223333");

        when(discenteRepository.findByMatricula("2026001")).thenReturn(existente);
        when(discenteRepository.save(org.mockito.ArgumentMatchers.any(Discente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        discenteService.alterar(atualizado);

        assertEquals("85922223333", existente.getContato_saida());
    }

    @Test
    public void testRemoverDiscenteNaoExistente() {
        when(discenteRepository.findByMatricula("9999")).thenReturn(null);

        ResponseEntity<String> response = discenteService.remover("9999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Matricula não cadastrada!", response.getBody());
    }

    private Discente alunoCompleto() {
        Discente d = new Discente();
        d.setMatricula("2026001");
        d.setNome("Maria da Silva");
        d.setNome_mae("Ana da Silva");
        d.setNome_pai("José da Silva");
        d.setEmail("maria@email.com");
        d.setEmail_responsavel("ana@email.com");
        d.setData(LocalDate.of(2015, 6, 20));
        d.setCidade("Fortaleza");
        d.setOutro_familiar("Tia Rita");
        d.setLocal_trabalho_mae("Padaria Central");
        d.setLocal_trabalho_pai("Oficina do Zé");
        d.setOcupacao_mae("Padeira");
        d.setOcupacao_pai("Mecânico");
        d.setRenda_total("1500");
        d.setHorario_medicamento("08:00");
        d.setSexo("F");
        d.setSala(3);
        d.setTurno("manha");
        d.setStatus("true");
        return d;
    }

    @Test
    public void testRemoverApagaIdentificacaoPessoalEDadosDaFamilia() {
        // US-3.3: o fluxo antigo só anonimizava contato/saúde e deixava nome, pais,
        // e-mails e dados de trabalho/renda da família no cadastro do aluno removido.
        Discente d = alunoCompleto();
        when(discenteRepository.findByMatricula("2026001")).thenReturn(d);
        doReturn(ResponseEntity.ok("ok")).when(diarioService).deleteDiarioByMatricula("2026001");

        ResponseEntity<String> response = discenteService.remover("2026001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("false", d.getStatus());
        assertEquals("Aluno removido", d.getNome());
        assertNull(d.getNome_mae());
        assertNull(d.getNome_pai());
        assertNull(d.getEmail());
        assertNull(d.getEmail_responsavel());
        assertNull(d.getOutro_familiar());
        assertNull(d.getLocal_trabalho_mae());
        assertNull(d.getLocal_trabalho_pai());
        assertNull(d.getOcupacao_mae());
        assertNull(d.getOcupacao_pai());
        assertNull(d.getRenda_total());
        assertNull(d.getHorario_medicamento());
        assertEquals("Anonimizado", d.getCidade());
        // Contato e saúde continuam anonimizados como antes
        assertEquals("Anonimizado", d.getDoenca());
        assertEquals("Anonimizado", d.getRg());
        assertEquals("Anonimizado", d.getEndereco());
        verify(discenteRepository).save(d);
    }

    @Test
    public void testRemoverPreservaMatriculaSalaTurnoSexoEAnoDeNascimento() {
        // A matrícula NÃO pode mudar: a numeração de novos alunos usa
        // COUNT(*) ... LIKE 'AAAA%'; trocá-la geraria matrículas duplicadas.
        Discente d = alunoCompleto();
        when(discenteRepository.findByMatricula("2026001")).thenReturn(d);
        doReturn(ResponseEntity.ok("ok")).when(diarioService).deleteDiarioByMatricula("2026001");

        discenteService.remover("2026001");

        assertEquals("2026001", d.getMatricula());
        assertEquals(3, d.getSala());
        assertEquals("manha", d.getTurno());
        assertEquals("F", d.getSexo());
        assertEquals(LocalDate.of(2015, 1, 1), d.getData());
    }

    @Test
    public void testRemoverPropagaParaFrequenciaOcorrenciaEDiario() {
        Discente d = alunoCompleto();
        Ocorrencia o1 = new Ocorrencia();
        o1.setMatricula_discente("2026001");
        o1.setCategoria(CategoriaOcorrencia.COMPORTAMENTAL);
        o1.setDescricao("Discutiu com o colega João durante o lanche");
        o1.setAutor_login("PROF001");
        o1.setData_ocorrencia(LocalDate.of(2026, 3, 10));
        Ocorrencia o2 = new Ocorrencia();
        o2.setMatricula_discente("2026001");
        o2.setCategoria(CategoriaOcorrencia.PEDAGOGICA);
        o2.setDescricao("Dificuldade de leitura, mãe Ana avisada");
        o2.setAutor_login("PROF002");
        o2.setData_ocorrencia(LocalDate.of(2026, 4, 2));
        List<Ocorrencia> ocorrencias = List.of(o1, o2);

        when(discenteRepository.findByMatricula("2026001")).thenReturn(d);
        when(ocorrenciaRepository.findAllByMatriculaOrdenadoPorDataDesc("2026001")).thenReturn(ocorrencias);
        doReturn(ResponseEntity.ok("ok")).when(diarioService).deleteDiarioByMatricula("2026001");

        discenteService.remover("2026001");

        verify(frequenciaDiscenteRepository).anonimizarNomePorMatricula("2026001", "Aluno removido");
        assertEquals("Conteúdo removido por eliminação de dados do aluno", o1.getDescricao());
        assertEquals("Conteúdo removido por eliminação de dados do aluno", o2.getDescricao());
        assertEquals(CategoriaOcorrencia.COMPORTAMENTAL, o1.getCategoria());
        assertEquals(LocalDate.of(2026, 4, 2), o2.getData_ocorrencia());
        assertEquals("PROF002", o2.getAutor_login());
        verify(ocorrenciaRepository).saveAll(ocorrencias);
        verify(diarioService).deleteDiarioByMatricula("2026001");
    }

    @Test
    public void testRemoverNaoFalhaQuandoAlunoNaoTemDiario() {
        Discente d = alunoCompleto();
        when(discenteRepository.findByMatricula("2026001")).thenReturn(d);
        doReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Diário não encontrado")).when(diarioService).deleteDiarioByMatricula("2026001");

        ResponseEntity<String> response = discenteService.remover("2026001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Aluno removido", d.getNome());
    }

    @Test
    public void testRemoverFalhaPorInteiroQuandoDiarioNaoPodeSerApagado() {
        // Tudo ou nada: a exceção faz a transação desfazer as demais alterações.
        Discente d = alunoCompleto();
        when(discenteRepository.findByMatricula("2026001")).thenReturn(d);
        doReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Falha ao deletar o diário: disco")).when(diarioService).deleteDiarioByMatricula("2026001");

        assertThrows(IllegalStateException.class, () -> discenteService.remover("2026001"));
    }

    @Test
    public void testRemoverDiscenteNaoExistenteNaoMexeEmOutrasTabelas() {
        when(discenteRepository.findByMatricula("9999")).thenReturn(null);

        discenteService.remover("9999");

        verifyNoInteractions(frequenciaDiscenteRepository, ocorrenciaRepository, diarioService);
    }

    @Test
    public void testAlterarAvaliacoesComPermissaoRendimento() {
        String matricula = "2026001";
        Discente discente = new Discente();
        discente.setMatricula(matricula);
        
        DiscenteAvaliacaoDTO dto = new DiscenteAvaliacaoDTO();
        dto.setAvaliacaoRendimento(4.5);
        dto.setAvaliacaoPsicologico(3.0);

        when(discenteRepository.findByMatricula(matricula)).thenReturn(discente);
        
        // Mocking SecurityContext
        Authentication auth = Mockito.mock(Authentication.class);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        try (MockedStatic<SecurityContextHolder> mockedSecurity = Mockito.mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            when(permissaoService.hasPermission(auth, "EDITAR_RENDIMENTO")).thenReturn(true);
            when(permissaoService.hasPermission(auth, "EDITAR_AVALIACAO_PSICO")).thenReturn(false);

            ResponseEntity<?> response = discenteService.alterarAvaliacoes(matricula, dto);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(4.5, discente.getAvaliacaoRendimento());
            assertEquals(null, discente.getAvaliacaoPsicologico());
            verify(discenteRepository).save(discente);
        }
    }

    @Test
    public void testAlterarAvaliacoesComPermissaoPsico() {
        String matricula = "2026001";
        Discente discente = new Discente();
        discente.setMatricula(matricula);
        
        DiscenteAvaliacaoDTO dto = new DiscenteAvaliacaoDTO();
        dto.setAvaliacaoRendimento(4.5);
        dto.setAvaliacaoPsicologico(3.0);

        when(discenteRepository.findByMatricula(matricula)).thenReturn(discente);
        
        // Mocking SecurityContext
        Authentication auth = Mockito.mock(Authentication.class);
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        try (MockedStatic<SecurityContextHolder> mockedSecurity = Mockito.mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            
            when(permissaoService.hasPermission(auth, "EDITAR_RENDIMENTO")).thenReturn(false);
            when(permissaoService.hasPermission(auth, "EDITAR_AVALIACAO_PSICO")).thenReturn(true);

            ResponseEntity<?> response = discenteService.alterarAvaliacoes(matricula, dto);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(null, discente.getAvaliacaoRendimento());
            assertEquals(3.0, discente.getAvaliacaoPsicologico());
        }
    }
}
