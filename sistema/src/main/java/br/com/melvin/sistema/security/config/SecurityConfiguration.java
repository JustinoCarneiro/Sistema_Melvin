package br.com.melvin.sistema.security.config;

import java.util.Arrays;

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
                    .requestMatchers(HttpMethod.GET, "/voluntario/nomesfuncoes/**", "/frequenciavoluntario/**", "/frequenciadiscente/**", "/imagens/**", "/embaixador/**", "/app/docs/imagens_embaixadores/**", "/app/docs/diarios/**", "/app/docs/imagens_avisos/**", "/aviso").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/login", "/frequenciavoluntario/**", "/embaixador/**", "/amigomelvin").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/frequenciavoluntario/**").permitAll()

                    .requestMatchers(HttpMethod.GET, "/auth/role_{matricula}").authenticated()

                    .requestMatchers(HttpMethod.POST,  "/auth/register", "/auth/alterar_senha/{matricula}/{senha}", "/imagens/**", "/aviso/**").hasRole("ADM")

                    .requestMatchers(HttpMethod.POST, "/imagens/**", "/cestas").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.POST, "/voluntario", "/aviso/**").hasRole("ADM")
                    .requestMatchers(HttpMethod.POST,"/diarios/**", "/discente").hasAnyRole("ADM", "COOR", "DIRE")

                    .requestMatchers(HttpMethod.GET, "/amigomelvin", "/cestas").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/diarios/**").hasAnyRole("ADM", "COOR", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/discente").hasAnyRole("PROF", "ADM", "DIRE", "COOR")
                    .requestMatchers(HttpMethod.GET, "/voluntario").hasAnyRole("ADM", "DIRE", "COOR")
                    .requestMatchers(HttpMethod.GET, "/voluntario/matricula/{matricula}").permitAll()

                    .requestMatchers(HttpMethod.PUT, "/amigomelvin", "/embaixador/**", "/imagens/**", "/cestas").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.PUT, "/voluntario", "/auth/alterar_role/{matricula}/{role}", "/aviso/**").hasRole("ADM")
                    .requestMatchers(HttpMethod.PUT, "/diarios/**", "/discente").hasAnyRole("ADM", "COOR", "DIRE")

                    .requestMatchers(HttpMethod.DELETE, "/voluntario").hasRole("ADM")
                    .requestMatchers(HttpMethod.DELETE, "/cestas").hasAnyRole("ADM", "DIRE")
                    .requestMatchers(HttpMethod.DELETE, "/diarios/**", "/frequenciavoluntario", "/discente").hasAnyRole("ADM", "COOR")
                    
                    .requestMatchers(HttpMethod.POST, "/frequenciadiscente").hasAnyRole("PROF", "COOR", "ADM")
                    .requestMatchers(HttpMethod.PUT, "/frequenciadiscente").hasAnyRole("PROF", "COOR", "ADM")
                    .requestMatchers(HttpMethod.DELETE, "/frequenciadiscente").hasAnyRole("PROF", "COOR", "ADM")

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
        int saltLength = 16; // comprimento do sal em bytes
        int hashLength = 32; // comprimento do hash em bytes
        int parallelism = 1; // grau de paralelismo
        int memory = 65536; // memória utilizada em KiB
        int iterations = 3; // número de iterações

        return new Argon2PasswordEncoder(saltLength, hashLength, parallelism, memory, iterations);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("https://institutomelvin.org");
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE, "Access-Control-Allow-Origin"));
        configuration.setAllowCredentials(true);

        logger.info("CORS configuration: Allowed origins = {}", configuration.getAllowedOriginPatterns());
        logger.info("CORS configuration: Allowed methods = {}", configuration.getAllowedMethods());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
