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
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.web.cors.CorsConfiguration;
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
                    .requestMatchers(HttpMethod.GET, "/voluntario/nomesfuncoes/**", "/frequenciavoluntario/**", "/frequenciadiscente/**", "/imagens/**", "/embaixador/**", "/app/docs/imagens_embaixadores/**", "/app/docs/diarios/**", "/app/docs/imagens_avisos/**", "/aviso").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/login", "/frequenciavoluntario/**", "/embaixador/**", "/amigomelvin").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/frequenciavoluntario/**").permitAll()

                    // --- ROTAS AUTENTICADAS GERAIS ---
                    .requestMatchers(HttpMethod.GET, "/auth/role_{matricula}").authenticated()
                    .requestMatchers(HttpMethod.GET, "/dashboard/**").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/permissoes/minhas").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/discente/{matricula}/avaliacoes").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'EDITAR_RENDIMENTO') or @permissaoService.hasPermission(authentication, 'EDITAR_AVALIACAO_PSICO')"))
                    .requestMatchers("/api/permissoes/**").hasRole("ADM")

                    // --- ROTAS ADMINISTRATIVAS (Registro de usuários, etc) ---
                    .requestMatchers(HttpMethod.POST,  "/auth/register", "/imagens/**", "/aviso/**").hasRole("ADM")
                    .requestMatchers(HttpMethod.PUT, "/auth/alterar_senha").hasRole("ADM")

                    // --- CESTAS E IMAGENS (Adicionado AUX) ---
                    .requestMatchers(HttpMethod.POST, "/cestas").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_CESTAS')"))
                    .requestMatchers(HttpMethod.POST, "/imagens/**").hasAnyRole("ADM", "DIRE") // Imagens mantive restrito, mas pode abrir se precisar
                    
                    // --- VOLUNTÁRIOS (Cadastro restrito a ADM) ---
                    .requestMatchers(HttpMethod.POST, "/voluntario", "/aviso/**").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_VOLUNTARIOS')"))

                    // --- DISCENTES / ALUNOS (ASSIST já incluído) ---
                    .requestMatchers(HttpMethod.POST, "/discente").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'CADASTRAR_ALUNO')"))
                    .requestMatchers(HttpMethod.GET, "/discente").hasAnyRole("PROF", "ADM", "DIRE", "COOR", "ASSIST", "PSICO")
                    .requestMatchers(HttpMethod.GET, "/discente/matricula/{matricula}").hasAnyRole("PROF", "ADM", "DIRE", "COOR", "ASSIST", "PSICO")
                    .requestMatchers(HttpMethod.PUT, "/discente").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'CADASTRAR_ALUNO')"))

                    // --- DIÁRIOS ---
                    .requestMatchers(HttpMethod.POST,"/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.PUT, "/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.DELETE, "/diarios/**").hasAnyRole("ADM", "COOR")

                    // --- LEITURA GERAL (Adicionado AUX em Cestas) ---
                    .requestMatchers(HttpMethod.GET, "/cestas").hasAnyRole("ADM", "DIRE", "AUX")
                    .requestMatchers(HttpMethod.GET, "/amigomelvin").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/voluntario").hasAnyRole("ADM", "DIRE", "COOR")
                    .requestMatchers(HttpMethod.GET, "/voluntario/matricula/{matricula}").permitAll()

                    // --- EDIÇÃO GERAL (Adicionado AUX em Cestas) ---
                    .requestMatchers(HttpMethod.PUT, "/cestas").hasAnyRole("ADM", "DIRE", "AUX")
                    .requestMatchers(HttpMethod.PUT, "/amigomelvin", "/embaixador/**", "/imagens/**").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.PUT, "/voluntario", "/auth/alterar_role/{matricula}/{role}", "/aviso/**").hasRole("ADM")

                    // --- DELEÇÃO (Adicionado AUX em Cestas - Opcional, se quiser que ele delete) ---
                    .requestMatchers(HttpMethod.DELETE, "/cestas").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_CESTAS')"))
                    .requestMatchers(HttpMethod.DELETE, "/voluntario").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_VOLUNTARIOS')"))
                    .requestMatchers(HttpMethod.DELETE, "/frequenciavoluntario", "/discente").hasAnyRole("ADM", "COOR")
                    
                    // --- FREQUÊNCIA DISCENTE ---
                    .requestMatchers(HttpMethod.POST, "/frequenciadiscente").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_FREQUENCIA')"))
                    .requestMatchers(HttpMethod.PUT, "/frequenciadiscente").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_FREQUENCIA')"))
                    .requestMatchers(HttpMethod.DELETE, "/frequenciadiscente").access(new WebExpressionAuthorizationManager("@permissaoService.hasPermission(authentication, 'GERENCIAR_FREQUENCIA')"))

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