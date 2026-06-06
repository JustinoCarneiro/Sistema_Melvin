package br.com.melvin.sistema.shared.util;

/**
 * Utilitários de normalização de CPF.
 * - {@link #onlyDigits(String)}: usado para o blind index (dedup) e validação.
 * - {@link #format(String)}: formato de armazenamento/exibição "xxx.xxx.xxx-xx".
 */
public final class CpfUtils {

    private CpfUtils() {
    }

    public static String onlyDigits(String cpf) {
        return cpf == null ? null : cpf.replaceAll("\\D", "");
    }

    public static String format(String cpf) {
        String digits = onlyDigits(cpf);
        if (digits == null || digits.length() != 11) {
            // Mantém o valor original se não tiver 11 dígitos (validação @CPF cuida do resto).
            return cpf;
        }
        return digits.substring(0, 3) + "." + digits.substring(3, 6) + "."
                + digits.substring(6, 9) + "-" + digits.substring(9, 11);
    }
}
