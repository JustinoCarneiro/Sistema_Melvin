package br.com.melvin.sistema.security.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import br.com.melvin.sistema.security.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter{
    private static final Logger logger = LoggerFactory.getLogger(SecurityFilter.class);

    @Autowired
    TokenService tokenService;

    @Autowired
    UserRepository userRepository;

    // Map to store public endpoints by HTTP method
    private static final Map<String, List<String>> PUBLIC_ENDPOINTS_BY_METHOD = new HashMap<>();

    static {
        PUBLIC_ENDPOINTS_BY_METHOD.put("GET", Arrays.asList(
            "/voluntario/nomesfuncoes",
            "/frequenciavoluntario",
            "/frequenciadiscente",
            "/imagens",
            "/embaixador",
            "/app/docs/imagens_embaixadores",
            "/app/docs/diarios",
            "/app/docs/imagens_avisos",
            "/aviso"
        ));
        PUBLIC_ENDPOINTS_BY_METHOD.put("POST", Arrays.asList(
            "/auth/login"
        ));
        // Add more methods and endpoints as needed
    }

    @SuppressWarnings("null")
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        // Check if the request URI and method match any public endpoints
        if (isPublicEndpoint(method, requestURI)) {
            logger.info("Public endpoint accessed: {} {}", method, requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = this.recoverToken(request);
        if(token != null){
            logger.info("Token found: {}", token);
            var login = tokenService.validateToken(token);
            logger.info("Login extracted from token: {}", login);
            UserDetails user = userRepository.findByLogin(login);

            if (user != null) {
                logger.info("User found: {}", user.getUsername());
                var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                logger.warn("User not found for login: {}", login);
            }
        } else {
            logger.info("No token found in request");
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request){
        var authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if(authHeader == null) {
            logger.info("No Authorization header found");
            return null;
        }
        logger.info("Authorization header found: {}", authHeader);
        return authHeader.replace("Bearer ", "");
    }

    private boolean isPublicEndpoint(String method, String requestURI) {
        List<String> publicEndpoints = PUBLIC_ENDPOINTS_BY_METHOD.get(method);
        if (publicEndpoints != null) {
            return publicEndpoints.stream().anyMatch(requestURI::startsWith);
        }
        return false;
    }
}
