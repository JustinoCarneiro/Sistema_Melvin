package br.com.melvin.sistema.security.config;

import java.util.Arrays;

import br.com.melvin.sistema.config.UrlFrontend;

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
    @Autowired
    SecurityFilter securityFilter;

    @Autowired
    UrlFrontend urlFrontend;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers(HttpMethod.GET, "/voluntario/nomesfuncoes", "/frequenciavoluntario", "/frequenciadiscente", "/imagens/**", "/embaixador/**", "/app/docs/imagens_embaixadores/**", "/app/docs/diarios/**", "/app/docs/imagens_avisos/**", "/aviso").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/login", "/frequenciavoluntario", "/embaixador", "/amigomelvin").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/frequenciavoluntario").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/role_{matricula}").authenticated()
                    .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/alterar_senha/{matricula}/{senha}", "/imagens", "/aviso").hasRole("ADM")

                    .requestMatchers(HttpMethod.POST,"/discente", "/voluntario", "/imagens/**", "/aviso").hasRole("ADM")
                    .requestMatchers(HttpMethod.POST,"/diarios").hasAnyRole("ADM", "COOR")

                    .requestMatchers(HttpMethod.GET, "/amigomelvin").hasRole("ADM")
                    .requestMatchers(HttpMethod.GET, "/diarios", "/frequenciavoluntario").hasAnyRole("ADM", "COOR")
                    .requestMatchers(HttpMethod.GET, "/discente").hasAnyRole("PROF", "ADM", "DIRE")
                    .requestMatchers(HttpMethod.GET, "/voluntario").hasAnyRole("ADM", "DIRE")

                    .requestMatchers(HttpMethod.PUT, "/discente", "/voluntario", "/embaixador", "/amigomelvin", "/auth/alterar_role/{matricula}/{role}", "/imagens/**", "/aviso").hasRole("ADM")
                    .requestMatchers(HttpMethod.PUT, "/diarios", "/frequenciavoluntario").hasAnyRole("ADM", "COOR")

                    .requestMatchers(HttpMethod.DELETE, "/discente", "/voluntario").hasRole("ADM")
                    .requestMatchers(HttpMethod.DELETE, "/diarios", "/frequenciavoluntario").hasAnyRole("ADM", "COOR")
                    
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
        configuration.setAllowedOrigins(Arrays.asList(urlFrontend.getUrl()));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
