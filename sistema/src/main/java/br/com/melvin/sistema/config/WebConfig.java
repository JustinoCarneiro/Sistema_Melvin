package br.com.melvin.sistema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@SuppressWarnings("null") ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/app/docs/diarios/**")
                .addResourceLocations("file:/app/docs/diarios/");
        registry.addResourceHandler("/app/docs/imagens_embaixadores/**")
                .addResourceLocations("file:/app/docs/imagens_embaixadores/");
        registry.addResourceHandler("/app/docs/imagens_avisos/**")
                .addResourceLocations("file:/app/docs/imagens_avisos/");
    }
}