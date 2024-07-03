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
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/role_{matricula}").authenticated()
                    .requestMatchers(HttpMethod.POST, "/auth/register").hasRole("COOR")

                    .requestMatchers(HttpMethod.POST,"/discente", "/voluntario", "/frequenciavoluntario", "/diarios").hasRole("COOR")
                    .requestMatchers(HttpMethod.POST,"/discente").hasAnyRole("PROF", "COOR")
                    .requestMatchers(HttpMethod.GET, "/voluntario", "/frequenciavoluntario", "/diarios").hasRole("COOR")
                    .requestMatchers(HttpMethod.PUT, "/discente", "/voluntario", "/frequenciavoluntario", "/diarios").hasRole("COOR")
                    .requestMatchers(HttpMethod.DELETE, "/discente", "/voluntario", "/frequenciavoluntario", "/diarios").hasRole("COOR")
                    
                    .requestMatchers(HttpMethod.POST, "/frequenciadiscente").hasAnyRole("PROF", "AUX")
                    .requestMatchers(HttpMethod.GET, "/frequenciadiscente").hasAnyRole("PROF", "AUX")
                    .requestMatchers(HttpMethod.PUT, "/frequenciadiscente").hasAnyRole("PROF", "AUX")
                    .requestMatchers(HttpMethod.DELETE, "/frequenciadiscente").hasAnyRole("PROF", "AUX")
                    
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
