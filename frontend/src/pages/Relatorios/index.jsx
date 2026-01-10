import styles from './Relatorios.module.scss';
import { useAlunos } from '../../hooks/useAlunos';
import { IoMdSearch } from "react-icons/io";
import { FaFileExcel, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import Botao from '../../components/gerais/Botao';
import get from '../../services/requests/get';
import { useState, useEffect, useMemo } from 'react';

function Relatorios() {
    const [exporting, setExporting] = useState(false);
    const [view, setView] = useState('desempenho');
    
    // Estados de Data
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    
    const [frequencias, setFrequencias] = useState([]);
    const [loadingFreq, setLoadingFreq] = useState(false);
    
    // Hooks e Estados do useAlunos
    const {
        busca, setBusca,
        aula, setAula,
        turnoSelecionado, setTurnoSelecionado,
        alunosFiltrados,
        loading, error,
        salasDisponiveis,
        isAdm, isCoor, isDire
    } = useAlunos();

    // Debug: Monitorar erros no console
    useEffect(() => {
        if(error) console.error("Erro no useAlunos:", error);
    }, [error]);

    const anosDisponiveis = useMemo(() => {
        const anoAtual = new Date().getFullYear();
        return [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2];
    }, []);

    useEffect(() => {
        if (view === 'frequencia' && frequencias.length === 0) {
            setLoadingFreq(true);
            get.frequenciadiscente()
                .then(res => setFrequencias(res.data || []))
                .catch(err => console.error("Erro ao buscar frequências", err))
                .finally(() => setLoadingFreq(false));
        }
    }, [view]);

    // --- LÓGICA DE PROCESSAMENTO ---
    const dadosFrequencia = useMemo(() => {
        if (view !== 'frequencia') return null;
        
        // Proteção contra lista nula
        const listaAlunos = alunosFiltrados || [];

        const anoTarget = parseInt(anoSelecionado);
        const mesIndex = parseInt(mesSelecionado);
        const totalDiasNoMes = new Date(anoTarget, mesIndex + 1, 0).getDate();
        
        const todosDiasDoMes = [];
        for (let dia = 1; dia <= totalDiasNoMes; dia++) {
            const diaFormatado = String(dia).padStart(2, '0');
            const mesFormatado = String(mesIndex + 1).padStart(2, '0');
            todosDiasDoMes.push(`${anoTarget}-${mesFormatado}-${diaFormatado}`);
        }

        const freqsDoMes = frequencias.filter(f => {
            if (!f.data) return false;
            try {
                // Força conversão para string para evitar erros de split
                const dataString = String(f.data);
                if(!dataString.includes('-')) return false;

                const partes = dataString.split('-');
                const fAno = partes[0];
                const fMes = partes[1];
                
                return parseInt(fMes) - 1 === mesIndex && parseInt(fAno) === anoTarget;
            } catch (e) {
                console.warn("Erro ao processar data da frequência:", f, e);
                return false;
            }
        });

        const linhas = listaAlunos.map(aluno => {
            const presencasAluno = freqsDoMes.filter(f => String(f.matricula) === String(aluno.matricula));
            const diasMap = {};
            
            todosDiasDoMes.forEach(dia => {
                const registro = presencasAluno.find(p => p.data === dia);
                let cellData = { status: '-', just: null };

                if (registro) {
                    const turnoAluno = aluno.turno 
                        ? aluno.turno.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                        : "";
                    const isManha = turnoAluno.includes("manha") || turnoAluno.includes("matutino");
                    
                    let valorPresenca = isManha ? registro.presenca_manha : registro.presenca_tarde;
                    valorPresenca = String(valorPresenca).toUpperCase();

                    if (['P', 'TRUE', 'OBS'].includes(valorPresenca)) {
                        cellData.status = 'P';
                    } else if (['F', 'FALSE'].includes(valorPresenca)) {
                        cellData.status = 'F';
                    } else if (['J', 'FJ', 'JUSTIFICADA'].includes(valorPresenca)) {
                        cellData.status = 'FJ';
                        cellData.just = registro.justificativa || "Justificativa não informada";
                    }
                }
                diasMap[dia] = cellData;
            });

            return { ...aluno, dias: diasMap };
        });

        return { colunas: todosDiasDoMes, linhas };
    }, [alunosFiltrados, frequencias, mesSelecionado, anoSelecionado, view]);

    // Helpers
    const formatNota = (valor) => valor ? valor.toFixed(1) : '-';
    
    const getCorNota = (valor) => {
        if (!valor) return 'inherit';
        if (valor >= 4) return '#217346';
        if (valor >= 3) return '#F29F05';
        return '#C70039';
    };

    const getCorPresenca = (status) => {
        if (status === 'P') return '#217346';
        if (status === 'F') return '#C70039';
        if (status === 'FJ') return '#F29F05';
        return '#ddd';
    };

    const formatDataColuna = (dataString) => {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}`;
    };

    const handleExportClick = async () => {
        setExporting(true);
        try {
            if (view === 'frequencia') {
                // Exportação da Grade de Frequência
                await get.exportarFrequencia(
                    mesSelecionado, 
                    anoSelecionado, 
                    aula, // 'aula' é o estado que guarda a sala selecionada
                    turnoSelecionado, 
                    busca
                );
            } else {
                // Exportação Padrão (Desempenho/Lista Geral)
                await get.exportarDiscentes(busca);
            }
        } catch (error) {
            console.error(error);
            alert("Não foi possível exportar os dados. Verifique se o servidor está rodando.");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className={styles.centeredMessage}>Carregando dados...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    // Proteção final para renderização da lista
    const listaSegura = alunosFiltrados || [];

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.topHeader}>
                        {/* --- TÍTULO E CONTADOR --- */}
                        <div className={styles.titleWrapper}>
                            <h2 className={styles.title}>Relatórios</h2>
                            <span className={styles.counterBadge}>
                                Total: <strong>{listaSegura.length}</strong>
                            </span>
                        </div>

                        {/* --- BOTÕES DE ABA --- */}
                        <div className={styles.toggleContainer}>
                            <button 
                                className={`${styles.toggleBtn} ${view === 'desempenho' ? styles.active : ''}`}
                                onClick={() => setView('desempenho')}
                            >
                                <FaChartBar /> Desempenho
                            </button>
                            <button 
                                className={`${styles.toggleBtn} ${view === 'frequencia' ? styles.active : ''}`}
                                onClick={() => setView('frequencia')}
                            >
                                <FaCalendarAlt /> Frequência
                            </button>
                        </div>
                    </div>
                    
                    {/* --- FILTROS --- */}
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca} />
                            <input
                                className={styles.busca}
                                type='text'
                                placeholder='Buscar por nome...'
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        {view === 'frequencia' && (
                            <>
                                <select
                                    className={styles.select_sala}
                                    value={mesSelecionado}
                                    onChange={(e) => setMesSelecionado(e.target.value)}
                                >
                                    <option value="0">Janeiro</option>
                                    <option value="1">Fevereiro</option>
                                    <option value="2">Março</option>
                                    <option value="3">Abril</option>
                                    <option value="4">Maio</option>
                                    <option value="5">Junho</option>
                                    <option value="6">Julho</option>
                                    <option value="7">Agosto</option>
                                    <option value="8">Setembro</option>
                                    <option value="9">Outubro</option>
                                    <option value="10">Novembro</option>
                                    <option value="11">Dezembro</option>
                                </select>

                                <select
                                    className={styles.select_sala}
                                    value={anoSelecionado}
                                    onChange={(e) => setAnoSelecionado(e.target.value)}
                                >
                                    {anosDisponiveis.map(ano => (
                                        <option key={ano} value={ano}>{ano}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {(isAdm || isCoor || isDire) && (
                            <select
                                className={styles.select_sala}
                                value={turnoSelecionado}
                                onChange={(e) => setTurnoSelecionado(e.target.value)}
                            >
                                <option value="manha">Manhã</option>
                                <option value="tarde">Tarde</option>
                                <option value="todos">Todos</option>
                            </select>
                        )}
                        
                        <select
                            className={styles.select_sala}
                            value={aula}
                            onChange={(e) => setAula(e.target.value)}
                        >
                            <option value="todos">Todas Salas</option>
                            {salasDisponiveis.map((sala) => (
                                <option key={sala} value={sala}>
                                    {sala <= 4 ? `Sala ${sala}` : {'5':'Inglês','6':'Karatê','7':'Informática','8':'Teatro','9':'Ballet','10':'Música','11':'Futsal','12':'Artesanato'}[sala] || `Sala ${sala}`}
                                </option>
                            ))}
                        </select>

                        {(isAdm || isCoor || isDire) && (
                            <Botao 
                                nome={exporting ? "..." : "Exportar"}
                                corFundo="#217346"
                                corBorda="#107C41"
                                type="button"
                                onClick={handleExportClick}
                                disabled={exporting}
                            >
                                <FaFileExcel />
                            </Botao>
                        )}
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    {/* --- TABELA DE DESEMPENHO --- */}
                    {view === 'desempenho' && (
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr_head}>
                                    <th>Nome</th>
                                    <th>Matrícula</th>
                                    <th title="Avaliação de Presença">Presença</th>
                                    <th title="Avaliação de Participação">Partic.</th>
                                    <th title="Avaliação de Comportamento">Comport.</th>
                                    <th title="Avaliação de Rendimento">Rendim.</th>
                                    <th title="Avaliação Psicológica">Psico.</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {listaSegura.length > 0 ? (
                                    listaSegura.map((aluno) => (
                                        <tr key={aluno.matricula} className={styles.tr_body}>
                                            <td className={styles.nomeAluno}>{aluno.nome}</td>
                                            <td>{aluno.matricula}</td>
                                            <td style={{color: getCorNota(aluno.avaliacaoPresenca), fontWeight: 'bold'}}>
                                                {formatNota(aluno.avaliacaoPresenca)}
                                            </td>
                                            <td style={{color: getCorNota(aluno.avaliacaoParticipacao), fontWeight: 'bold'}}>
                                                {formatNota(aluno.avaliacaoParticipacao)}
                                            </td>
                                            <td style={{color: getCorNota(aluno.avaliacaoComportamento), fontWeight: 'bold'}}>
                                                {formatNota(aluno.avaliacaoComportamento)}
                                            </td>
                                            <td style={{color: getCorNota(aluno.avaliacaoRendimento), fontWeight: 'bold'}}>
                                                {formatNota(aluno.avaliacaoRendimento)}
                                            </td>
                                            <td style={{color: getCorNota(aluno.avaliacaoPsicologico), fontWeight: 'bold'}}>
                                                {formatNota(aluno.avaliacaoPsicologico)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className={styles.empty}>Nenhum aluno encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* --- TABELA DE FREQUÊNCIA --- */}
                    {view === 'frequencia' && (
                        <>
                            {loadingFreq ? (
                                <div className={styles.loading}>Carregando frequências...</div>
                            ) : (
                                <table className={styles.table}>
                                    <thead className={styles.thead}>
                                        <tr className={styles.tr_head}>
                                            <th className={styles.stickyCol}>Nome</th>
                                            <th className={styles.stickyCol}>Matrícula</th>
                                            {dadosFrequencia?.colunas.map(data => (
                                                <th key={data} className={styles.thDate}>
                                                    {formatDataColuna(data)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={styles.tbody}>
                                        {dadosFrequencia?.linhas.length > 0 ? (
                                            dadosFrequencia.linhas.map((aluno) => (
                                                <tr key={aluno.matricula} className={styles.tr_body}>
                                                    <td className={`${styles.nomeAluno} ${styles.stickyCol}`}>{aluno.nome}</td>
                                                    <td className={styles.stickyCol}>{aluno.matricula}</td>
                                                    
                                                    {dadosFrequencia.colunas.map(data => {
                                                        const cell = aluno.dias[data];
                                                        return (
                                                            <td 
                                                                key={data} 
                                                                style={{
                                                                    textAlign: 'center', 
                                                                    color: getCorPresenca(cell.status), 
                                                                    fontWeight: 'bold',
                                                                    cursor: cell.status === 'FJ' ? 'help' : 'default'
                                                                }}
                                                                title={cell.just ? `Justificativa: ${cell.just}` : undefined}
                                                            >
                                                                {cell.status}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="100%" className={styles.empty}>Nenhum aluno encontrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Relatorios;