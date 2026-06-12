import styles from './Calendario.module.scss';
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import get from '@core/services/requests/get';
import post from '@core/services/requests/post';
import del from '@core/services/requests/delete';
import Botao from '@core/components/gerais/Botao';

function Calendario() {
    const [diasNaoLetivos, setDiasNaoLetivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [novaData, setNovaData] = useState('');
    const [novaDescricao, setNovaDescricao] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchDias = async () => {
        setLoading(true);
        try {
            const response = await get.diasNaoLetivos();
            if (response.data) {
                // Ordenar por data
                const sorted = response.data.sort((a, b) => new Date(a.data) - new Date(b.data));
                setDiasNaoLetivos(sorted);
            }
        } catch (err) {
            setError('Erro ao carregar calendário. Verifique a conexão com o servidor.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDias();
    }, []);

    const handleAdicionar = async (e) => {
        e.preventDefault();
        if (!novaData || !novaDescricao) {
            alert('Preencha a data e a descrição.');
            return;
        }

        setIsSubmitting(true);
        try {
            await post.diasNaoLetivos({
                data: novaData,
                descricao: novaDescricao
            });
            setNovaData('');
            setNovaDescricao('');
            fetchDias(); // Recarregar a lista
        } catch (err) {
            alert(err.message || 'Erro ao adicionar data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemover = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este feriado?')) return;
        
        try {
            await del.diasNaoLetivos(id);
            setDiasNaoLetivos(prev => prev.filter(dia => dia.id !== id));
        } catch (err) {
            alert(err.message || 'Erro ao remover data.');
        }
    };

    const formatDateBr = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    };

    return (
        <div className={styles.body}>
            <div className={styles.mainContent}>
                <div className={styles.headerTitle}>
                    <FaArrowLeft className={styles.backIcon} onClick={() => navigate('/app/config')} />
                    <FaCalendarAlt className={styles.iconTitle} />
                    <h1 className={styles.pageTitle}>Calendário de Exceções</h1>
                </div>

                <p className={styles.subtitle}>
                    Adicione os feriados regionais, recessos e pontos facultativos aqui. 
                    Os dias cadastrados nesta lista não contarão como falta nos relatórios de frequência.
                </p>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Adicionar Novo Dia Não Letivo</h3>
                    </div>
                    <form className={styles.addForm} onSubmit={handleAdicionar}>
                        <div className={styles.formGroup}>
                            <label>Data:</label>
                            <input 
                                type="date" 
                                className={styles.input}
                                value={novaData}
                                onChange={e => setNovaData(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup} style={{ flexGrow: 1 }}>
                            <label>Descrição (Ex: Feriado Municipal):</label>
                            <input 
                                type="text" 
                                className={styles.input}
                                value={novaDescricao}
                                onChange={e => setNovaDescricao(e.target.value)}
                                placeholder="Motivo do recesso..."
                            />
                        </div>
                        <div className={styles.btnWrapper}>
                            <Botao 
                                nome={isSubmitting ? "..." : "Adicionar"} 
                                type="submit" 
                                corFundo="#217346" 
                                corBorda="#107C41" 
                                disabled={isSubmitting}
                            >
                                <FaPlus />
                            </Botao>
                        </div>
                    </form>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Feriados e Recessos Cadastrados</h3>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Carregando...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : (
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diasNaoLetivos.length > 0 ? (
                                        diasNaoLetivos.map(dia => (
                                            <tr key={dia.id} className={styles.tr}>
                                                <td className={styles.dateCell}>{formatDateBr(dia.data)}</td>
                                                <td>{dia.descricao}</td>
                                                <td className={styles.actionCell}>
                                                    <button 
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleRemover(dia.id)}
                                                        title="Remover Feriado"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className={styles.empty}>Nenhum feriado cadastrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Calendario;
