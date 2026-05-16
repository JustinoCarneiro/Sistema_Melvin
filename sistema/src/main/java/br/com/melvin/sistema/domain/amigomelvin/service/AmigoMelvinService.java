package br.com.melvin.sistema.domain.amigomelvin.service;

import java.util.List;
import java.util.UUID;

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
@SuppressWarnings("null")
public class AmigoMelvinService {

    private final AmigoMelvinRepository repositorio;
    private final StripeService stripeService;
    private final DoacaoItemRepository doacaoItemRepository;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${stripe.price.id:price_dummy}")
    private String stripePriceId;

    public List<AmigoMelvin> listar() {

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

    public ResponseEntity<?> adicionar(AmigoMelvin amigomelvin) {
        amigomelvin.setStatus(DonorStatus.PENDING);
        AmigoMelvin savedAmigoMelvin = repositorio.save(amigomelvin);
        return new ResponseEntity<AmigoMelvin>(savedAmigoMelvin, HttpStatus.CREATED);
    }

    public ResponseEntity<?> processarAssinatura(SubscriptionRequestDTO dto) {
        try {
            if (dto.valor() == null || dto.valor().compareTo(new java.math.BigDecimal("30")) < 0) {
                return new ResponseEntity<>("O valor mínimo para apoio mensal é de R$ 30,00.", HttpStatus.BAD_REQUEST);
            }
            log.info("Processando assinatura para novo doador.");

            com.stripe.model.Customer customer = stripeService.createCustomer(dto.nome(), dto.email(),
                    dto.stripeToken());
            log.info("Customer criado no Stripe com sucesso.");

            // Utiliza o stripePriceId da .env como base para extrair o Product ID
            // e cria dinamicamente o valor (price_data) com base no input do usuário.
            com.stripe.model.Subscription subscription = stripeService.createSubscription(
                    customer.getId(),
                    stripePriceId,
                    dto.valor());
            log.info("Subscription criada no Stripe com sucesso com valor dinâmico.");

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
            amigo.setDiaPreferido(dto.dia());
            amigo.setMensagem(dto.mensagem());

            AmigoMelvin savedAmigoMelvin = repositorio.save(amigo);

            // Dispara e-mail de boas-vindas
            emailService.sendEmail(
                    amigo.getEmail(),
                    "Bem-vindo(a) aos Amigos do Melvin!",
                    "Olá " + amigo.getNome()
                            + "!\n\nMuito obrigado por se juntar aos Amigos do Melvin! Sua assinatura foi criada e o primeiro pagamento está em processamento.\nSua doação faz a diferença.");

            return new ResponseEntity<>(savedAmigoMelvin, HttpStatus.CREATED);
        } catch (com.stripe.exception.StripeException e) {
            log.error("Erro ao processar assinatura no Stripe", e);
            return new ResponseEntity<>("Erro ao processar assinatura no Stripe: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
        }
    }

    public void confirmarPagamento(String subscriptionId, String invoiceId, String customerId) {
        log.info("Confirmando pagamento para subscriptionId: {}, invoiceId: {}", subscriptionId, invoiceId);
        AmigoMelvin doador = null;
        if (subscriptionId != null) {
            doador = repositorio.findBySubscriptionId(subscriptionId);
        }
        if (doador == null && customerId != null) {
            doador = repositorio.findByStripeCustomerId(customerId);
            log.info("Fallback para customerId: {}. Doador encontrado: {}", customerId, (doador != null));
        }

        if (doador != null) {
            // ── Guarda de Idempotência ──────────────────────────────
            // Se o invoiceId já foi processado, ignora o evento duplicado.
            if (invoiceId != null && invoiceId.equals(doador.getLastProcessedInvoiceId())) {
                log.warn("Evento duplicado detectado. InvoiceId {} já processado para subscriptionId {}. Ignorando.",
                        invoiceId, subscriptionId);
                return;
            }

            doador.setStatus(DonorStatus.ACTIVE);
            int meses = doador.getMesesContribuindo() == null ? 0 : doador.getMesesContribuindo();
            doador.setMesesContribuindo(meses + 1);
            doador.setLastProcessedInvoiceId(invoiceId);
            repositorio.save(doador);
            log.info("Doador atualizado para ACTIVE. subscriptionId: {}. Meses: {}. InvoiceId: {}",
                    subscriptionId, doador.getMesesContribuindo(), invoiceId);

            // Dispara e-mail de confirmação
            emailService.sendEmail(
                    doador.getEmail(),
                    "Pagamento Confirmado - Amigos do Melvin",
                    "Olá " + doador.getNome()
                            + "!\n\nSeu pagamento referente a este mês foi confirmado com sucesso. Agradecemos pelo apoio contínuo!");

            // Verifica recompensas
            int mesesAtual = doador.getMesesContribuindo();
            if (mesesAtual == 3 || mesesAtual == 6 || mesesAtual == 12) {
                emailService.sendEmail(
                        doador.getEmail(),
                        "Parabéns! Você alcançou uma nova meta!",
                        "Olá " + doador.getNome() + "!\n\nVocê completou " + mesesAtual
                                + " meses como um Amigo do Melvin! Acesse nosso portal para ver a sua recompensa especial.");
            }
        } else {
            log.warn("Nenhum doador encontrado para a subscriptionId: {}", subscriptionId);
        }
    }

    public void registrarFalhaPagamento(String subscriptionId, String customerId) {
        log.warn("Registrando falha de pagamento para subscriptionId: {}", subscriptionId);
        AmigoMelvin doador = null;
        if (subscriptionId != null) {
            doador = repositorio.findBySubscriptionId(subscriptionId);
        }
        if (doador == null && customerId != null) {
            doador = repositorio.findByStripeCustomerId(customerId);
        }

        if (doador != null) {
            doador.setStatus(DonorStatus.INACTIVE);
            repositorio.save(doador);
            log.warn("Doador marcado como INACTIVE por falha de pagamento. subscriptionId: {}", subscriptionId);

            emailService.sendEmail(
                    doador.getEmail(),
                    "Atenção: Problema com seu pagamento - Amigos do Melvin",
                    "Olá " + doador.getNome()
                            + "!\n\nIdentificamos que houve um problema com o pagamento da sua assinatura mensal. Por favor, verifique os dados do seu cartão de crédito.\n\nCaso precise de ajuda, entre em contato conosco.");
        } else {
            log.warn("Nenhum doador encontrado para registrar falha. subscriptionId: {}", subscriptionId);
        }
    }

    public void cancelarAssinatura(String subscriptionId) {
        log.info("Cancelando assinatura para subscriptionId: {}", subscriptionId);
        AmigoMelvin doador = repositorio.findBySubscriptionId(subscriptionId);
        if (doador != null) {
            doador.setStatus(DonorStatus.CANCELLED);
            repositorio.save(doador);
            log.info("Doador marcado como CANCELLED. subscriptionId: {}", subscriptionId);

            emailService.sendEmail(
                    doador.getEmail(),
                    "Assinatura Cancelada - Amigos do Melvin",
                    "Olá " + doador.getNome()
                            + "!\n\nSua assinatura como Amigo do Melvin foi cancelada. Sentiremos sua falta! Caso queira retornar, estamos de portas abertas.");
        } else {
            log.warn("Nenhum doador encontrado para cancelar. subscriptionId: {}", subscriptionId);
        }
    }

    public ResponseEntity<?> cancelarAssinaturaManual(UUID id) {
        try {
            AmigoMelvin doador = repositorio.findById(id).orElse(null);
            if (doador == null) {
                return new ResponseEntity<>("Doador não encontrado", HttpStatus.NOT_FOUND);
            }
            if (doador.getSubscriptionId() != null) {
                stripeService.cancelSubscription(doador.getSubscriptionId());
            }
            doador.setStatus(DonorStatus.CANCELLED);
            repositorio.save(doador);
            log.info("Doador marcado como CANCELLED via painel admin. Id: {}", id);

            emailService.sendEmail(
                    doador.getEmail(),
                    "Assinatura Cancelada - Amigos do Melvin",
                    "Olá " + doador.getNome()
                            + "!\n\nSua assinatura como Amigo do Melvin foi cancelada pelo nosso sistema. Caso tenha dúvidas, entre em contato conosco.");

            return new ResponseEntity<>("Assinatura cancelada com sucesso", HttpStatus.OK);
        } catch (Exception e) {
            log.error("Erro ao cancelar assinatura manual", e);
            return new ResponseEntity<>("Erro ao cancelar assinatura: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
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

    public ResponseEntity<?> alterar(AmigoMelvin amigomelvin) {
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
