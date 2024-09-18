import styles from "./Home.module.scss";

import { useNavigate } from "react-router-dom";

import foto_principal from "../../../docs/imagem_principal.jpeg";

function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.body}>
            <div className={styles.faixa_instmelvin}>
                <div className={styles.imagens}>
                    <div className={styles.imagem_front}>
                        <img src={foto_principal} alt="foto_principal" className={styles.img}/>
                    </div>
                    <div className={styles.imagem_back}></div>
                </div>
                <div className={styles.conteudo}>
                    <h2 className={styles.title}>Instituto Melvin Huber</h2>
                    <p className={styles.texto}>
                        <p>O Instituto Melvin Edward Huber é uma organização da sociedade civil de interesse público e sem fins lucrativos, o Instituto é voltado ao auxílio e amparo de crianças, jovens, adultos e idosos em situação de vulnerabilidade social.</p>
                        <p>Fundada em 23 de fevereiro de 2010 com 18 famílias, e hoje atende mais de 400 famílias.</p>
                    </p>
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