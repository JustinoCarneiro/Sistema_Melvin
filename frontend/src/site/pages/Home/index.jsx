import styles from "./Home.module.scss";
import { useNavigate } from "react-router-dom";
import foto_principal from "../../../docs/imagem_principal.jpeg";
import { useEffect, useState } from "react";
import amigoMelvinService from "../../../services/amigoMelvinService";

function Home() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalAtivos: 0, valorTotal: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await amigoMelvinService.getStats();
                setStats(data);
            } catch (err) {
                console.error("Erro ao carregar estatísticas", err);
            }
        };
        fetchStats();
    }, []);

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
                    
                    <div className={styles.impactStats} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Nosso Impacto Atual</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>{stats.totalAtivos}</strong> Doadores Ativos</p>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>R$ {stats.valorTotal ? stats.valorTotal.toFixed(2) : '0.00'}</strong> Arrecadados Mensalmente</p>
                    </div>

                    <button className={styles.button} style={{ marginTop: '1rem' }} onClick={() => navigate("/maissobrenos")}>Saiba mais</button>
                </div>
            </div>
        </div>
    );
}

export default Home;