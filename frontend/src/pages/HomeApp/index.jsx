import styles from './HomeApp.module.scss';
import { useDashboard } from '../../hooks/useDashboard'; // 1. Importe o hook
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Ícones para o ranking

function Home() {
    const { loading, error, frequenciaPorSala, avisos, rankingMelhores, rankingPiores } = useDashboard();

    if (loading) {
        return <div className={styles.centeredMessage}>Carregando Dashboard...</div>;
    }

    if (error) {
        return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;
    }

    return (
        <div className={styles.body}>
            {/* Linha Superior: Frequência e Avisos */}
            <div className={styles.gridContainer}>
                {/* Card de Frequência */}
                <div className={`${styles.card} ${styles.frequenciaCard}`}>
                    <h3 className={styles.cardTitle}>Frequência do Dia</h3>
                    <div className={styles.turnos}>
                        <div className={styles.turno}>
                            <h4>Manhã</h4>
                            {Object.keys(frequenciaPorSala.manha || {}).map(sala => (
                                <p key={`manha-${sala}`}>Sala {sala}: <strong>{frequenciaPorSala.manha[sala]}</strong></p>
                            ))}
                        </div>
                        <div className={styles.turno}>
                            <h4>Tarde</h4>
                            {Object.keys(frequenciaPorSala.tarde || {}).map(sala => (
                                <p key={`tarde-${sala}`}>Sala {sala}: <strong>{frequenciaPorSala.tarde[sala]}</strong></p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card de Avisos */}
                {avisos.length > 0 && (
                     <div className={`${styles.card} ${styles.avisoCard}`}>
                        <h3 className={styles.cardTitle}>{avisos[0].titulo}</h3>
                        <div className={styles.avisoContent}>
                           {avisos[0].imageUrl && <img src={avisos[0].imageUrl} alt="Aviso" className={styles.avisoImg}/>}
                           <p className={styles.avisoTexto}>{avisos[0].corpo}</p>
                        </div>
                     </div>
                )}
            </div>

            {/* Linha Inferior: Rankings */}
            <div className={styles.gridContainer}>
                {/* Card Melhores Alunos */}
                <div className={`${styles.card} ${styles.rankingCard}`}>
                    <h3 className={styles.cardTitle}><FaArrowUp color="#28a745"/> Melhores alunos</h3>
                    <ul>
                        {rankingMelhores.map(aluno => (
                            <li key={aluno.matricula}>
                                <span>{aluno.nome}</span>
                                <span className={styles.nota}><FaStar color="#ffc107" /> {aluno.mediaGeral.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Card Piores Alunos */}
                <div className={`${styles.card} ${styles.rankingCard}`}>
                    <h3 className={styles.cardTitle}><FaArrowDown color="#dc3545"/> Alunos em atenção</h3>
                    <ul>
                        {rankingPiores.map(aluno => (
                            <li key={aluno.matricula}>
                                <span>{aluno.nome}</span>
                                <span className={styles.nota}><FaStar color="#ffc107" /> {aluno.mediaGeral.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Renderiza avisos adicionais se houver */}
            {avisos.slice(1).map(aviso => (
                 <div key={aviso.id} className={`${styles.card} ${styles.avisoCard} ${styles.avisoExtra}`}>
                    <h3 className={styles.cardTitle}>{aviso.titulo}</h3>
                    <div className={styles.avisoContent}>
                       {aviso.imageUrl && <img src={aviso.imageUrl} alt="Aviso" className={styles.avisoImg}/>}
                       <p className={styles.avisoTexto}>{aviso.corpo}</p>
                    </div>
                 </div>
            ))}
        </div>
    );
}

export default Home;