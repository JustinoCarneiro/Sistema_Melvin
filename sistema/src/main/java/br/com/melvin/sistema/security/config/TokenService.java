package br.com.melvin.sistema.security.config;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

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

    public TokenService(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
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
        return LocalDateTime.now().plusHours(5).toInstant(ZoneOffset.of("-03:00"));
    }
}
