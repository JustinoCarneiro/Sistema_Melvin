package br.com.melvin.sistema.security.config;

import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.discente.service.DiscenteService;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Nota psicológica nas rotas de aluno (decisão do Instituto, 14/10/2026): só PSICO e COOR a
 * recebem. Para os demais cargos o campo é omitido da resposta (a tela depende dessa ausência
 * para esconder a linha) e a planilha sai sem a nota e com a média só das quatro pedagógicas.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotaPsicologicaDiscenteSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermissaoService permissaoService;

    @MockBean
    private DiscenteService discenteService;

    @BeforeEach
    void liberaVisualizarAlunosEPreparaUmAlunoComNotas() throws Exception {
        when(permissaoService.hasPermission(any(Authentication.class), eq("VISUALIZAR_ALUNOS"))).thenReturn(true);
        when(permissaoService.hasPermission(any(Authentication.class), eq("CADASTRAR_ALUNO"))).thenReturn(true);

        Discente aluno = new Discente();
        aluno.setMatricula("2026001");
        aluno.setNome("Aluno de Teste");
        aluno.setAvaliacaoRendimento(8.0);
        aluno.setAvaliacaoPsicologico(7.5);
        when(discenteService.capturaPorMatricula("2026001")).thenReturn(aluno);
        doReturn(new ResponseEntity<Discente>(aluno, HttpStatus.CREATED)).when(discenteService).cadastrar(any(Discente.class));
        doReturn(new ResponseEntity<Discente>(aluno, HttpStatus.OK)).when(discenteService).alterar(any(Discente.class));
        when(discenteService.exportarDiscentes(any(), anyBoolean())).thenReturn(new ByteArrayInputStream(new byte[] {1}));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PROF", "ASSIST", "AUX", "DIRE", "ADM", "TECH"})
    void fichaDoAlunoNaoTrazANotaPsicologicaParaOsDemaisCargos(String cargo) throws Exception {
        mockMvc.perform(get("/discente/matricula/2026001").with(user("usuario").roles(cargo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avaliacaoRendimento").value(8.0))
                .andExpect(content().string(not(containsString("avaliacaoPsicologico"))));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PSICO", "COOR"})
    void fichaDoAlunoTrazANotaPsicologicaParaPsicologiaECoordenacao(String cargo) throws Exception {
        mockMvc.perform(get("/discente/matricula/2026001").with(user("usuario").roles(cargo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avaliacaoRendimento").value(8.0))
                .andExpect(jsonPath("$.avaliacaoPsicologico").value(7.5));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PROF", "ASSIST", "AUX", "DIRE", "ADM", "TECH"})
    void planilhaDeAlunosSaiSemANotaPsicologicaParaOsDemaisCargos(String cargo) throws Exception {
        mockMvc.perform(get("/discente/export").with(user("usuario").roles(cargo)))
                .andExpect(status().isOk());

        verify(discenteService).exportarDiscentes(isNull(), eq(false));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PSICO", "COOR"})
    void planilhaDeAlunosTrazANotaPsicologicaParaPsicologiaECoordenacao(String cargo) throws Exception {
        mockMvc.perform(get("/discente/export").with(user("usuario").roles(cargo)))
                .andExpect(status().isOk());

        verify(discenteService).exportarDiscentes(isNull(), eq(true));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PROF", "ASSIST", "AUX", "DIRE", "ADM", "TECH"})
    void cadastroEEdicaoDeAlunoNaoDevolvemANotaPsicologicaParaOsDemaisCargos(String cargo) throws Exception {
        String corpo = "{\"matricula\":\"2026001\",\"nome\":\"Aluno de Teste\"}";

        mockMvc.perform(post("/discente").contentType(MediaType.APPLICATION_JSON).content(corpo)
                        .with(user("usuario").roles(cargo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.matricula").value("2026001"))
                .andExpect(content().string(not(containsString("avaliacaoPsicologico"))));

        mockMvc.perform(put("/discente").contentType(MediaType.APPLICATION_JSON).content(corpo)
                        .with(user("usuario").roles(cargo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricula").value("2026001"))
                .andExpect(content().string(not(containsString("avaliacaoPsicologico"))));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PSICO", "COOR"})
    void cadastroEEdicaoDeAlunoDevolvemANotaPsicologicaParaPsicologiaECoordenacao(String cargo) throws Exception {
        String corpo = "{\"matricula\":\"2026001\",\"nome\":\"Aluno de Teste\"}";

        mockMvc.perform(put("/discente").contentType(MediaType.APPLICATION_JSON).content(corpo)
                        .with(user("usuario").roles(cargo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avaliacaoPsicologico").value(7.5));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PSICO", "COOR"})
    void fichaSemNotaPsicologicaLancadaTrazAChaveNulaParaPsicologiaECoordenacao(String cargo) throws Exception {
        // A tela decide mostrar a linha pela presença da chave: nota ainda nula precisa continuar
        // aparecendo para quem a recebe, senão Psicologia não conseguiria lançar a primeira nota.
        Discente semNota = new Discente();
        semNota.setMatricula("2026002");
        semNota.setNome("Aluno Sem Nota");
        when(discenteService.capturaPorMatricula("2026002")).thenReturn(semNota);

        mockMvc.perform(get("/discente/matricula/2026002").with(user("usuario").roles(cargo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avaliacaoPsicologico").hasJsonPath())
                .andExpect(jsonPath("$.avaliacaoPsicologico").doesNotExist());
    }
}
