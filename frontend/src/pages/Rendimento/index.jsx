import styles from './Rendimento.module.scss';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRendimento } from '../../hooks/useRendimento'; // Importe o novo hook
import StarRating from '../../components/gerais/StarRating';


function Rendimento() {
    const { matricula } = useParams();
    const navigate = useNavigate();
    const {
        aluno,
        frequencias,
        mesSelecionado,
        setMesSelecionado,
        anoSelecionado,
        setAnoSelecionado,
        avaliacoes,
        aulasExtrasMap,
        loading,
        loadingFrequencias,
        error,
        fetchFrequencias,
        handleRate
    } = useRendimento(matricula);

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    if (loading) {
        return <div className={styles.centeredMessage}>Carregando...</div>;
    }

    if (error && !aluno) {
        return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;
    }

    const aulasDoAluno = Object.keys(aulasExtrasMap).filter(aulaKey => aluno && aluno[aulaKey]);

    return (
        <div className={styles.body}>
            <div className={styles.linha_voltar}>
                <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
            </div>
            <div className={styles.header}>
                <h2>Rendimento do Aluno</h2>
                <p><strong>Nome:</strong> {aluno?.nome}</p>
                <p><strong>Matrícula:</strong> {aluno?.matricula}</p>
            </div>
            <div className={styles.section}>
                <h3>Avaliação de Desempenho (Aulas Extras)</h3>
                <div className={styles.avaliacoesContainer}>
                    {aulasDoAluno.length > 0 ? (
                        aulasDoAluno.map(aulaKey => (
                            <div key={aulaKey} className={styles.aulaItem}>
                                <h4>{aulasExtrasMap[aulaKey]}</h4>
                                <StarRating
                                    initialRating={avaliacoes[aulaKey]?.nota || 0}
                                    onRate={(nota) => handleRate(aulaKey, nota)}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Este aluno não está matriculado em nenhuma aula extra.</p>
                    )}
                </div>
            </div>

            {/* Seção de Frequências */}
            <div className={styles.section}>
                <h3>Controle de Frequência</h3>
                <div className={styles.filterContainer}>
                    <label>
                        Mês:
                        <select value={mesSelecionado} onChange={(e) => setMesSelecionado(Number(e.target.value))}>
                            {meses.map((mes, index) => (
                                <option key={index} value={index + 1}>{mes}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Ano:
                        <input
                            type="number"
                            value={anoSelecionado}
                            onChange={(e) => setAnoSelecionado(e.target.value)}
                            min="2020"
                            max={new Date().getFullYear()}
                        />
                    </label>
                    <button onClick={fetchFrequencias} disabled={loadingFrequencias}>
                        {loadingFrequencias ? 'Buscando...' : 'Buscar Frequências'}
                    </button>
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <div className={styles.frequenciasList}>
                    {frequencias.length > 0 ? (
                        <ul>
                            {frequencias.map((freq, index) => (
                                <li key={index}>
                                    Data: {new Date(freq.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - 
                                    Manhã: {freq.presenca_manha ? 'Presente' : 'Ausente'} - 
                                    Tarde: {freq.presenca_tarde ? 'Presente' : 'Ausente'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nenhuma frequência encontrada para o período selecionado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Rendimento;