package br.com.melvin.sistema.domain.amigomelvin.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.net.RequestOptions;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StripeService {

    // Cache do Product ID resolvido a partir do Price base, evitando um
    // round-trip ao Stripe (Price.retrieve) a cada nova assinatura.
    private final ConcurrentHashMap<String, String> productIdCache = new ConcurrentHashMap<>();

    public Customer createCustomer(String name, String email, String paymentToken, String idempotencyKey) throws StripeException {
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setName(name)
                .setEmail(email)
                .setSource(paymentToken) // Assume stripeToken is passed as source
                .build();

        // A idempotency key garante que uma reexecução da mesma requisição
        // (retry, duplo-submit, timeout) reaproveite o mesmo Customer no Stripe.
        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(idempotencyKey)
                .build();
        return Customer.create(params, options);
    }

    // Resolve o Product ID a partir do Price base, com cache para evitar um
    // round-trip ao Stripe (Price.retrieve) a cada operação de assinatura.
    private String resolveProductId(String basePriceId) throws StripeException {
        String productId = productIdCache.get(basePriceId);
        if (productId == null) {
            com.stripe.model.Price basePrice = com.stripe.model.Price.retrieve(basePriceId);
            productId = basePrice.getProduct();
            productIdCache.put(basePriceId, productId);
        }
        return productId;
    }

    public Subscription createSubscription(String customerId, String basePriceId, java.math.BigDecimal amount, String idempotencyKey) throws StripeException {
        String productId = resolveProductId(basePriceId);

        SubscriptionCreateParams params = SubscriptionCreateParams.builder()
                .setCustomer(customerId)
                .addItem(
                    SubscriptionCreateParams.Item.builder()
                        .setPriceData(
                            SubscriptionCreateParams.Item.PriceData.builder()
                                .setCurrency("brl")
                                .setProduct(productId)
                                .setUnitAmount(amount.multiply(new java.math.BigDecimal("100")).longValue())
                                .setRecurring(
                                    SubscriptionCreateParams.Item.PriceData.Recurring.builder()
                                        .setInterval(SubscriptionCreateParams.Item.PriceData.Recurring.Interval.MONTH)
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(idempotencyKey)
                .build();
        return Subscription.create(params, options);
    }

    /**
     * Atualiza o valor mensal de uma assinatura existente (sem criar uma nova).
     * Substitui o price_data do item atual pelo novo valor. Usa proração NONE,
     * ou seja, o novo valor passa a valer a partir do próximo ciclo (sem cobrança
     * ou crédito imediato), comportamento adequado para doações.
     */
    public Subscription updateSubscriptionAmount(String subscriptionId, String basePriceId, java.math.BigDecimal amount, String idempotencyKey) throws StripeException {
        Subscription subscription = Subscription.retrieve(subscriptionId);
        String itemId = subscription.getItems().getData().get(0).getId();
        String productId = resolveProductId(basePriceId);

        SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
                .addItem(
                    SubscriptionUpdateParams.Item.builder()
                        .setId(itemId)
                        .setPriceData(
                            SubscriptionUpdateParams.Item.PriceData.builder()
                                .setCurrency("brl")
                                .setProduct(productId)
                                .setUnitAmount(amount.multiply(new java.math.BigDecimal("100")).longValue())
                                .setRecurring(
                                    SubscriptionUpdateParams.Item.PriceData.Recurring.builder()
                                        .setInterval(SubscriptionUpdateParams.Item.PriceData.Recurring.Interval.MONTH)
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.NONE)
                .build();

        RequestOptions options = RequestOptions.builder()
                .setIdempotencyKey(idempotencyKey)
                .build();
        return subscription.update(params, options);
    }

    public PaymentIntent createSinglePayment(BigDecimal amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(new BigDecimal("100")).longValue())
                .setCurrency(currency)
                .addPaymentMethodType("card")
                .addPaymentMethodType("pix")
                .build();
        return PaymentIntent.create(params);
    }

    public Subscription cancelSubscription(String subscriptionId) throws StripeException {
        Subscription subscription = Subscription.retrieve(subscriptionId);
        return subscription.cancel();
    }
}
