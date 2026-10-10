package br.com.melvin.sistema.domain.embaixador.repository;

import br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorPublicoDTO;
import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EmbaixadorRepositoryTest {

    @Autowired
    private EmbaixadorRepository repository;

    private Embaixador salvar(String nome, boolean aprovado, String descricao) {
        Embaixador e = new Embaixador();
        e.setNome(nome);
        e.setContato("85900000000");
        e.setEmail(nome.replace(" ", ".").toLowerCase() + "@teste.invalid");
        e.setInstagram("@" + nome.replace(" ", "_").toLowerCase());
        e.setStatus(aprovado);
        e.setContatado(false);
        e.setDescricao(descricao);
        return repository.saveAndFlush(e);
    }

    @Test
    void listaPublicaTrazSoAprovadosComIdNomeEDescricao() {
        Embaixador aprovado = salvar("Maria Aprovada", true, "Apoia o projeto");
        salvar("Joao Pendente", false, "Quer ser embaixador");

        List<EmbaixadorPublicoDTO> publicos = repository.findPublicos();

        assertThat(publicos).hasSize(1);
        assertThat(publicos.get(0).getId()).isEqualTo(aprovado.getId());
        assertThat(publicos.get(0).getNome()).isEqualTo("Maria Aprovada");
        assertThat(publicos.get(0).getDescricao()).isEqualTo("Apoia o projeto");
    }

    @Test
    void listaPublicaVaziaQuandoNaoHaAprovados() {
        salvar("Joao Pendente", false, "Quer ser embaixador");

        assertThat(repository.findPublicos()).isEmpty();
    }
}
