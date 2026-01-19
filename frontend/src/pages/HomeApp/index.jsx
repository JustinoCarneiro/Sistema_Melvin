import styles from './HomeApp.module.scss';
import { useDashboard } from '../../hooks/useDashboard';
import { FaStar, FaArrowUp, FaArrowDown, FaBullhorn, FaCalendarAlt } from 'react-icons/fa';

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

    if (loading) return <div className={styles.loadingContainer}>Carregando Dashboard...</div>;

    if (error && !frequenciaPorSala.manha) {
        return <div className={styles.errorContainer}>{error}</div>;
    }

    const RankingList = ({ alunos, type }) => (
        <ul className={styles.rankingList}>
            {alunos.length > 0 ? alunos.map((aluno, index) => (
                <li key={aluno.matricula} className={styles.rankingItem}>
                    <div className={styles.rankPosition}>{index + 1}º</div>
                    <div className={styles.studentInfo}>
                        <span className={styles.studentName}>{aluno.nome}</span>
                        <span className={styles.studentMatricula}>#{aluno.matricula}</span>
                    </div>
                    <div className={`${styles.scoreBadge} ${type === 'bad' ? styles.badScore : ''}`}>
                        <FaStar className={styles.starIcon} /> 
                        {(aluno.mediaGeral || 0).toFixed(1)}
                    </div>
                </li>
            )) : (
                <li className={styles.emptyList}>Nenhum aluno encontrado.</li>
            )}
        </ul>
    );

    return (
        <div className={styles.body}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <p className={styles.pageSubtitle}>Visão geral do instituto</p>
            </div>

            <div className={styles.dashboardGrid}>
                {/* --- CARD DE FREQUÊNCIA --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><FaCalendarAlt /> Frequência do Dia</h3>
                    </div>
                    <div className={styles.frequencyContainer}>
                        {/* Manhã */}
                        <div className={styles.turnSection}>
                            <h4 className={styles.turnTitle}>Manhã</h4>
                            <div className={styles.roomGrid}>
                                {[1, 2, 3, 4].map(sala => (
                                    <div key={`m-${sala}`} className={styles.roomItem}>
                                        <span>Sala {sala}</span>
                                        <strong>{frequenciaPorSala.manha?.[sala] ?? 0}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Manhã</span>
                                <span className={styles.totalValue}>{frequenciaPorSala.manha?.total ?? 0}</span>
                            </div>
                        </div>
                        
                        <div className={styles.divider}></div>

                        {/* Tarde */}
                        <div className={styles.turnSection}>
                            <h4 className={styles.turnTitle}>Tarde</h4>
                            <div className={styles.roomGrid}>
                                {[1, 2, 3, 4].map(sala => (
                                    <div key={`t-${sala}`} className={styles.roomItem}>
                                        <span>Sala {sala}</span>
                                        <strong>{frequenciaPorSala.tarde?.[sala] ?? 0}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Tarde</span>
                                <span className={styles.totalValue}>{frequenciaPorSala.tarde?.total ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RANKING: MELHORES --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerTitleGroup}>
                            <FaArrowUp color="#28a745"/>
                            <h3>Destaques</h3>
                        </div>
                        <select 
                            value={rankingSortBy} 
                            onChange={(e) => setRankingSortBy(e.target.value)} 
                            className={styles.selectFilter} 
                            disabled={isRankingLoading}
                        >
                            {rankingOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.listContainer}>
                        {isRankingLoading ? <p className={styles.updating}>Atualizando...</p> : <RankingList alunos={rankingMelhores} type="good" />}
                    </div>
                </div>

                {/* --- RANKING: PIORES --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerTitleGroup}>
                            <FaArrowDown color="#dc3545"/>
                            <h3>Atenção Necessária</h3>
                        </div>
                    </div>
                    <div className={styles.listContainer}>
                        {isRankingLoading ? <p className={styles.updating}>Atualizando...</p> : <RankingList alunos={rankingPiores} type="bad" />}
                    </div>
                </div>
            </div>
            
            {/* --- AVISOS --- */}
            {avisos.length > 0 && (
                <div className={styles.avisosSection}>
                    <h3 className={styles.sectionTitle}><FaBullhorn /> Quadro de Avisos</h3>
                    <div className={styles.avisosGrid}>
                        {avisos.map(aviso => (
                            <div key={aviso.id} className={styles.avisoCard}>
                                <div className={styles.avisoHeader}>
                                    <h4>{aviso.titulo}</h4>
                                    {aviso.data_inicio && <span className={styles.avisoDate}>{aviso.data_inicio}</span>}
                                </div>
                                <p>{aviso.corpo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;