package br.com.melvin.sistema.domain.cestas.model;

// US-7.4: qualquer nível da hierarquia da igreja pode solicitar cesta em nome
// de um membro de célula (não só o supervisor de setor).
public enum NivelHierarquico {
    CELULA,
    SETOR,
    AREA,
    DISTRITO,
    REDE
}
