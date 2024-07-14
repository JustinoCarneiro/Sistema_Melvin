import styles from './MaisSobreNos.module.scss';

import { useState, useEffect} from "react";
import get from '../../../services/requests/get';

function MaisSobreNos(){

    const [voluntarios, setVoluntarios] = useState([]);
    
    useEffect(() => {
        const fetchVoluntarios = async () => {
            try {
                const response = await get.voluntarioNomesFuncoes();
                console.log("response", response);
                if (response.status === 200) {
                    setVoluntarios(response.data);
                    console.log("dados", response.data);
                }
            } catch (error) {
                console.error("Erro ao buscar dados dos funcionários:", error);
            }
        };

        fetchVoluntarios();
    }, []);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return(
        <div className={styles.body}>
            <div className={styles.faixa_instmelvin}>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Instituto Melvin Huber</h2>
                    <p className={styles.paragrafo_acima}>
                        Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker. Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker.
                    </p>
                </div>
                <div className={styles.imagens}>
                    <div className={styles.imagem_es}></div>
                    <div className={styles.imagem_ei}></div>
                    <div className={styles.imagem_ds}></div>
                    <div className={styles.imagem_di}></div>
                </div>
            </div>
            <p className={styles.paragrafo_abaixo}>
                Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker. Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker.
            </p>
            <div className={styles.faixa_objetivos}>
                <h3 className={styles.title_faixa_objetivo}>Objetivos</h3>
                <div className={styles.objetivos}>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}></div>
                        <p className={styles.descricao_objetivo}>Descrição rápida do objetivo 1</p>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}></div>
                        <p className={styles.descricao_objetivo}>Descrição rápida do objetivo 2</p>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}></div>
                        <p className={styles.descricao_objetivo}>Descrição rápida do objetivo 3</p>
                    </div>
                    <div className={styles.caixa_objetivo}>
                        <div className={styles.imagem_objetivo}></div>
                        <p className={styles.descricao_objetivo}>Descrição rápida do objetivo 4</p>
                    </div>
                </div>
            </div>
            <div className={styles.faixa_valores}>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Missão</h4>
                    <p className={styles.descricao_valor}>
                        Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os
                    </p>
                </div>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Visão</h4>
                    <p className={styles.descricao_valor}>
                        Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os
                    </p>
                </div>
                <div className={styles.caixa_valor}>
                    <h4 className={styles.title_valor}>Valores</h4>
                    <p className={styles.descricao_valor}>
                        Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os
                    </p>
                </div>
            </div>
            <div className={styles.faixa_voluntarios}>
                <h4 className={styles.title_faixa_voluntarios}>Corpo de voluntários</h4>
                <div className={styles.grid_voluntarios}>
                    {voluntarios.map((voluntario, index) => (
                        <div key={index} className={styles.linha}>
                            <p className={styles.funcao}>{capitalizeFirstLetter(voluntario.funcao)}</p>
                            <p className={styles.nome}>{voluntario.nome}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MaisSobreNos;