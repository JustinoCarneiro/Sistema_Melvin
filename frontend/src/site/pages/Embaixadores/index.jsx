import styles from './Embaixadores.module.scss';

import { useNavigate } from "react-router-dom";

function Embaixadores(){
    const navigate = useNavigate();

    return(
        <div className={styles.body}>
            <div className={styles.faixa_embaixadores}>
                <h2 className={styles.title_faixa_embaixadores}>Embaixadores</h2>
                <div className={styles.container_embaixadores}>
                    <div className={styles.embaixador}>
                        <div className={styles.foto}></div>
                        <div className={styles.nome}>Nome do influenciador</div>
                        <div className={styles.descricao}>Descrição breve de quem é o influenciador.</div>
                    </div>
                    <div className={styles.embaixador}>
                        <div className={styles.foto}></div>
                        <div className={styles.nome}>Nome do influenciador</div>
                        <div className={styles.descricao}>Descrição breve de quem é o influenciador.</div>
                    </div>
                    <div className={styles.embaixador}>
                        <div className={styles.foto}></div>
                        <div className={styles.nome}>Nome do influenciador</div>
                        <div className={styles.descricao}>Descrição breve de quem é o influenciador.</div>
                    </div>
                    <div className={styles.embaixador}>
                        <div className={styles.foto}></div>
                        <div className={styles.nome}>Nome do influenciador</div>
                        <div className={styles.descricao}>Descrição breve de quem é o influenciador.</div>
                    </div>
                    <div className={styles.embaixador}>
                        <div className={styles.foto}></div>
                        <div className={styles.nome}>Nome do influenciador</div>
                        <div className={styles.descricao}>Descrição breve de quem é o influenciador.</div>
                    </div>
                </div>
            </div>
            <div className={styles.faixa_embaixadores_explicacao}>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Embaixador do Melvin</h2>
                    <p className={styles.texto}>Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker.</p>
                    <button className={styles.button} onClick={() => navigate("/serembaixador")}>Quero ser um embaixador!</button>
                </div>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}></div>
                    <div className={styles.imagem_back}></div>
                </div>
            </div>
        </div>
    )
}

export default Embaixadores;