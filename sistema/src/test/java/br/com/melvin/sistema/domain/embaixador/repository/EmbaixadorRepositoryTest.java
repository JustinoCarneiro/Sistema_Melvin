package br.com.melvin.sistema.domain.embaixador.repository;

import br.com.melvin.sistema.domain.embaixador.dto.EmbaixadorPublicoDTO;
import br.com.melvin.sistema.domain.embaixador.model.Embaixador;
import br.com.melvin.sistema.domain.imagem.model.Imagem;
import br.com.melvin.sistema.domain.imagem.repository.ImagemRepository;
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

    @Autowired
    private ImagemRepository imagemRepository;

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
    void listaPublicaTrazOCaminhoDaFotoQuandoHa() {
        Embaixador comFoto = salvar("Ana Com Foto", true, "Tem foto");
        Embaixador semFoto = salvar("Bia Sem Foto", true, "Sem foto");
        Embaixador pendenteComFoto = salvar("Caio Pendente", false, "Ainda não aprovado");
        imagemRepository.saveAndFlush(imagem(comFoto, "/app/docs/imagens_embaixadores/ana.jpg"));
        imagemRepository.saveAndFlush(imagem(pendenteComFoto, "/app/docs/imagens_embaixadores/caio.jpg"));

        List<EmbaixadorPublicoDTO> publicos = repository.findPublicos();

        assertThat(publicos).hasSize(2);
        assertThat(publicos).filteredOn(p -> p.getId().equals(comFoto.getId()))
                .singleElement().extracting(EmbaixadorPublicoDTO::getFotoPath).isEqualTo("/app/docs/imagens_embaixadores/ana.jpg");
        assertThat(publicos).filteredOn(p -> p.getId().equals(semFoto.getId()))
                .singleElement().extracting(EmbaixadorPublicoDTO::getFotoPath).isNull();
        assertThat(publicos).extracting(EmbaixadorPublicoDTO::getFotoPath).doesNotContain("/app/docs/imagens_embaixadores/caio.jpg");
    }

    @Test
    void fotoDeOutroTipoNaoApareceNoEmbaixador() {
        Embaixador e = salvar("Duda Aviso", true, "Id também usado por outro tipo");
        Imagem deAviso = imagem(e, "/app/docs/imagens_avisos/duda.jpg");
        deAviso.setTipo("aviso");
        imagemRepository.saveAndFlush(deAviso);

        assertThat(repository.findPublicos()).singleElement().extracting(EmbaixadorPublicoDTO::getFotoPath).isNull();
    }

    private Imagem imagem(Embaixador e, String caminho) {
        Imagem i = new Imagem();
        i.setIdAtrelado(e.getId());
        i.setTipo("embaixador");
        i.setFileName("foto.jpg");
        i.setFileType("image/jpeg");
        i.setFilePath(caminho);
        return i;
    }

    @Test
    void listaPublicaVaziaQuandoNaoHaAprovados() {
        salvar("Joao Pendente", false, "Quer ser embaixador");

        assertThat(repository.findPublicos()).isEmpty();
    }
}
