package br.com.melvin.sistema.security.config;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

import br.com.melvin.sistema.config.UrlFrontend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.web.cors.CorsConfiguration;
import br.com.melvin.sistema.domain.permissao.service.PermissaoService;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfiguration.class);
    
    @Autowired
    SecurityFilter securityFilter;

    @Autowired
    UrlFrontend urlFrontend;
    
    @Autowired
    PermissaoService permissaoService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        logger.info("Configuring security filter chain");
        return httpSecurity
                .cors(cors -> {
                    logger.info("Configuring CORS");
                    cors.configurationSource(corsConfigurationSource());
                })
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                    // --- ROTAS PÚBLICAS (Login e leituras abertas) ---
                    .requestMatchers(HttpMethod.GET, "/voluntario/nomesfuncoes/**", "/frequenciavoluntario/**", "/frequenciadiscente/**", "/imagens/**", "/embaixador/**", "/app/docs/imagens_embaixadores/**", "/app/docs/diarios/**", "/app/docs/imagens_avisos/**", "/aviso", "/amigomelvin/stats").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/login", "/frequenciavoluntario/**", "/embaixador/**", "/amigomelvin", "/amigomelvin/subscribe", "/amigomelvin/one-time", "/amigomelvin/items", "/api/v1/webhooks/payments").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/frequenciavoluntario/**").permitAll()

                    // --- ROTAS AUTENTICADAS GERAIS ---
                    .requestMatchers(HttpMethod.GET, "/auth/role_{matricula}").authenticated()
                    .requestMatchers(HttpMethod.GET, "/dashboard/**").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/permissoes/minhas").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/discente/{matricula}/avaliacoes").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "EDITAR_RENDIMENTO") || 
                                                 permissaoService.hasPermission(authentication.get(), "EDITAR_AVALIACAO_PSICO")))
                    .requestMatchers("/api/permissoes/**").hasRole("ADM")

                    // --- ROTAS ADMINISTRATIVAS (Registro de usuários, etc) ---
                    .requestMatchers(HttpMethod.POST,  "/auth/register", "/imagens/**", "/aviso/**").hasRole("ADM")
                    .requestMatchers(HttpMethod.PUT, "/auth/alterar_senha").hasRole("ADM")

                    // --- CESTAS E IMAGENS (Adicionado AUX) ---
                    .requestMatchers(HttpMethod.POST, "/cestas").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_CESTAS")))
                    .requestMatchers(HttpMethod.POST, "/imagens/**").hasAnyRole("ADM", "DIRE") // Imagens mantive restrito, mas pode abrir se precisar
                    
                    // --- VOLUNTÁRIOS ---
                    .requestMatchers(HttpMethod.POST, "/voluntario").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_VOLUNTARIOS")))
                    
                    // --- AVISOS ---
                    .requestMatchers(HttpMethod.POST, "/aviso/**").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_AVISOS")))

                    // --- DISCENTES / ALUNOS (ASSIST já incluído) ---
                    .requestMatchers(HttpMethod.POST, "/discente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "CADASTRAR_ALUNO")))
                    .requestMatchers(HttpMethod.GET, "/discente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "VISUALIZAR_ALUNOS")))
                    .requestMatchers(HttpMethod.GET, "/discente/matricula/{matricula}").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "VISUALIZAR_ALUNOS")))
                    .requestMatchers(HttpMethod.PUT, "/discente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "CADASTRAR_ALUNO")))

                    // --- DIÁRIOS ---
                    .requestMatchers(HttpMethod.POST,"/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.PUT, "/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.DELETE, "/diarios/**").hasAnyRole("ADM", "COOR")

                    // --- LEITURA GERAL ---
                    .requestMatchers(HttpMethod.GET, "/cestas").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_CESTAS")))
                    .requestMatchers(HttpMethod.GET, "/amigomelvin").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_AMIGOS")))
                    .requestMatchers(HttpMethod.GET, "/voluntario").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_VOLUNTARIOS")))
                    .requestMatchers(HttpMethod.GET, "/voluntario/matricula/{matricula}").permitAll()

                    // --- EDIÇÃO GERAL ---
                    .requestMatchers(HttpMethod.PUT, "/cestas").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_CESTAS")))
                    .requestMatchers(HttpMethod.PUT, "/amigomelvin").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_AMIGOS")))
                    .requestMatchers(HttpMethod.PUT, "/embaixador/**").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_EMBAIXADORES")))
                    .requestMatchers(HttpMethod.PUT, "/voluntario").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_VOLUNTARIOS")))
                    .requestMatchers(HttpMethod.PUT, "/aviso/**").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_AVISOS")))
                    .requestMatchers(HttpMethod.PUT, "/auth/alterar_role/{matricula}/{role}").hasRole("ADM")
                    .requestMatchers(HttpMethod.PUT, "/imagens/**").hasAnyRole("ADM", "DIRE")

                    // --- DELEÇÃO ---
                    .requestMatchers(HttpMethod.DELETE, "/cestas").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_CESTAS")))
                    .requestMatchers(HttpMethod.DELETE, "/voluntario").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_VOLUNTARIOS")))
                    .requestMatchers(HttpMethod.DELETE, "/frequenciavoluntario").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_VOLUNTARIOS")))
                    .requestMatchers(HttpMethod.DELETE, "/discente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "CADASTRAR_ALUNO")))
                    
                    // --- FREQUÊNCIA DISCENTE ---
                    .requestMatchers(HttpMethod.POST, "/frequenciadiscente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_FREQUENCIA")))
                    .requestMatchers(HttpMethod.PUT, "/frequenciadiscente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_FREQUENCIA")))
                    .requestMatchers(HttpMethod.DELETE, "/frequenciadiscente").access((authentication, context) -> 
                        new AuthorizationDecision(permissaoService.hasPermission(authentication.get(), "GERENCIAR_FREQUENCIA")))

                    .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        int saltLength = 16; 
        int hashLength = 32; 
        int parallelism = 1; 
        int memory = 65536; 
        int iterations = 3; 

        return new Argon2PasswordEncoder(saltLength, hashLength, parallelism, memory, iterations);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        String allowedOrigin = urlFrontend.getUrl();
        
        // Always allow common development origins for convenience in dev mode
        List<String> origins = new ArrayList<>(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://institutomelvin.org:3000",
            "http://institutomelvin.org"
        ));
        
        if (allowedOrigin != null && !allowedOrigin.isEmpty() && !allowedOrigin.equals("*")) {
            origins.add(allowedOrigin);
            // Also allow the non-secure/port variations of the configured origin
            if (allowedOrigin.startsWith("https://")) {
                origins.add(allowedOrigin.replace("https://", "http://"));
            }
        }

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        logger.info("CORS configuration: Allowed origins = {}", configuration.getAllowedOrigins());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}