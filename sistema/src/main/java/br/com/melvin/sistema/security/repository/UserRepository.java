package br.com.melvin.sistema.security.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.security.model.User;


public interface UserRepository extends JpaRepository<User, UUID>{
    User findByLogin(String login);
}
