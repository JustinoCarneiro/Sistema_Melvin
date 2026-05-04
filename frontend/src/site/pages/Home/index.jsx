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
                        O Instituto Melvin Edward Huber é uma organização da sociedade civil de interesse público e sem fins lucrativos, o Instituto é voltado ao auxílio e amparo de crianças, jovens, adultos e idosos em situação de vulnerabilidade social.
                    </p>
                    <p className={styles.texto}>
                        Fundada em 23 de fevereiro de 2010 com 18 famílias, e hoje atende mais de 400 famílias.
                    </p>
                    
                    <button className={styles.button} style={{ marginTop: '1rem' }} onClick={() => navigate("/maissobrenos")}>Saiba mais</button>
                </div>
            </div>
        </div>
    );
}

export default Home;