package br.com.melvin.sistema.security.services;

import java.util.Locale;
import java.util.Set;

/**
 * Regra mínima para a senha que a administração cria ou redefine. Segue a linha do NIST 800-63B: o que mais
 * importa é o tamanho e não ser uma senha óbvia; nada de exigir símbolo ou maiúscula, que só empurra para
 * "Senha@123". O limite de tentativas de login (LoginAttemptService) cuida do resto.
 */
public final class PoliticaDeSenha {

    public static final int TAMANHO_MINIMO = 8;
    public static final int TAMANHO_MAXIMO = 128;
    public static final String MENSAGEM = "A senha deve ter de " + TAMANHO_MINIMO + " a " + TAMANHO_MAXIMO
            + " caracteres e não pode ser a matrícula nem uma senha comum (como 12345678).";

    private static final Set<String> COMUNS = Set.of(
            "12345678", "123456789", "1234567890", "87654321", "12341234", "11111111", "00000000",
            "senha123", "senha1234", "mudar123", "abcd1234", "qwertyui", "password",
            "melvin123", "melvin2026", "institutomelvin");

    private PoliticaDeSenha() {
    }

    public static boolean valida(String login, String senha) {
        if (senha == null || senha.isBlank()) {
            return false;
        }
        if (senha.length() < TAMANHO_MINIMO || senha.length() > TAMANHO_MAXIMO) {
            return false;
        }
        String minuscula = senha.toLowerCase(Locale.ROOT);
        if (login != null && minuscula.equals(login.trim().toLowerCase(Locale.ROOT))) {
            return false;
        }
        if (COMUNS.contains(minuscula)) {
            return false;
        }
        // Um caractere só repetido: "aaaaaaaa", "99999999".
        return senha.chars().distinct().count() > 1;
    }
}
