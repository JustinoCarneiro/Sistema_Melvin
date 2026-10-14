package br.com.melvin.sistema.shared.service;

import br.com.melvin.sistema.domain.calendario.model.DiaNaoLetivo;
import br.com.melvin.sistema.domain.calendario.repository.DiaNaoLetivoRepository;
import br.com.melvin.sistema.domain.discente.model.Discente;
import br.com.melvin.sistema.domain.frequencia.model.FrequenciaDiscente;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExcelExportServiceTest {

    @Mock
    private DiaNaoLetivoRepository diaNaoLetivoRepository;

    @InjectMocks
    private ExcelExportService excelExportService;

    private Discente aluno1;
    private FrequenciaDiscente freq1;
    private DiaNaoLetivo feriado;

    @BeforeEach
    void setUp() {
        aluno1 = new Discente();
        aluno1.setNome("João Silva");
        aluno1.setMatricula("123");
        aluno1.setSala(1);
        aluno1.setTurno("Manha");

        freq1 = new FrequenciaDiscente();
        freq1.setMatricula("123");
        freq1.setData(LocalDate.of(2023, 11, 1));
        freq1.setPresenca_manha("P");

        feriado = new DiaNaoLetivo();
        feriado.setData(LocalDate.of(2023, 11, 2));
        feriado.setDescricao("Finados");
    }

    @Test
    void deveExportarFrequenciaComFinaisDeSemanaEFeriados() throws IOException {
        when(diaNaoLetivoRepository.findByDataBetween(any(), any())).thenReturn(Arrays.asList(feriado));

        List<Discente> discentes = Arrays.asList(aluno1);
        List<FrequenciaDiscente> frequencias = Arrays.asList(freq1);

        // Mês 11 de 2023:
        // 1/11: Quarta-feira (Letivo)
        // 2/11: Quinta-feira (Feriado)
        // 4/11: Sábado (Fim de semana)

        ByteArrayInputStream is = excelExportService.exportarFrequencia(discentes, frequencias, 11, 2023);

        Workbook workbook = new XSSFWorkbook(is);
        Sheet sheet = workbook.getSheetAt(0);

        assertThat(sheet.getSheetName()).isEqualTo("Frequência 11-2023");

        Row rowAluno = sheet.getRow(1);
        assertThat(rowAluno.getCell(0).getStringCellValue()).isEqualTo("João Silva");

        // Colunas de frequência começam no índice 4 (3 + dia)
        // Dia 1 (Quarta) -> Índice 4
        Cell cellDia1 = rowAluno.getCell(4);
        assertThat(cellDia1.getStringCellValue()).isEqualTo("P");

        // Dia 2 (Quinta - Feriado) -> Índice 5
        Cell cellDia2 = rowAluno.getCell(5);
        assertThat(cellDia2.getStringCellValue()).isEqualTo("FER");

        // Dia 4 (Sábado - FDS) -> Índice 7
        Cell cellDia4 = rowAluno.getCell(7);
        assertThat(cellDia4.getStringCellValue()).isEqualTo("FDS");

        // Dia 5 (Domingo - FDS) -> Índice 8
        Cell cellDia5 = rowAluno.getCell(8);
        assertThat(cellDia5.getStringCellValue()).isEqualTo("FDS");

        workbook.close();
    }

    // Colunas da planilha de alunos: 63 = Avaliação Psicológico, 64 = Média Geral
    private Discente alunoComNotas() {
        Discente aluno = new Discente();
        aluno.setMatricula("2026001");
        aluno.setNome("Aluno de Teste");
        aluno.setSala(1);
        aluno.setTurno("Manha");
        aluno.setAvaliacaoPresenca(6.0);
        aluno.setAvaliacaoParticipacao(6.0);
        aluno.setAvaliacaoComportamento(6.0);
        aluno.setAvaliacaoRendimento(6.0);
        aluno.setAvaliacaoPsicologico(10.0);
        return aluno;
    }

    @Test
    void planilhaDeAlunosComNotaPsicologicaTrazANotaEAMediaDeCincoNotas() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(
                excelExportService.exportarDiscentesParaExcel(List.of(alunoComNotas()), true))) {
            Sheet sheet = workbook.getSheetAt(0);

            assertThat(sheet.getRow(0).getCell(64).getStringCellValue()).isEqualTo("Média Geral");
            assertThat(sheet.getRow(1).getCell(63).getNumericCellValue()).isEqualTo(10.0);
            assertThat(sheet.getRow(1).getCell(64).getNumericCellValue()).isCloseTo(6.8, within(0.001));
        }
    }

    @Test
    void planilhaDeAlunosSemNotaPsicologicaOmiteANotaEUsaSoAsQuatroPedagogicas() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(
                excelExportService.exportarDiscentesParaExcel(List.of(alunoComNotas()), false))) {
            Sheet sheet = workbook.getSheetAt(0);
            Row linha = sheet.getRow(1);

            Cell nota = linha.getCell(63);
            assertThat(nota == null || nota.getCellType() == CellType.BLANK).isTrue();
            assertThat(sheet.getRow(0).getCell(64).getStringCellValue()).isEqualTo("Média Pedagógica");
            assertThat(linha.getCell(64).getNumericCellValue()).isCloseTo(6.0, within(0.001));

            // nem a nota nem uma média que a inclua podem aparecer em qualquer célula da linha
            for (Cell celula : linha) {
                if (celula.getCellType() == CellType.NUMERIC) {
                    assertThat(celula.getNumericCellValue()).isNotEqualTo(10.0);
                    assertThat(celula.getNumericCellValue()).isNotCloseTo(6.8, within(0.001));
                }
            }
        }
    }
}
