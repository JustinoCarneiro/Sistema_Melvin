package br.com.melvin.sistema.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.melvin.sistema.domain.voluntario.model.Voluntario;
import br.com.melvin.sistema.domain.voluntario.repository.VoluntarioRepository;

/**
 * O usuário da equipe (login = matrícula) não guarda se a pessoa ainda atua; quem diz isso é o
 * voluntário de mesma matrícula. Desligar o voluntário (status diferente de "true") encerra o
 * acesso, e reativá-lo o reabre, sem mexer no usuário. Conta sem voluntário (administrativa ou
 * técnica) segue ativa.
 */
@Service
public class ContaDeEquipeAtiva {

    @Autowired
    VoluntarioRepository voluntarioRepository;

    public boolean ativa(String login) {
        Voluntario voluntario = voluntarioRepository.findByMatricula(login);
        return voluntario == null || "true".equals(voluntario.getStatus());
    }
}
