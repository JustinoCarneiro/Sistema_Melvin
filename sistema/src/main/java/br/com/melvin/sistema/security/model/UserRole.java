package br.com.melvin.sistema.security.model;

public enum UserRole {
    COOR("coor"),
    PROF("prof"),
    AUX("aux"),
    COZI("cozi"),
    DIRE("dire"),
    ADM("adm"),
    MARK("mark"),
    ZELA("zela"),
    PSICO("psico"),
    ASSIST("assistente");

    private String role;

    UserRole(String role){
        this.role = role;
    }

    public String getRole(){
        return role;
    }
}
