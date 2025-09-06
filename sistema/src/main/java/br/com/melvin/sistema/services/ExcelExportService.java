package br.com.melvin.sistema.services;

import br.com.melvin.sistema.model.integrantes.Discente;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
                // ... (continue preenchendo todas as 50 colunas de dados)
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
}