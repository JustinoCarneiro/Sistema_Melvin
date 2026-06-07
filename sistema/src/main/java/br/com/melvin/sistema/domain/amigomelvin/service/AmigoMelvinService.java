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
import br.com.melvin.sistema.shared.security.BlindIndex;
import br.com.melvin.sistema.shared.service.EmailService;
import br.com.melvin.sistema.shared.util.CpfUtils;
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
    private final BlindIndex blindIndex;

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

            // Idempotency key: usa a chave enviada pelo frontend (estável por
            // tentativa) ou gera uma; retries com a mesma chave não duplicam.
            String idempotencyKey = (dto.idempotencyKey() != null && !dto.idempotencyKey().isBlank())
                    ? dto.idempotencyKey()
                    : UUID.randomUUID().toString();

            // Identidade do doador via CPF (blind index sobre os dígitos), pois o
            // CPF é cifrado e não-pesquisável. E-mail também é indexado.
            String cpfDigits = CpfUtils.onlyDigits(dto.cpf());
            String cpfHash = blindIndex.hash(cpfDigits);
            String emailHash = blindIndex.hash(dto.email());

            // Deduplicação por CPF:
            //  - ATIVA com mesmo valor -> bloqueia (409)
            //  - ATIVA com valor diferente -> ATUALIZA a assinatura existente
            //  - PENDING -> Cancela a antiga e permite criar uma nova (para o caso de falha no 3D Secure ou troca de cartão)
            if (cpfHash != null) {
                AmigoMelvin existente = repositorio.findFirstByCpfHashAndStatusIn(cpfHash,
                        java.util.List.of(DonorStatus.PENDING, DonorStatus.ACTIVE));
                if (existente != null) {
                    if (DonorStatus.ACTIVE.equals(existente.getStatus())) {
                        if (existente.getValorMensal() != null
                                && existente.getValorMensal().compareTo(dto.valor()) == 0) {
                            log.warn("Cadastro duplicado bloqueado: CPF já possui assinatura ATIVA nesse valor.");
                            return new ResponseEntity<>("Você já possui uma assinatura ativa nesse valor.",
                                    HttpStatus.CONFLICT);
                        }

                        log.info("CPF já possui assinatura ATIVA em outro valor. Atualizando a assinatura existente.");
                        if (existente.getSubscriptionId() != null) {
                            stripeService.updateSubscriptionAmount(
                                    existente.getSubscriptionId(),
                                    stripePriceId,
                                    dto.valor(),
                                    idempotencyKey + "-update-" + dto.valor().stripTrailingZeros().toPlainString());
                        }
                        existente.setValorMensal(dto.valor());
                        existente.setDiaPreferido(dto.dia());
                        if (dto.mensagem() != null && !dto.mensagem().isBlank()) {
                            existente.setMensagem(dto.mensagem());
                        }
                        AmigoMelvin atualizado = repositorio.save(existente);
                        return new ResponseEntity<>(atualizado, HttpStatus.OK);
                    } else if (DonorStatus.PENDING.equals(existente.getStatus())) {
                        log.info("Assinatura PENDING encontrada. Cancelando a antiga para permitir nova tentativa com novo cartão.");
                        existente.setStatus(DonorStatus.CANCELLED);
                        repositorio.save(existente);
                        if (existente.getSubscriptionId() != null) {
                            try { stripeService.cancelSubscription(existente.getSubscriptionId()); } catch (Exception e) { log.warn("Erro ao cancelar subscription antiga", e); }
                        }
                        // Deixa prosseguir para criar novo Customer e Subscription limpos
                    }
                }
            }

            log.info("Processando assinatura para novo doador.");

            com.stripe.model.Customer customer = stripeService.createCustomer(dto.nome(), dto.email(),
                    dto.stripeToken(), idempotencyKey + "-customer");
            log.info("Customer criado no Stripe com sucesso.");

            // Utiliza o stripePriceId da .env como base para extrair o Product ID
            // e cria dinamicamente o valor (price_data) com base no input do usuário.
            com.stripe.model.Subscription subscription = stripeService.createSubscription(
                    customer.getId(),
                    stripePriceId,
                    dto.valor(),
                    idempotencyKey + "-subscription");
            log.info("Subscription criada no Stripe com sucesso com valor dinâmico.");

            // Extrai o client_secret para autenticação 3D Secure (SCA) no frontend
            String clientSecret = null;
            if (subscription.getLatestInvoiceObject() != null && subscription.getLatestInvoiceObject().getPaymentIntentObject() != null) {
                clientSecret = subscription.getLatestInvoiceObject().getPaymentIntentObject().getClientSecret();
            }

            AmigoMelvin amigo = new AmigoMelvin();
            amigo.setNome(dto.nome());
            amigo.setEmail(dto.email());
            amigo.setEmailHash(emailHash);
            amigo.setCpf(CpfUtils.format(dto.cpf()));
            amigo.setCpfHash(cpfHash);
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
            amigo.setClientSecret(clientSecret);

            AmigoMelvin savedAmigoMelvin = repositorio.save(amigo);

            // Dispara e-mail de boas-vindas
            emailService.sendEmail(
                    amigo.getEmail(),
                    "Bem-vindo(a) aos Amigos do Melvin!",
                    "Olá " + amigo.getNome()
                            + "!\n\nMuito obrigado por se juntar aos Amigos do Melvin! Sua assinatura foi criada e o primeiro pagamento está em processamento.\nSua doação faz a diferença.");

            // Notifica o Instituto sobre novo CADASTRO (pagamento ainda em
            // processamento). A confirmação efetiva (status ACTIVE) é notificada
            // depois em confirmarPagamento(), via webhook invoice.paid — assim o
            // Instituto não conta como doador quem ainda não teve o pagamento aprovado.
            emailService.notifyInstituto(
                    "Novo cadastro de Amigo do Melvin (pagamento em processamento): " + amigo.getNome(),
                    "Um novo cadastro de Amigo do Melvin foi iniciado. O primeiro pagamento ainda está em processamento — você receberá uma confirmação separada assim que ele for aprovado.\n\n" +
                    "Nome: " + amigo.getNome() + "\n" +
                    "E-mail: " + amigo.getEmail() + "\n" +
                    "Valor mensal: R$ " + amigo.getValorMensal() + "\n" +
                    "Contato: " + amigo.getContato() + "\n\n" +
                    "Acesse o painel administrativo para mais detalhes.");

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

            // Notifica o Instituto sobre pagamento confirmado
            emailService.notifyInstituto(
                    "Pagamento Confirmado: " + doador.getNome(),
                    "O pagamento mensal de um Amigo do Melvin foi confirmado.\n\n" +
                    "Nome: " + doador.getNome() + "\n" +
                    "Valor: R$ " + doador.getValorMensal() + "\n" +
                    "Meses contribuindo: " + doador.getMesesContribuindo() + "\n" +
                    "Subscription ID: " + subscriptionId);

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

            // Notifica o Instituto sobre falha de pagamento
            emailService.notifyInstituto(
                    "⚠️ Falha de Pagamento: " + doador.getNome(),
                    "Houve uma falha no pagamento de um Amigo do Melvin.\n\n" +
                    "Nome: " + doador.getNome() + "\n" +
                    "E-mail: " + doador.getEmail() + "\n" +
                    "Valor: R$ " + doador.getValorMensal() + "\n" +
                    "Subscription ID: " + subscriptionId + "\n\n" +
                    "O doador foi notificado e marcado como INACTIVE.");
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

            // Notifica o Instituto sobre cancelamento
            emailService.notifyInstituto(
                    "Assinatura Cancelada: " + doador.getNome(),
                    "Um Amigo do Melvin cancelou sua assinatura.\n\n" +
                    "Nome: " + doador.getNome() + "\n" +
                    "E-mail: " + doador.getEmail() + "\n" +
                    "Valor que era: R$ " + doador.getValorMensal() + "\n" +
                    "Subscription ID: " + subscriptionId);
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

            // Notifica o Instituto sobre cancelamento manual
            emailService.notifyInstituto(
                    "Cancelamento Manual: " + doador.getNome(),
                    "Uma assinatura foi cancelada manualmente pelo painel admin.\n\n" +
                    "Nome: " + doador.getNome() + "\n" +
                    "E-mail: " + doador.getEmail() + "\n" +
                    "Valor que era: R$ " + doador.getValorMensal() + "\n" +
                    "ID do doador: " + id);

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

            // Permite preencher/corrigir o CPF pelo painel (cifrado + blind index),
            // útil para doadores cadastrados antes do CPF ser obrigatório.
            if (amigomelvin.getCpf() != null && !amigomelvin.getCpf().isBlank()) {
                existente.setCpf(CpfUtils.format(amigomelvin.getCpf()));
                existente.setCpfHash(blindIndex.hash(CpfUtils.onlyDigits(amigomelvin.getCpf())));
            }

            existente.setId(id);

            return new ResponseEntity<AmigoMelvin>(repositorio.save(existente), HttpStatus.OK);
        }
    }
}
