package br.com.melvin.sistema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan("br.com.melvin.sistema.config")
@EnableAsync
public class SistemaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaApplication.class, args);
	}
}
