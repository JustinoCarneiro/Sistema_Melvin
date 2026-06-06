package br.com.melvin.sistema.domain.amigomelvin.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

    @Value("${stripe.api.key:dummy_stripe_key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        // Timeouts explícitos para que uma chamada lenta ao Stripe falhe rápido
        // em vez de prender a requisição por ~60-80s (default do SDK) e estourar
        // o gateway timeout do nginx (60s), o que gerava erro para o doador.
        Stripe.setConnectTimeout(10_000); // 10s
        Stripe.setReadTimeout(20_000);    // 20s
    }
}
