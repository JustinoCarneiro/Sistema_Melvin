package br.com.melvin.sistema.security.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import br.com.melvin.sistema.domain.amigomelvin.service.StripeService;
import br.com.melvin.sistema.security.model.User;
import br.com.melvin.sistema.security.model.UserRole;
import br.com.melvin.sistema.security.repository.UserRepository;
import br.com.melvin.sistema.shared.service.EmailService;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Inventário de acesso de TODAS as rotas do backend. Cada rota mapeada precisa estar classificada aqui:
 *
 *   PUBLICA   responde a qualquer visitante, sem login (só o que o site público de fato usa);
 *   LOGADO    responde a qualquer cargo logado, até o mais baixo (COZI) — o painel e as telas comuns carregam isso;
 *   RESTRITA  exige cargo ou permissão específica (sem as regras semeadas, o COZI é barrado).
 *
 * O teste chama cada rota sem login e com um COZI real (token JWT passando pelo SecurityFilter) e compara com
 * a tabela. Uma rota nova sem classificação, ou uma rota que passou a ser mais aberta do que a tabela diz,
 * falha o build. É a rede de segurança contra o erro que já aconteceu: regra escrita para "/voluntario" que
 * não cobre "/voluntario/{matricula}", deixando a rota cair em "qualquer logado".
 *
 * O bloqueio do Spring Security aqui é sempre 403 (sem entry point próprio); 401 vem do controller de login.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MatrizDeAcessoTest {

    private static final String TABELA = """
            PUBLICA   POST    /amigomelvin/items
            PUBLICA   POST    /amigomelvin/one-time
            PUBLICA   GET     /amigomelvin/stats
            PUBLICA   POST    /amigomelvin/subscribe
            PUBLICA   POST    /auth/login
            PUBLICA   GET     /aviso
            PUBLICA   POST    /cestas/solicitacao
            PUBLICA   POST    /embaixador
            PUBLICA   GET     /embaixador/publicos
            PUBLICA   GET     /imagens/captura/{id}/{tipo}
            PUBLICA   POST    /v1/webhooks/payments
            PUBLICA   GET     /voluntario/nomesfuncoes

            LOGADO    GET     /auth/role_{matricula}
            LOGADO    GET     /dashboard/avisos
            LOGADO    GET     /dashboard/presentes
            LOGADO    GET     /dias-nao-letivos
            LOGADO    GET     /discente/sala/{sala}
            LOGADO    GET     /frequenciadiscente
            LOGADO    GET     /frequenciadiscente/alertas-faltas
            LOGADO    GET     /frequenciadiscente/{data}
            LOGADO    GET     /frequenciadiscente/{data}/{matricula}
            LOGADO    GET     /frequenciavoluntario
            LOGADO    GET     /frequenciavoluntario/{data}
            LOGADO    GET     /frequenciavoluntario/{data}/{matricula}
            LOGADO    GET     /imagens/lista
            LOGADO    POST    /frequenciavoluntario
            LOGADO    PUT     /frequenciavoluntario
            LOGADO    GET     /permissoes/minhas
            LOGADO    GET     /voluntario/matricula/{matricula}

            RESTRITA  GET     /amigomelvin
            RESTRITA  POST    /amigomelvin
            RESTRITA  PUT     /amigomelvin
            RESTRITA  POST    /amigomelvin/{id}/cancelar
            RESTRITA  PUT     /auth/alterar_role/{matricula}/{role}
            RESTRITA  PUT     /auth/alterar_senha
            RESTRITA  POST    /auth/register
            RESTRITA  POST    /aviso
            RESTRITA  PUT     /aviso/{id}
            RESTRITA  GET     /cestas
            RESTRITA  POST    /cestas
            RESTRITA  PUT     /cestas
            RESTRITA  POST    /cestas/solicitacao/checkin/{token}
            RESTRITA  PUT     /cestas/solicitacao/{id}/cancelar
            RESTRITA  POST    /cestas/solicitacao/{id}/confirmar-entrega
            RESTRITA  PUT     /cestas/solicitacao/{id}/validar
            RESTRITA  GET     /cestas/solicitacoes
            RESTRITA  GET     /cestas/solicitacoes/agendadas
            RESTRITA  GET     /cestas/solicitacoes/{id}/qrcode
            RESTRITA  DELETE  /cestas/{id}
            RESTRITA  GET     /dashboard/ranking
            RESTRITA  PUT     /diarios/atualizar/{matriculaAtrelada}
            RESTRITA  GET     /diarios/captura/{matricula}
            RESTRITA  DELETE  /diarios/delete/{matriculaAtrelada}
            RESTRITA  GET     /diarios/download/{matricula}
            RESTRITA  POST    /diarios/upload
            RESTRITA  POST    /dias-nao-letivos
            RESTRITA  DELETE  /dias-nao-letivos/{id}
            RESTRITA  GET     /discente
            RESTRITA  POST    /discente
            RESTRITA  PUT     /discente
            RESTRITA  GET     /discente/export
            RESTRITA  GET     /discente/matricula/{matricula}
            RESTRITA  DELETE  /discente/{matricula}
            RESTRITA  PUT     /discente/{matricula}/avaliacoes
            RESTRITA  GET     /embaixador
            RESTRITA  PUT     /embaixador
            RESTRITA  POST    /frequenciadiscente
            RESTRITA  PUT     /frequenciadiscente
            RESTRITA  GET     /frequenciadiscente/export
            RESTRITA  DELETE  /frequenciadiscente/{matricula}/{data}
            RESTRITA  DELETE  /frequenciavoluntario/{matricula}/{data}
            RESTRITA  PUT     /imagens/atualizar/{id}/{tipo}
            RESTRITA  POST    /imagens/upload/{id}/{tipo}
            RESTRITA  POST    /ocorrencias
            RESTRITA  GET     /ocorrencias-tecnicas
            RESTRITA  POST    /ocorrencias-tecnicas
            RESTRITA  PUT     /ocorrencias-tecnicas/{id}/alternar-resolvido
            RESTRITA  GET     /ocorrencias/discente/{matricula}
            RESTRITA  GET     /permissoes
            RESTRITA  PUT     /permissoes/{nomeRegra}
            RESTRITA  GET     /voluntario
            RESTRITA  POST    /voluntario
            RESTRITA  PUT     /voluntario
            RESTRITA  DELETE  /voluntario/{matricula}
            """;

    private static final String LOGIN_COZI = "9400001";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping handlerMapping;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    // Nada de e-mail nem de Stripe de verdade enquanto o teste percorre as rotas.
    @MockBean
    private EmailService emailService;

    @MockBean
    private StripeService stripeService;

    private String bearerCozi() {
        User usuario = userRepository.findByLogin(LOGIN_COZI);
        if (usuario == null) {
            usuario = userRepository.save(new User(LOGIN_COZI, "senha-que-o-teste-nao-usa", UserRole.COZI));
        }
        return "Bearer " + tokenService.generateToken(usuario);
    }

    private static Map<String, String> tabelaEsperada() {
        Map<String, String> esperada = new TreeMap<>();
        for (String linha : TABELA.split("\n")) {
            String[] partes = linha.trim().split("\\s+");
            if (partes.length == 3) {
                esperada.put(partes[1] + " " + partes[2], partes[0]);
            }
        }
        return esperada;
    }

    private MockHttpServletRequestBuilder requisicao(String metodo, String padrao) {
        String caminho = padrao.replaceAll("\\{[^/}]*\\}", "1");
        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.request(HttpMethod.valueOf(metodo), caminho);
        if (!"GET".equals(metodo) && !"DELETE".equals(metodo)) {
            String corpo = "{}";
            if (padrao.equals("/frequenciavoluntario")) {
                // O ponto é do próprio voluntário: o corpo traz a matrícula de quem está logado.
                corpo = "{\"matricula\":\"" + LOGIN_COZI + "\"}";
            }
            builder.contentType(MediaType.APPLICATION_JSON).content(corpo);
        }
        return builder;
    }

    private Map<String, String> classificacaoObservada() throws Exception {
        String token = bearerCozi();
        Map<String, String> observada = new TreeMap<>();
        for (RequestMappingInfo info : handlerMapping.getHandlerMethods().keySet()) {
            Set<String> padroes = info.getPathPatternsCondition() == null
                    ? Set.of()
                    : info.getPathPatternsCondition().getPatternValues();
            Set<RequestMethod> metodos = info.getMethodsCondition().getMethods();
            List<String> metodosDaRota = new ArrayList<>();
            if (metodos.isEmpty()) {
                metodosDaRota.add("GET");
            } else {
                metodos.forEach(m -> metodosDaRota.add(m.name()));
            }
            for (String padrao : padroes) {
                if (padrao.startsWith("/error")) {
                    continue;
                }
                for (String metodo : metodosDaRota) {
                    int semLogin = mockMvc.perform(requisicao(metodo, padrao)).andReturn().getResponse().getStatus();
                    int comCozi = mockMvc.perform(requisicao(metodo, padrao).header(HttpHeaders.AUTHORIZATION, token))
                            .andReturn().getResponse().getStatus();
                    String classe = semLogin != 403 ? "PUBLICA" : (comCozi != 403 ? "LOGADO" : "RESTRITA");
                    observada.put(metodo + " " + padrao, classe);
                }
            }
        }
        return observada;
    }

    @Test
    void todaRotaTemClassificacaoEPermaneceNelaSemFicarMaisAberta() throws Exception {
        Map<String, String> esperada = tabelaEsperada();
        Map<String, String> observada = classificacaoObservada();

        Set<String> semClassificacao = new TreeSet<>(observada.keySet());
        semClassificacao.removeAll(esperada.keySet());
        assertThat(semClassificacao)
                .as("Rotas novas sem classificação na TABELA: decida se são PUBLICA, LOGADO ou RESTRITA e acrescente")
                .isEmpty();

        Set<String> obsoletas = new TreeSet<>(esperada.keySet());
        obsoletas.removeAll(observada.keySet());
        assertThat(obsoletas).as("Linhas da TABELA que não correspondem a nenhuma rota (remova ou corrija)").isEmpty();

        Map<String, String> divergentes = new TreeMap<>();
        observada.forEach((rota, classe) -> {
            if (!classe.equals(esperada.get(rota))) {
                divergentes.put(rota, "esperado " + esperada.get(rota) + ", observado " + classe);
            }
        });
        assertThat(divergentes).as("Rotas cujo acesso mudou em relação à TABELA").isEmpty();
    }
}
