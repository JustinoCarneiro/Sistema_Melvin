package br.com.melvin.sistema.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.model.Aviso;


public interface AvisoRepository extends JpaRepository<Aviso, UUID>{
    Aviso findByTitulo(String titulo);
} 
