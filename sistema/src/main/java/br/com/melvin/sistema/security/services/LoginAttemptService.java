package br.com.melvin.sistema.security.services;

import java.time.Clock;
import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Protege o login contra tentativa de senha em massa e contra esgotamento de memória.
 *
 * <p><b>Limite de falhas.</b> Conta só as tentativas que falharam, por IP e por matrícula, numa janela fixa de
 * 15 minutos. Passou do limite, o login responde 429 mesmo com a senha certa até a janela acabar. Um login bem
 * sucedido zera a contagem da matrícula (quem errou a senha algumas vezes e acertou não fica travado), mas não a
 * do IP. O estado fica em memória, suficiente para uma instância única do backend (ver docker-compose.yml);
 * se um dia houver réplicas, o limite passa a ser por instância e precisa migrar para um armazenamento comum.
 *
 * <p>Compromisso conhecido: quem sabe a matrícula de alguém (são sequenciais) pode travá-la por 15 minutos com
 * 10 tentativas erradas. É um incômodo curto e visível; o outro lado, deixar tentar senha sem limite, é pior.
 *
 * <p><b>Verificações simultâneas.</b> O Argon2 usa 64 MB de heap por verificação e o heap do backend é de 512 MB
 * (ver memoria-tecnica/bugs/heap-exhaustion-504-cronico.md). Sem teto, algumas dezenas de logins ao mesmo tempo
 * derrubariam o processo. As vagas serializam o excedente; quem espera demais recebe 503 e tenta de novo.
 *
 * <p>Os mapas têm teto de chaves: a matrícula vem do cliente, então cada tentativa pode inventar uma chave nova.
 */
@Component
public class LoginAttemptService {

    public static final int MAX_FALHAS_POR_IP = 20;
    public static final int MAX_FALHAS_POR_LOGIN = 10;
    static final Duration JANELA = Duration.ofMinutes(15);

    private static final int MAX_CHAVES = 10_000;
    private static final int TAMANHO_MAXIMO_DA_CHAVE = 64;
    private static final int VAGAS_PADRAO = 2;
    private static final Duration ESPERA_PADRAO = Duration.ofSeconds(5);

    private record Janela(long inicioMs, int falhas) {
    }

    private final Clock clock;
    private final Semaphore vagas;
    private final Duration esperaPorVaga;
    private final ConcurrentMap<String, Janela> falhasPorIp = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Janela> falhasPorLogin = new ConcurrentHashMap<>();

    @Autowired
    public LoginAttemptService() {
        this(Clock.systemUTC(), VAGAS_PADRAO, ESPERA_PADRAO);
    }

    LoginAttemptService(Clock clock, int vagas, Duration esperaPorVaga) {
        this.clock = clock;
        this.vagas = new Semaphore(vagas, true);
        this.esperaPorVaga = esperaPorVaga;
    }

    public boolean bloqueado(String ip, String login) {
        long agora = clock.millis();
        return excedeu(falhasPorIp.get(ip), MAX_FALHAS_POR_IP, agora)
                || excedeu(falhasPorLogin.get(normalizar(login)), MAX_FALHAS_POR_LOGIN, agora);
    }

    public void registrarFalha(String ip, String login) {
        long agora = clock.millis();
        incrementar(falhasPorIp, ip == null ? "" : ip, agora);
        incrementar(falhasPorLogin, normalizar(login), agora);
    }

    public void registrarSucesso(String login) {
        falhasPorLogin.remove(normalizar(login));
    }

    public boolean adquirirVaga() {
        try {
            return vagas.tryAcquire(esperaPorVaga.toMillis(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    public void liberarVaga() {
        vagas.release();
    }

    int tamanhoMonitorado() {
        return falhasPorIp.size() + falhasPorLogin.size();
    }

    private boolean excedeu(Janela janela, int maximo, long agora) {
        return janela != null && janela.falhas() >= maximo && agora - janela.inicioMs() < JANELA.toMillis();
    }

    private void incrementar(ConcurrentMap<String, Janela> mapa, String chave, long agora) {
        if (mapa.size() >= MAX_CHAVES && !mapa.containsKey(chave)) {
            // Primeiro descarta o que já expirou; se ainda assim estiver cheio, zera. É preferível reabrir
            // a janela de algumas chaves a arriscar a memória do processo.
            mapa.values().removeIf(j -> agora - j.inicioMs() >= JANELA.toMillis());
            if (mapa.size() >= MAX_CHAVES) {
                mapa.clear();
            }
        }
        mapa.compute(chave, (k, atual) -> atual == null || agora - atual.inicioMs() >= JANELA.toMillis()
                ? new Janela(agora, 1)
                : new Janela(atual.inicioMs(), atual.falhas() + 1));
    }

    private String normalizar(String login) {
        String limpo = login == null ? "" : login.trim().toLowerCase(Locale.ROOT);
        return limpo.length() > TAMANHO_MAXIMO_DA_CHAVE ? limpo.substring(0, TAMANHO_MAXIMO_DA_CHAVE) : limpo;
    }
}
