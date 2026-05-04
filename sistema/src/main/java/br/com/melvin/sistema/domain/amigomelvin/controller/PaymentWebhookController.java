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
import org.slf4j.MDC;

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
                if (sigHeader == null && endpointSecret != null && !endpointSecret.isEmpty()) {
                    return ResponseEntity.badRequest().body("Missing Stripe signature header");
                }
                event = com.stripe.model.Event.GSON.fromJson(payload, Event.class);
            }

            String eventType = event.getType();

            if ("invoice.paid".equals(eventType) || "invoice.payment_failed".equals(eventType)) {
                com.google.gson.JsonObject rootObject = com.stripe.model.Event.GSON.fromJson(payload, com.google.gson.JsonObject.class);
                com.google.gson.JsonObject dataObject = rootObject.has("data") && !rootObject.get("data").isJsonNull() ? rootObject.getAsJsonObject("data") : null;
                com.google.gson.JsonObject jsonObject = dataObject != null && dataObject.has("object") && !dataObject.get("object").isJsonNull() ? dataObject.getAsJsonObject("object") : null;
                
                String subscriptionId = jsonObject != null && jsonObject.has("subscription") && !jsonObject.get("subscription").isJsonNull() 
                        ? jsonObject.get("subscription").getAsString() : null;
                String invoiceId = jsonObject != null && jsonObject.has("id") && !jsonObject.get("id").isJsonNull() 
                        ? jsonObject.get("id").getAsString() : null;
                String customerId = jsonObject != null && jsonObject.has("customer") && !jsonObject.get("customer").isJsonNull() 
                        ? jsonObject.get("customer").getAsString() : null;
                
                if (subscriptionId != null || customerId != null) {
                    MDC.put("invoiceId", invoiceId);
                    MDC.put("subscriptionId", subscriptionId != null ? subscriptionId : customerId);
                    if ("invoice.paid".equals(eventType)) {
                        log.info("Invoice paid for subscription: {}, invoiceId: {}, customerId: {}", subscriptionId, invoiceId, customerId);
                        amigoMelvinService.confirmarPagamento(subscriptionId, invoiceId, customerId);
                    } else {
                        log.warn("Invoice payment FAILED for subscription: {}, customerId: {}", subscriptionId, customerId);
                        amigoMelvinService.registrarFalhaPagamento(subscriptionId, customerId);
                    }
                } else {
                    log.warn("Webhook received {} but no subscription ID or customer ID was found in JSON payload.", eventType);
                }
            } else if ("customer.subscription.deleted".equals(eventType)) {
                com.google.gson.JsonObject rootObject = com.stripe.model.Event.GSON.fromJson(payload, com.google.gson.JsonObject.class);
                com.google.gson.JsonObject dataObject = rootObject.has("data") && !rootObject.get("data").isJsonNull() ? rootObject.getAsJsonObject("data") : null;
                com.google.gson.JsonObject jsonObject = dataObject != null && dataObject.has("object") && !dataObject.get("object").isJsonNull() ? dataObject.getAsJsonObject("object") : null;
                
                String subscriptionId = jsonObject != null && jsonObject.has("id") && !jsonObject.get("id").isJsonNull() 
                        ? jsonObject.get("id").getAsString() : null;
                
                if (subscriptionId != null) {
                    MDC.put("subscriptionId", subscriptionId);
                    log.info("Subscription cancelled: {}", subscriptionId);
                    amigoMelvinService.cancelarAssinatura(subscriptionId);
                } else {
                    log.warn("Webhook received customer.subscription.deleted but no subscription ID was found in JSON payload.");
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
        } finally {
            MDC.clear();
        }
    }
}
