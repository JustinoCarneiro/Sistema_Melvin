package br.com.melvin.sistema.services;

import br.com.melvin.sistema.model.integrantes.Discente;
import br.com.melvin.sistema.model.frequencias.FrequenciaDiscente; // Importante
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class ExcelExportService {

    public ByteArrayInputStream exportarDiscentesParaExcel(List<Discente> discentes) throws IOException {
        String[] COLUNAS = {
            "Matrícula", "Nome", "Email", "Contato", "Sexo", "Data de Nascimento", "Cor/Raça", "Nacionalidade",
            "Endereço", "Bairro", "Cidade", "RG/CPF", "Sala", "Turno", "Status",
            "Nome do Pai", "Contato do Pai", "Instrução do Pai", "Ocupação do Pai", "Local de Trabalho (Pai)", "Contato de Trabalho (Pai)", "Alfabetização (Pai)", "Estado Civil (Pai)",
            "Nome da Mãe", "Contato da Mãe", "Instrução da Mãe", "Ocupação da Mãe", "Local de Trabalho (Mãe)", "Contato de Trabalho (Mãe)", "Alfabetização (Mãe)", "Estado Civil (Mãe)",
            "Qtd. Filhos", "Benefício do Governo", "Meio de Transporte", "Qtd. Transporte", "Mora com Familiar", "Outro Familiar", "Todos Moram na Casa", "Renda Total",
            "Qtd. CLT", "Qtd. Autônomo", "Família Congrega", "Gostaria de Congregar",
            "Doença", "Medicação", "Remédio no Instituto", "Tratamento", "Horário Medicamento", "Pode Praticar Esportes",
            "Autorizado Sair Com", "Contato Saída",
            "Karatê", "Ballet", "Informática", "Música", "Artesanato", "Futsal", "Inglês", "Teatro",
            "Avaliação Presença", "Avaliação Participação", "Avaliação Comportamento", "Avaliação Rendimento", "Avaliação Psicológico", "Média Geral"
        };

        try (
            Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            Sheet sheet = workbook.createSheet("Discentes");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < COLUNAS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(COLUNAS[col]);
            }

            int rowIdx = 1;
            for (Discente discente : discentes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(discente.getMatricula());
                row.createCell(1).setCellValue(discente.getNome());
                row.createCell(2).setCellValue(discente.getEmail());
                row.createCell(3).setCellValue(discente.getContato());
                row.createCell(4).setCellValue(discente.getSexo());
                row.createCell(5).setCellValue(discente.getData() != null ? discente.getData().toString() : "");
                row.createCell(6).setCellValue(discente.getCor());
                row.createCell(7).setCellValue(discente.getNacionalidade());
                row.createCell(8).setCellValue(discente.getEndereco());
                row.createCell(9).setCellValue(discente.getBairro());
                row.createCell(10).setCellValue(discente.getCidade());
                row.createCell(11).setCellValue(discente.getRg());
                row.createCell(12).setCellValue(discente.getSala());
                row.createCell(13).setCellValue(discente.getTurno());
                row.createCell(14).setCellValue(discente.getStatus());
                row.createCell(15).setCellValue(discente.getNome_pai());
                row.createCell(16).setCellValue(discente.getContato_pai());
                row.createCell(17).setCellValue(discente.getInstrucao_pai());
                row.createCell(18).setCellValue(discente.getOcupacao_pai());
                row.createCell(19).setCellValue(discente.getLocal_trabalho_pai());
                row.createCell(20).setCellValue(discente.getContato_trabalho_pai());
                row.createCell(21).setCellValue(discente.getAlfabetizacao_pai());
                row.createCell(22).setCellValue(discente.getEstado_civil_pai());
                row.createCell(23).setCellValue(discente.getNome_mae());
                row.createCell(24).setCellValue(discente.getContato_mae());
                row.createCell(25).setCellValue(discente.getInstrucao_mae());
                row.createCell(26).setCellValue(discente.getOcupacao_mae());
                row.createCell(27).setCellValue(discente.getLocal_trabalho_mae());
                row.createCell(28).setCellValue(discente.getContato_trabalho_mae());
                row.createCell(29).setCellValue(discente.getAlfabetizacao_mae());
                row.createCell(30).setCellValue(discente.getEstado_civil_mae());
                row.createCell(31).setCellValue(discente.getQtd_filho());
                row.createCell(32).setCellValue(discente.getBeneficio_governo());
                row.createCell(33).setCellValue(discente.getMeio_transporte());
                row.createCell(34).setCellValue(discente.getQtd_transporte());
                row.createCell(35).setCellValue(discente.getMora_familiar());
                row.createCell(36).setCellValue(discente.getOutro_familiar());
                row.createCell(37).setCellValue(discente.getTodos_moram_casa());
                row.createCell(38).setCellValue(discente.getRenda_total());
                row.createCell(39).setCellValue(discente.getClt());
                row.createCell(40).setCellValue(discente.getAutonomo());
                row.createCell(41).setCellValue(discente.getFamilia_congrega());
                row.createCell(42).setCellValue(discente.getGostaria_congregar());
                row.createCell(43).setCellValue(discente.getDoenca());
                row.createCell(44).setCellValue(discente.getMedicacao());
                row.createCell(45).setCellValue(discente.getRemedio_instituto());
                row.createCell(46).setCellValue(discente.getTratamento());
                row.createCell(47).setCellValue(discente.getHorario_medicamento());
                row.createCell(48).setCellValue(discente.getEsportes());
                row.createCell(49).setCellValue(discente.getSaida_aluno());
                row.createCell(50).setCellValue(discente.getContato_saida());
                row.createCell(51).setCellValue(discente.isKarate() ? "Sim" : "Não");
                row.createCell(52).setCellValue(discente.isBallet() ? "Sim" : "Não");
                row.createCell(53).setCellValue(discente.isInformatica() ? "Sim" : "Não");
                row.createCell(54).setCellValue(discente.isMusica() ? "Sim" : "Não");
                row.createCell(55).setCellValue(discente.isArtesanato() ? "Sim" : "Não");
                row.createCell(56).setCellValue(discente.isFutsal() ? "Sim" : "Não");
                row.createCell(57).setCellValue(discente.isIngles() ? "Sim" : "Não");
                row.createCell(58).setCellValue(discente.isTeatro() ? "Sim" : "Não");

                Double presenca = discente.getAvaliacaoPresenca() != null ? discente.getAvaliacaoPresenca() : 0.0;
                Double participacao = discente.getAvaliacaoParticipacao() != null ? discente.getAvaliacaoParticipacao() : 0.0;
                Double comportamento = discente.getAvaliacaoComportamento() != null ? discente.getAvaliacaoComportamento() : 0.0;
                Double rendimento = discente.getAvaliacaoRendimento() != null ? discente.getAvaliacaoRendimento() : 0.0;
                Double psicologico = discente.getAvaliacaoPsicologico() != null ? discente.getAvaliacaoPsicologico() : 0.0;
                
                row.createCell(59).setCellValue(presenca);
                row.createCell(60).setCellValue(participacao);
                row.createCell(61).setCellValue(comportamento);
                row.createCell(62).setCellValue(rendimento);
                row.createCell(63).setCellValue(psicologico);

                double media = (presenca + participacao + comportamento + rendimento + psicologico) / 5.0;
                row.createCell(64).setCellValue(media);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
    
    // MÉTODO NOVO PARA EXPORTAÇÃO DE FREQUÊNCIA
    public ByteArrayInputStream exportarFrequencia(List<Discente> discentes, List<FrequenciaDiscente> frequencias, int mes, int ano) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Frequência " + mes + "-" + ano);

            // Determinar dias do mês
            YearMonth yearMonth = YearMonth.of(ano, mes);
            int diasNoMes = yearMonth.lengthOfMonth();

            // --- CABEÇALHO ---
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Nome do Aluno");
            headerRow.createCell(1).setCellValue("Matrícula");
            headerRow.createCell(2).setCellValue("Turma");
            headerRow.createCell(3).setCellValue("Turno");

            // Criar colunas para cada dia
            for (int dia = 1; dia <= diasNoMes; dia++) {
                headerRow.createCell(3 + dia).setCellValue(dia + "/" + mes);
            }
            
            // --- LINHAS (ALUNOS) ---
            int rowIdx = 1;
            for (Discente aluno : discentes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aluno.getNome());
                row.createCell(1).setCellValue(aluno.getMatricula());
                row.createCell(2).setCellValue(aluno.getSala());
                row.createCell(3).setCellValue(aluno.getTurno());

                // Preencher Presenças
                for (int dia = 1; dia <= diasNoMes; dia++) {
                    LocalDate dataAtual = LocalDate.of(ano, mes, dia);
                    
                    FrequenciaDiscente registro = frequencias.stream()
                        .filter(f -> f.getMatricula().equals(aluno.getMatricula()) && f.getData().isEqual(dataAtual))
                        .findFirst()
                        .orElse(null);

                    String status = "-";
                    if (registro != null) {
                        String turnoAluno = aluno.getTurno() != null ? aluno.getTurno().toLowerCase() : "";
                        boolean isManha = turnoAluno.contains("manha") || turnoAluno.contains("matutino");
                        
                        String valor = isManha ? registro.getPresenca_manha() : registro.getPresenca_tarde();
                        
                        if (valor != null) {
                            if (valor.equalsIgnoreCase("P") || valor.equalsIgnoreCase("TRUE") || valor.equalsIgnoreCase("OBS")) status = "P";
                            else if (valor.equalsIgnoreCase("F") || valor.equalsIgnoreCase("FALSE")) status = "F";
                            else if (valor.equalsIgnoreCase("J") || valor.equalsIgnoreCase("FJ") || valor.equalsIgnoreCase("JUSTIFICADA")) status = "FJ";
                        }
                    }
                    row.createCell(3 + dia).setCellValue(status);
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}