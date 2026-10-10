package br.com.melvin.sistema.shared.util;

/**
 * Valores que vêm do cliente (matrícula digitada no login, nome de um formulário público) entram no log como
 * texto. Quebra de linha ali forjaria uma linha de log inteira ("injeção de log"), por exemplo um falso login
 * bem-sucedido. Troca os caracteres de controle e limita o tamanho.
 */
public final class LogSanitizer {

    private static final int TAMANHO_MAXIMO = 100;

    private LogSanitizer() {
    }

    public static String limpar(String valor) {
        if (valor == null) {
            return "null";
        }
        StringBuilder limpo = new StringBuilder(Math.min(valor.length(), TAMANHO_MAXIMO + 1));
        for (int i = 0; i < valor.length() && i < TAMANHO_MAXIMO; i++) {
            char c = valor.charAt(i);
            limpo.append(Character.isISOControl(c) ? '_' : c);
        }
        if (valor.length() > TAMANHO_MAXIMO) {
            limpo.append('…');
        }
        return limpo.toString();
    }
}
