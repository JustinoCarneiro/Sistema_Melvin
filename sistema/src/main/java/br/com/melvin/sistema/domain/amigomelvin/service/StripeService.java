package br.com.melvin.sistema.domain.amigomelvin.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StripeService {

    public Customer createCustomer(String name, String email, String paymentToken) throws StripeException {
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setName(name)
                .setEmail(email)
                .setSource(paymentToken) // Assume stripeToken is passed as source
                .build();

        return Customer.create(params);
    }

    public Subscription createSubscription(String customerId, String priceId) throws StripeException {
        SubscriptionCreateParams params = SubscriptionCreateParams.builder()
                .setCustomer(customerId)
                .addItem(
                    SubscriptionCreateParams.Item.builder()
                        .setPrice(priceId)
                        .build()
                )
                .build();

        return Subscription.create(params);
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
}
