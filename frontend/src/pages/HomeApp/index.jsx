import styles from './HomeApp.module.scss';
import { useDashboard } from '../../hooks/useDashboard';
import { FaStar, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';

function Home() {
    const { 
        loading, 
        isRankingLoading,
        error, 
        frequenciaPorSala, 
        avisos, 
        rankingMelhores, 
        rankingPiores, 
        rankingSortBy, 
        setRankingSortBy
    } = useDashboard();

    const rankingOptions = [
        { value: 'media', label: 'Média Geral' },
        { value: 'presenca', label: 'Presença' },
        { value: 'participacao', label: 'Participação' },
        { value: 'comportamento', label: 'Comportamento' },
        { value: 'rendimento', label: 'Rendimento' },
        { value: 'psicologico', label: 'Psicológico' },
    ];

    if (loading) {
        return <div className={styles.centeredMessage}>Carregando Dashboard...</div>;
    }

    if (error && !frequenciaPorSala.manha) { // Mostra erro se a carga inicial falhar
        return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;
    }

    // Componente para a lista do ranking para evitar repetição de código
    const RankingList = ({ alunos }) => (
        <ul>
            {alunos.map(aluno => (
                <li key={aluno.matricula}>
                    <span>{aluno.nome}</span>
                    <span className={styles.nota}><FaStar color="#ffc107" /> {(aluno.mediaGeral || 0).toFixed(1)}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={styles.body}>
            <div className={styles.gridContainer}>
                {/* Card de Frequência */}
                <div className={`${styles.card} ${styles.frequenciaCard}`}>
                    <h3 className={styles.cardTitle}>Frequência do Dia</h3>
                    <div className={styles.turnos}>
                        <div className={styles.turno}>
                            <h4>Manhã</h4>
                            <p>Sala 1: <strong>{frequenciaPorSala.manha?.[1] ?? 0}</strong></p>
                            <p>Sala 2: <strong>{frequenciaPorSala.manha?.[2] ?? 0}</strong></p>
                            <p>Sala 3: <strong>{frequenciaPorSala.manha?.[3] ?? 0}</strong></p>
                            <p>Sala 4: <strong>{frequenciaPorSala.manha?.[4] ?? 0}</strong></p>
                            <p className={styles.total}>Total: <strong>{frequenciaPorSala.manha?.total ?? 0}</strong></p>
                        </div>
                        <div className={styles.turno}>
                            <h4>Tarde</h4>
                            <p>Sala 1: <strong>{frequenciaPorSala.tarde?.[1] ?? 0}</strong></p>
                            <p>Sala 2: <strong>{frequenciaPorSala.tarde?.[2] ?? 0}</strong></p>
                            <p>Sala 3: <strong>{frequenciaPorSala.tarde?.[3] ?? 0}</strong></p>
                            <p>Sala 4: <strong>{frequenciaPorSala.tarde?.[4] ?? 0}</strong></p>
                            <p className={styles.total}>Total: <strong>{frequenciaPorSala.tarde?.total ?? 0}</strong></p>
                        </div>
                    </div>
                </div>

                {/* Card de Ranking - Melhores Alunos */}
                <div className={`${styles.card} ${styles.rankingCard}`}>
                    <div className={styles.rankingHeader}>
                        <h3 className={styles.cardTitle}><FaArrowUp color="#28a745"/> Melhores Alunos</h3>
                        <select value={rankingSortBy} onChange={(e) => setRankingSortBy(e.target.value)} className={styles.rankingSelect} disabled={isRankingLoading}>
                            {rankingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {isRankingLoading ? <p className={styles.rankingLoading}>Atualizando...</p> : <RankingList alunos={rankingMelhores} />}
                </div>

                {/* Card de Ranking - Piores Alunos */}
                <div className={`${styles.card} ${styles.rankingCard}`}>
                    <div className={styles.rankingHeader}>
                        <h3 className={styles.cardTitle}><FaArrowDown color="#dc3545"/> Piores Alunos</h3>
                        <select value={rankingSortBy} onChange={(e) => setRankingSortBy(e.target.value)} className={styles.rankingSelect} disabled={isRankingLoading}>
                            {rankingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {isRankingLoading ? <p className={styles.rankingLoading}>Atualizando...</p> : <RankingList alunos={rankingPiores} />}
                </div>
            </div>
            
            {/* Bloco Unificado para os Avisos */}
            {avisos.length > 0 && (
                <div className={`${styles.card} ${styles.avisoCardContainer}`}>
                    <h3 className={styles.cardTitle}>Quadro de Avisos</h3>
                    <div className={styles.avisosList}>
                        {avisos.map(aviso => (
                            <div key={aviso.id} className={styles.avisoItem}>
                                <FaExclamationTriangle className={styles.avisoIcon} />
                                <div className={styles.avisoTextoContainer}>
                                    <h4 className={styles.avisoTitle}>{aviso.titulo}</h4>
                                    <p className={styles.avisoTexto}>{aviso.corpo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;