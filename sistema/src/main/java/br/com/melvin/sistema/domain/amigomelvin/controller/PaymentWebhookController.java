package br.com.melvin.sistema.domain.amigomelvin.controller;

import br.com.melvin.sistema.domain.amigomelvin.service.AmigoMelvinService;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final AmigoMelvinService amigoMelvinService;

    @Value("${STRIPE_WEBHOOK_SECRET:}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        
        try {
            log.info("Receiving Stripe webhook payload");
            Event event;

            if (endpointSecret != null && !endpointSecret.isEmpty() && sigHeader != null) {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } else {
                // If the webhook secret is not set, we can parse it locally without verification.
                // However, the criteria specifies 400 Bad Request on invalid signature.
                // We'll throw an exception if secret is set but signature is invalid.
                if (sigHeader == null && endpointSecret != null && !endpointSecret.isEmpty()) {
                    return ResponseEntity.badRequest().body("Missing Stripe signature header");
                }
                event = com.stripe.model.Event.GSON.fromJson(payload, Event.class);
            }

            String eventType = event.getType();

            if ("invoice.paid".equals(eventType)) {
                com.stripe.model.Invoice invoice = (com.stripe.model.Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
                if (invoice != null && invoice.getSubscription() != null) {
                    String subscriptionId = invoice.getSubscription();
                    log.info("Invoice paid for subscription: {}", subscriptionId);
                    amigoMelvinService.confirmarPagamento(subscriptionId);
                } else {
                    log.warn("Webhook received invoice.paid but no subscription ID was found.");
                }
            } else {
                log.info("Unhandled event type: {}", eventType);
            }

            return ResponseEntity.ok("Webhook processed");
        } catch (com.stripe.exception.SignatureVerificationException e) {
            log.error("Invalid Stripe signature", e);
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.badRequest().body("Error processing webhook");
        }
    }
}
