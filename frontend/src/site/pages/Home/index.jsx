import styles from "./Home.module.scss";

import { useNavigate } from "react-router-dom";


function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.body}>
            <div className={styles.faixa_instmelvin}>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}></div>
                    <div className={styles.imagem_back}></div>
                </div>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Instituto Melvin Huber</h2>
                    <p className={styles.texto}>Lorem Ipsum é simplesmente uma simulação de texto da  indústria tipográfica e de impressos, e vem sendo utilizado desde o  século XVI, quando um impressor desconhecido pegou uma bandeja de tipmax-width: $size-bos e  os embaralhou para fazer um livro de modelos de tipos. Lorem Ipsum  sobreviveu não só a cinco séculos, como também ao salto para a  editoração eletrônica, permanecendo essencialmente inalterado. Se  popularizou na década de 60, quando a Letraset lançou decalques contendo  passagens de Lorem Ipsum, e mais recentemente quando passou a ser  integrado a softwares de editoração eletrônica como Aldus PageMaker.</p>
                    <button className={styles.button} onClick={() => navigate("/maissobrenos")}>Saiba mais</button>
                </div>
            </div>
            <div className={styles.faixa_eventos}>
                <h3 className={styles.title_faixa_evento}>Eventos</h3>
                <div className={styles.rolagem_eventos}>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Dia das crianças</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Páscoa</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Natal</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Natal</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Natal</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                    <div className={styles.caixa_evento}>
                        <h4 className={styles.title_evento}>Natal</h4>
                        <div className={styles.imagem_evento}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;