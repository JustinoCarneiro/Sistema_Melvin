package br.com.melvin.sistema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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

    /**
     * Os arquivos enviados pela administração são servidos pelo mesmo domínio do sistema. Mesmo que um dia entre um
     * arquivo que o navegador queira interpretar (HTML, SVG), esta política o impede de rodar script ou de ler algo do
     * domínio. O nosniff (Spring Security) já impede o navegador de adivinhar outro tipo.
     */
    @Override
    public void addInterceptors(@SuppressWarnings("null") InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(@SuppressWarnings("null") HttpServletRequest request,
                                     @SuppressWarnings("null") HttpServletResponse response,
                                     @SuppressWarnings("null") Object handler) {
                response.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
                return true;
            }
        }).addPathPatterns("/app/docs/**");
    }
}
