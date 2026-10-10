package br.com.melvin.sistema.security.config;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import br.com.melvin.sistema.config.SecurityProperties;
import br.com.melvin.sistema.security.model.User;

@Service
public class TokenService {
    private final SecurityProperties securityProperties;

    // HS256 pede uma chave de pelo menos 256 bits (32 bytes). Um segredo curto deixa o JWT quebrável por força
    // bruta: melhor o sistema não subir do que rodar com um segredo fraco.
    private static final int TAMANHO_MINIMO_DO_SEGREDO = 32;

    public TokenService(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
        String segredo = securityProperties.getSecret();
        if (segredo == null || segredo.length() < TAMANHO_MINIMO_DO_SEGREDO) {
            throw new IllegalStateException("JWT_SECRET precisa ter pelo menos " + TAMANHO_MINIMO_DO_SEGREDO
                    + " caracteres. Gere um com: openssl rand -base64 48");
        }
    }

    public String generateToken(User user){
        try{
            Algorithm algorithm = Algorithm.HMAC256(securityProperties.getSecret());
            String token = JWT.create()
                    .withIssuer("sistemamelvin")
                    .withSubject(user.getLogin())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
            return token;
        } catch (JWTCreationException exception){
            throw new RuntimeException("Erro durante geração do token", exception);
        }
    }

    public String validateToken(String token){
        try{
            Algorithm algorithm = Algorithm.HMAC256(securityProperties.getSecret());
            return JWT.require(algorithm)
                    .withIssuer("sistemamelvin")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch(JWTVerificationException exception){
            return "";
        }
    }

    private Instant genExpirationDate(){
        return Instant.now().plus(2, ChronoUnit.HOURS);
    }
}
