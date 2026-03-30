package br.com.melvin.sistema.domain.permissao.dto;

import java.util.List;

public record PermissaoRegraDTO(String nomeRegra, List<String> rolesPermitidas) {}
