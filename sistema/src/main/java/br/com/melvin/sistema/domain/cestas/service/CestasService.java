package br.com.melvin.sistema.domain.cestas.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;
import br.com.melvin.sistema.domain.cestas.repository.CestasRepository;
import br.com.melvin.sistema.shared.service.EmailService;
import br.com.melvin.sistema.shared.service.QrCodeService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@SuppressWarnings("null")
@Slf4j
public class CestasService {

    @Autowired
    CestasRepository repositorio;

    @Autowired
    EmailService emailService;

    @Autowired
    QrCodeService qrCodeService;

    public List<Cestas> listar(){
        return repositorio.findAll();
    }

    public ResponseEntity<?> adicionar(Cestas cesta){
        // Garante que é uma criação (ID null)
        cesta.setId(null); 
        Cestas savedCesta = repositorio.save(cesta);
        return new ResponseEntity<Cestas>(savedCesta, HttpStatus.CREATED); 
    }

    public ResponseEntity<?> alterar(Cestas cestaAtualizada){
        // Verifica se o ID veio na requisição
        if (cestaAtualizada.getId() == null) {
            return new ResponseEntity<String>("ID da doação não informado para alteração.", HttpStatus.BAD_REQUEST);
        }

        // Busca pelo ID (Muito mais seguro que Nome + Data)
        Optional<Cestas> existenteOpt = repositorio.findById(cestaAtualizada.getId());

        if (existenteOpt.isEmpty()) {
            return new ResponseEntity<String>("Doação não encontrada no banco de dados!", HttpStatus.NOT_FOUND);
        } else {
            Cestas existente = existenteOpt.get();

            // Atualiza TODOS os campos com os dados novos que vieram do Frontend
            existente.setNome(cestaAtualizada.getNome());
            existente.setCpf(cestaAtualizada.getCpf());
            existente.setContato(cestaAtualizada.getContato());
            existente.setOperacao(cestaAtualizada.getOperacao());
            
            // --- NOVO CAMPO ADICIONADO ---
            existente.setVoluntario(cestaAtualizada.getVoluntario());
            
            existente.setLider_celula(cestaAtualizada.getLider_celula());
            existente.setPastor_rede(cestaAtualizada.getPastor_rede());
            existente.setRede(cestaAtualizada.getRede());
            existente.setResponsavel(cestaAtualizada.getResponsavel());
            
            existente.setItens_doados(cestaAtualizada.getItens_doados());
            existente.setTipo(cestaAtualizada.getTipo());
            existente.setPeso(cestaAtualizada.getPeso());
            existente.setFrequencia(cestaAtualizada.getFrequencia());
            
            existente.setDataEntrega(cestaAtualizada.getDataEntrega());

            return new ResponseEntity<Cestas>(repositorio.save(existente), HttpStatus.OK);
        }
    }

    // Método de remover agora deve receber o ID, ou extrair o ID do objeto
    public ResponseEntity<String> remover(UUID id){
        if(!repositorio.existsById(id)){
            return new ResponseEntity<String>("Doação não encontrada!", HttpStatus.NOT_FOUND);
        } else {
            repositorio.deleteById(id);
            return new ResponseEntity<String>("Doação removida com sucesso!", HttpStatus.OK);
        }
    }

    // ============ US-7.4: Solicitação de Cesta (link público) ============

    public ResponseEntity<?> solicitar(Cestas solicitacao) {
        // `nome` (do beneficiário) entra na validação porque é NOT NULL no banco,
        // herdado do cadastro direto — sem isso o insert estoura 500 em vez de 400.
        if (solicitacao.getNomeSolicitante() == null || solicitacao.getNomeSolicitante().isEmpty()
                || solicitacao.getNivelSolicitante() == null
                || solicitacao.getNome() == null || solicitacao.getNome().isEmpty()) {
            return new ResponseEntity<String>(
                    "Nome do solicitante, nível na hierarquia e nome do beneficiário são obrigatórios!",
                    HttpStatus.BAD_REQUEST);
        }

        // Nunca confiar em campos de fluxo interno vindos do payload público —
        // a solicitação sempre nasce limpa, do zero.
        solicitacao.setId(null);
        solicitacao.setStatus(StatusCesta.SOLICITADA);
        solicitacao.setDataRetirada(null);
        solicitacao.setEntregueEm(null);

        Cestas salva = repositorio.save(solicitacao);
        notificarCoordenacao(salva);
        return new ResponseEntity<Cestas>(salva, HttpStatus.CREATED);
    }

    // US-7.4: sem este aviso a solicitação entra no sistema e ninguém fica sabendo —
    // a coordenação precisaria abrir a tela periodicamente pra descobrir. Best-effort:
    // EmailService já engole falha de envio, não derruba a criação da solicitação.
    private void notificarCoordenacao(Cestas solicitacao) {
        String corpo = "Uma nova solicitação de cesta básica foi recebida.\n\n"
                + "Solicitante: " + solicitacao.getNomeSolicitante()
                + " (" + solicitacao.getNivelSolicitante() + ")\n"
                + "E-mail do solicitante: " + (solicitacao.getEmailSolicitante() != null ? solicitacao.getEmailSolicitante() : "-") + "\n"
                + "Beneficiário: " + solicitacao.getNome() + "\n"
                + "Contato: " + (solicitacao.getContato() != null ? solicitacao.getContato() : "-") + "\n"
                + "Célula: " + (solicitacao.getLider_celula() != null ? solicitacao.getLider_celula() : "-") + "\n"
                + "Rede: " + (solicitacao.getRede() != null ? solicitacao.getRede() : "-") + "\n"
                + "Observações: " + (solicitacao.getItens_doados() != null ? solicitacao.getItens_doados() : "-") + "\n\n"
                + "Acesse o painel para validar e agendar a retirada.";

        emailService.notifyInstituto("Nova solicitação de cesta básica", corpo);
    }

