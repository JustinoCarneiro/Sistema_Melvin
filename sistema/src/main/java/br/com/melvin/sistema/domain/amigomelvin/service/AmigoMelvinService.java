package br.com.melvin.sistema.domain.amigomelvin.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.amigomelvin.dto.SubscriptionRequestDTO;
import br.com.melvin.sistema.domain.amigomelvin.model.AmigoMelvin;
import br.com.melvin.sistema.domain.amigomelvin.model.DonorStatus;
import br.com.melvin.sistema.domain.amigomelvin.repository.AmigoMelvinRepository;
import br.com.melvin.sistema.domain.amigomelvin.repository.DoacaoItemRepository;
import br.com.melvin.sistema.domain.amigomelvin.dto.OneTimeDonationDTO;
import br.com.melvin.sistema.domain.amigomelvin.dto.DoacaoItemDTO;
import br.com.melvin.sistema.domain.amigomelvin.model.DoacaoItem;
import br.com.melvin.sistema.shared.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AmigoMelvinService {

    private final AmigoMelvinRepository repositorio;
    private final StripeService stripeService;
    private final DoacaoItemRepository doacaoItemRepository;
    private final EmailService emailService;

    public List<AmigoMelvin> listar(){
        return repositorio.findAll();
    }

    public java.util.Map<String, Object> getStats() {
        List<AmigoMelvin> all = repositorio.findAll();
        long totalAtivos = 0;
        java.math.BigDecimal valorTotal = java.math.BigDecimal.ZERO;
        
        for (AmigoMelvin amigo : all) {
            if (DonorStatus.ACTIVE.equals(amigo.getStatus())) {
                totalAtivos++;
                if (amigo.getValorMensal() != null) {
                    valorTotal = valorTotal.add(amigo.getValorMensal());
                }
            }
        }
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalAtivos", totalAtivos);
        stats.put("valorTotal", valorTotal);
        return stats;
    }

    public ResponseEntity<?> adicionar(AmigoMelvin amigomelvin){
        amigomelvin.setStatus(DonorStatus.PENDING);
        AmigoMelvin savedAmigoMelvin = repositorio.save(amigomelvin);
        return new ResponseEntity<AmigoMelvin>(savedAmigoMelvin, HttpStatus.CREATED);
    }

    public ResponseEntity<?> processarAssinatura(SubscriptionRequestDTO dto) {
        try {
            log.info("Processando assinatura para novo doador.");
            
            com.stripe.model.Customer customer = stripeService.createCustomer(dto.nome(), dto.email(), dto.stripeToken());
            log.info("Customer criado no Stripe com sucesso.");
            
            // Usar um priceId dummy ou ler de configuração futuramente. 
            // Para simplificar a integração inicial, usaremos um valor genérico.
            com.stripe.model.Subscription subscription = stripeService.createSubscription(customer.getId(), "price_dummy");
            log.info("Subscription criada no Stripe com sucesso.");
            
            AmigoMelvin amigo = new AmigoMelvin();
            amigo.setNome(dto.nome());
            amigo.setEmail(dto.email());
            amigo.setContato(dto.contato());
            amigo.setValorMensal(dto.valor());
            amigo.setFormaPagamento("CREDIT_CARD"); 
            amigo.setStripeCustomerId(customer.getId());
            amigo.setSubscriptionId(subscription.getId());
            amigo.setStatus(DonorStatus.PENDING);
            amigo.setMesesContribuindo(0);
            amigo.setDataInicio(java.time.LocalDateTime.now());
            
            AmigoMelvin savedAmigoMelvin = repositorio.save(amigo);
            
            // Dispara e-mail de boas-vindas
            emailService.sendEmail(
                amigo.getEmail(),
                "Bem-vindo(a) aos Amigos do Melvin!",
                "Olá " + amigo.getNome() + "!\n\nMuito obrigado por se juntar aos Amigos do Melvin! Sua assinatura foi criada e o primeiro pagamento está em processamento.\nSua doação faz a diferença."
            );
            
            return new ResponseEntity<>(savedAmigoMelvin, HttpStatus.CREATED);
        } catch (com.stripe.exception.StripeException e) {
            log.error("Erro ao processar assinatura no Stripe", e);
            return new ResponseEntity<>("Erro ao processar assinatura no Stripe: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    public void confirmarPagamento(String subscriptionId) {
        log.info("Confirmando pagamento para a subscriptionId: {}", subscriptionId);
        AmigoMelvin doador = repositorio.findBySubscriptionId(subscriptionId);
        if (doador != null) {
            doador.setStatus(DonorStatus.ACTIVE);
            int meses = doador.getMesesContribuindo() == null ? 0 : doador.getMesesContribuindo();
            doador.setMesesContribuindo(meses + 1);
            repositorio.save(doador);
            log.info("Doador {} atualizado para ACTIVE. Meses contribuindo: {}", doador.getNome(), doador.getMesesContribuindo());
            
            // Dispara e-mail de confirmação
            emailService.sendEmail(
                doador.getEmail(),
                "Pagamento Confirmado - Amigos do Melvin",
                "Olá " + doador.getNome() + "!\n\nSeu pagamento referente a este mês foi confirmado com sucesso. Agradecemos pelo apoio contínuo!"
            );
            
            // Verifica recompensas
            int mesesAtual = doador.getMesesContribuindo();
            if (mesesAtual == 3 || mesesAtual == 6 || mesesAtual == 12) {
                emailService.sendEmail(
                    doador.getEmail(),
                    "Parabéns! Você alcançou uma nova meta!",
                    "Olá " + doador.getNome() + "!\n\nVocê completou " + mesesAtual + " meses como um Amigo do Melvin! Acesse nosso portal para ver a sua recompensa especial."
                );
            }
        } else {
            log.warn("Nenhum doador encontrado para a subscriptionId: {}", subscriptionId);
        }
    }

    public ResponseEntity<?> processarDoacaoUnica(OneTimeDonationDTO dto) {
        try {
            log.info("Processando doacao unica.");
            com.stripe.model.PaymentIntent intent = stripeService.createSinglePayment(dto.valor(), "brl");
            // No futuro pode-se persistir a doação financeira avulsa no banco.
            return new ResponseEntity<>(intent.getClientSecret(), HttpStatus.CREATED);
        } catch (com.stripe.exception.StripeException e) {
            log.error("Erro ao gerar PaymentIntent", e);
            return new ResponseEntity<>("Erro ao gerar PaymentIntent: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    public ResponseEntity<?> registrarDoacaoItem(DoacaoItemDTO dto) {
        log.info("Registrando nova doacao de item.");
        DoacaoItem item = new DoacaoItem();
        item.setNome(dto.nome());
        item.setTelefone(dto.telefone());
        item.setTipoItem(dto.tipoItem());
        item.setObservacao(dto.observacao());
        item.setDataCriacao(java.time.LocalDateTime.now());
        
        DoacaoItem saved = doacaoItemRepository.save(item);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    public ResponseEntity<?> alterar(AmigoMelvin amigomelvin){
        String resposta;
        AmigoMelvin existente = repositorio.findByNome(amigomelvin.getNome());
        if (existente == null) {
            resposta = "AmigoMelvin não cadastrado!";
            return new ResponseEntity<String>(resposta, HttpStatus.NOT_FOUND);
        } else {
            UUID id = existente.getId();

            existente.setEmail(amigomelvin.getEmail());
            if (amigomelvin.getStatus() != null) {
                existente.setStatus(amigomelvin.getStatus());
            }
            existente.setContato(amigomelvin.getContato());
            existente.setFormaPagamento(amigomelvin.getFormaPagamento());
            existente.setValorMensal(amigomelvin.getValorMensal());

            existente.setId(id);

            return new ResponseEntity<AmigoMelvin>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}
