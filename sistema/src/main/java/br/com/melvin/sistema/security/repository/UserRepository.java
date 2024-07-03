package br.com.melvin.sistema.security.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.melvin.sistema.security.model.User;


public interface UserRepository extends JpaRepository<User, Integer>{
    User findByLogin(String login);
}