    public List<Cestas> listarSolicitacoes() {
        return repositorio.findAllByStatus(StatusCesta.SOLICITADA);
    }

    public ResponseEntity<?> validar(UUID id, LocalDate dataRetirada) {
        Optional<Cestas> existenteOpt = repositorio.findById(id);
        if (existenteOpt.isEmpty()) {
            return new ResponseEntity<String>("Solicitação não encontrada!", HttpStatus.NOT_FOUND);
        }

        Cestas existente = existenteOpt.get();
        if (existente.getStatus() != StatusCesta.SOLICITADA) {
            return new ResponseEntity<String>(
                    "Solicitação não está pendente de validação (status atual: " + existente.getStatus() + ").",
                    HttpStatus.CONFLICT);
        }

        existente.setStatus(StatusCesta.AGENDADA);
        existente.setDataRetirada(dataRetirada);
        // Gerado sempre (não só quando há e-mail): a coordenação pode ver/baixar o QR
        // manualmente pela tela mesmo sem envio automático.
        existente.setQrCodeToken(UUID.randomUUID().toString());

        Cestas salva = repositorio.save(existente);

        if (salva.getEmailSolicitante() != null && !salva.getEmailSolicitante().isBlank()) {
            enviarQrCodePorEmail(salva);
        }

        return new ResponseEntity<Cestas>(salva, HttpStatus.OK);
    }

    // Best-effort: falha no envio do e-mail não derruba a validação, que já
    // aconteceu e foi persistida. O botão "Confirmar Entrega" continua funcionando
    // mesmo se o e-mail nunca sair.
    private void enviarQrCodePorEmail(Cestas cesta) {
        try {
            byte[] qrPng = qrCodeService.gerarPng(cesta.getQrCodeToken());
            String dataFormatada = cesta.getDataRetirada().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            String corpo = "Olá, " + cesta.getNomeSolicitante() + "!\n\n"
                    + "A solicitação de cesta básica para " + cesta.getNome() + " foi agendada.\n"
                    + "Data de retirada: " + dataFormatada + "\n\n"
                    + "Leve o QR Code em anexo (impresso ou no celular) no dia da retirada — "
                    + "ele agiliza a confirmação na entrega. Se não for possível levá-lo, "
                    + "a equipe do Instituto também consegue confirmar manualmente pelo nome.";

            emailService.sendEmailComAnexo(cesta.getEmailSolicitante(), "Cesta básica agendada — Instituto Melvin",
                    corpo, "qrcode-retirada.png", qrPng, "image/png");
        } catch (Exception e) {
            log.error("Falha ao gerar/enviar QR Code por e-mail para solicitação {}", cesta.getId(), e);
        }
    }

    public List<Cestas> listarAgendadas() {
        return repositorio.findAllByStatus(StatusCesta.AGENDADA);
    }

    // US-7.4 (reintroduzido): confirmação de entrega manual, direto pelo ID — caminho
    // ALTERNATIVO, pra quando o QR Code não estiver disponível/legível.
    public ResponseEntity<?> confirmarEntrega(UUID id) {
        Optional<Cestas> existenteOpt = repositorio.findById(id);
        if (existenteOpt.isEmpty()) {
            return new ResponseEntity<String>("Solicitação não encontrada!", HttpStatus.NOT_FOUND);
        }
        return confirmarEntregaInterno(existenteOpt.get());
    }

    // US-7.4 (reintroduzido): confirmação de entrega por scan de QR Code — caminho
    // PRINCIPAL. O token não é adivinhável (UUID aleatório gerado na validação).
    public ResponseEntity<?> confirmarEntregaPorToken(String token) {
        Cestas existente = repositorio.findByQrCodeToken(token);
        if (existente == null) {
            return new ResponseEntity<String>("QR Code inválido ou não reconhecido.", HttpStatus.NOT_FOUND);
        }
        return confirmarEntregaInterno(existente);
    }

    private ResponseEntity<?> confirmarEntregaInterno(Cestas existente) {
        if (existente.getStatus() == StatusCesta.ENTREGUE) {
            String dataFormatada = existente.getEntregueEm()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            return new ResponseEntity<String>(
                    "Esta cesta já foi confirmada como entregue em " + dataFormatada + ".", HttpStatus.CONFLICT);
        }

        if (existente.getStatus() != StatusCesta.AGENDADA) {
            return new ResponseEntity<String>(
                    "Solicitação não está agendada para retirada (status atual: " + existente.getStatus() + ").",
                    HttpStatus.CONFLICT);
        }

        existente.setStatus(StatusCesta.ENTREGUE);
        existente.setEntregueEm(LocalDateTime.now());

        return new ResponseEntity<Cestas>(repositorio.save(existente), HttpStatus.OK);
    }

    // US-7.4 (reintroduzido): permite à coordenação ver/baixar o QR Code manualmente
    // (ex.: e-mail não foi cadastrado, ou se perdeu) — não depende do envio automático.
    public ResponseEntity<byte[]> obterQrCode(UUID id) {
        Optional<Cestas> existenteOpt = repositorio.findById(id);
        if (existenteOpt.isEmpty() || existenteOpt.get().getQrCodeToken() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] png = qrCodeService.gerarPng(existenteOpt.get().getQrCodeToken());
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
        } catch (Exception e) {
            log.error("Falha ao gerar QR Code para solicitação {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}