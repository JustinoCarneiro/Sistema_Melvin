package br.com.melvin.sistema.domain.cestas.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.cestas.model.Cestas;
import br.com.melvin.sistema.domain.cestas.model.StatusCesta;
import br.com.melvin.sistema.domain.cestas.repository.CestasRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
@SuppressWarnings("null")
public class CestasService {
    
    @Autowired
    CestasRepository repositorio;

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
        if (solicitacao.getNomeSolicitante() == null || solicitacao.getNomeSolicitante().isEmpty()
                || solicitacao.getNivelSolicitante() == null) {
            return new ResponseEntity<String>(
                    "Nome do solicitante e nível na hierarquia são obrigatórios!", HttpStatus.BAD_REQUEST);
        }

        // Nunca confiar em campos de fluxo interno vindos do payload público —
        // a solicitação sempre nasce limpa, do zero.
        solicitacao.setId(null);
        solicitacao.setStatus(StatusCesta.SOLICITADA);
        solicitacao.setDataRetirada(null);
        solicitacao.setQrCodeToken(null);
        solicitacao.setEntregueEm(null);

        Cestas salva = repositorio.save(solicitacao);
        return new ResponseEntity<Cestas>(salva, HttpStatus.CREATED);
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
        existente.setQrCodeToken(UUID.randomUUID().toString());

        return new ResponseEntity<Cestas>(repositorio.save(existente), HttpStatus.OK);
    }

    public ResponseEntity<?> checkin(String qrCodeToken) {
        Cestas existente = repositorio.findByQrCodeToken(qrCodeToken);
        if (existente == null) {
            return new ResponseEntity<String>("QR Code inválido.", HttpStatus.NOT_FOUND);
        }

        if (existente.getStatus() == StatusCesta.ENTREGUE) {
            String dataFormatada = existente.getEntregueEm()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            return new ResponseEntity<String>(
                    "Esta cesta já foi retirada em " + dataFormatada + ".", HttpStatus.CONFLICT);
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
}