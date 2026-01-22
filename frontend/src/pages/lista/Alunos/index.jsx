import styles from './Alunos.module.scss';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook original (para o modo Ativos)
import { useAlunos } from '../../../hooks/useAlunos';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus, FaFileExcel } from "react-icons/fa6";
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';
import get from '../../../services/requests/get';

function Alunos({ modoDesativados = false }) {
    const navigate = useNavigate();

    // --- ESTADOS GERAIS ---
    const [exporting, setExporting] = useState(false);

    // --- ESTADOS PARA MODO "DESATIVADOS" ---
    // (Só usados se modoDesativados for true)
    const [desativados, setDesativados] = useState([]);
    const [loadingDesativados, setLoadingDesativados] = useState(false);
    const [errorDesativados, setErrorDesativados] = useState(null);
    const [buscaDesativados, setBuscaDesativados] = useState('');

    // --- HOOK PARA MODO "ATIVOS" ---
    // O hook é chamado sempre (regras do React), mas só usamos seus dados se modoDesativados for false
    const {
        busca, setBusca,
        aula, setAula,
        filtroEspera, setFiltroEspera,
        turnoSelecionado, setTurnoSelecionado,
        alunosFiltrados: ativosFiltrados,
        loading: loadingAtivos,
        error: errorAtivos,
        isAdm, isCoor, isDire, isPsico, isAssist,
        salasDisponiveis
    } = useAlunos();

    // --- EFEITO: BUSCAR DESATIVADOS ---
    useEffect(() => {
        if (modoDesativados) {
            setLoadingDesativados(true);
            const fetchDesativados = async () => {
                try {
                    const response = await get.discente();
                    const dados = response.data;
                    if (Array.isArray(dados)) {
                        // Filtra status false
                        setDesativados(dados.filter(aluno => String(aluno.status) === 'false'));
                    }
                } catch (err) {
                    console.error("Erro ao buscar desativados:", err);
                    setErrorDesativados("Não foi possível carregar os alunos desativados.");
                } finally {
                    setLoadingDesativados(false);
                }
            };
            fetchDesativados();
        }
    }, [modoDesativados]);

    // --- FILTRAGEM DE DESATIVADOS (LOCAL) ---
    // Usamos useMemo para não recalcular a cada render se nada mudar
    const desativadosFiltrados = useMemo(() => {
        if (!modoDesativados) return [];
        const termo = buscaDesativados.toLowerCase();
        return desativados.filter(aluno => 
            aluno.matricula.toString().includes(termo) ||
            aluno.nome.toLowerCase().includes(termo)   ||
            (aluno.nome_pai || '').toLowerCase().includes(termo) ||
            (aluno.nome_mae || '').toLowerCase().includes(termo)
        );
    }, [desativados, buscaDesativados, modoDesativados]);

    // --- UNIFICAÇÃO DOS DADOS PARA RENDERIZAÇÃO ---
    const listaParaExibir = modoDesativados ? desativadosFiltrados : ativosFiltrados;
    const isLoading = modoDesativados ? loadingDesativados : loadingAtivos;
    const errorMessage = modoDesativados ? errorDesativados : errorAtivos;

    // --- MANIPULADORES ---
    const handleEditClick = (matricula) => {
        navigate(`/app/aluno/editar/${matricula}`);
    };

    const handleFrequenciasClick = () => {
        navigate("/app/frequencias/alunos");
    };

    const handleExportClick = async () => {
        setExporting(true);
        try {
            await get.exportarDiscentes(busca);
        } catch (error) {
            alert(error.message || "Não foi possível exportar os dados.");
        } finally {
            setExporting(false);
        }
    };

    // --- DEFINIÇÃO DO TÍTULO ---
    let tituloPagina = "Alunos";
    if (modoDesativados) tituloPagina = "Alunos Desativados";
    else if (filtroEspera) tituloPagina = "Alunos em espera...";

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                {/* --- CABEÇALHO --- */}
                <div className={styles.header}>
                    <div className={styles.titleGroup} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {modoDesativados && (
                            <IoMdArrowRoundBack 
                                className={styles.voltar} 
                                onClick={() => navigate(-1)} 
                                title="Voltar"
                            />
                        )}
                        <h2 className={styles.title}>{tituloPagina}</h2>
                    </div>
                    
                    {/* --- FILTROS --- */}
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca} />
                            <input
                                className={styles.busca}
                                type='text'
                                placeholder='Buscar por nome ou matrícula...'
                                value={modoDesativados ? buscaDesativados : busca}
                                onChange={(e) => modoDesativados ? setBuscaDesativados(e.target.value) : setBusca(e.target.value)}
                            />
                        </div>
                        
                        {/* Botões extras: Apenas no modo ATIVOS */}
                        {!modoDesativados && (
                            <div className={styles.botoes}>
                                {(isAdm || isCoor || isDire || isAssist || isPsico) && (
                                    <>
                                        <select
                                            className={styles.select_sala}
                                            value={turnoSelecionado}
                                            onChange={(e) => setTurnoSelecionado(e.target.value)}
                                        >
                                            <option value="todos">Todos Turnos</option>
                                            <option value="manha">Manhã</option>
                                            <option value="tarde">Tarde</option>
                                        </select>
                                        <Botao
                                            nome={filtroEspera ? "Mostrar Ativos" : "Em espera"}
                                            corFundo="#F29F05"
                                            corBorda="#8A6F3E"
                                            type="button"
                                            onClick={() => setFiltroEspera(!filtroEspera)}
                                        />
                                    </>
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
                                
                                {!isPsico && !isAssist && (
                                    <Botao
                                        nome="Frequências"
                                        corFundo="#7EA629"
                                        corBorda="#58751A"
                                        type="button"
                                        onClick={handleFrequenciasClick}
                                    />
                                )}

                                {(isAdm || isCoor || isDire || isAssist) && (
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
                        )}
                    </div>
                </div>
                
                {errorMessage && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{errorMessage}</div>}

                {/* --- TABELA --- */}
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Responsável</th>
                                {(isAdm || isCoor || isDire || isPsico || isAssist) && <th className={styles.edicao}>Edição</th>}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '3rem', color: '#999'}}>
                                        Carregando...
                                    </td>
                                </tr>
                            ) : (
                                listaParaExibir.length > 0 ? (
                                    listaParaExibir.map((aluno) => (
                                        <tr key={aluno.matricula} className={styles.tr_body}>
                                            <td data-label="Matrícula">{aluno.matricula}</td>
                                            <td data-label="Nome">{aluno.nome}</td>
                                            <td data-label="Responsável">{aluno.nome_pai || aluno.nome_mae || '-'}</td>
                                            {(isAdm || isCoor || isDire || isPsico || isAssist) && (
                                                <td className={styles.edicao} data-label="Ações">
                                                    <MdOutlineModeEdit
                                                        className={styles.icon_editar}
                                                        onClick={() => handleEditClick(aluno.matricula)}
                                                        title="Editar Aluno"
                                                    />
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{textAlign: 'center', padding: '3rem', color: '#999'}}>
                                            {modoDesativados ? "Nenhum aluno desativado encontrado." : "Nenhum aluno encontrado."}
                                        </td>
                                    </tr>
                                )
                            )}
                            
                            {/* Botão Adicionar: Apenas se NÃO for modo desativados e NÃO estiver carregando */}
                            {!isLoading && !modoDesativados && (isAdm || isCoor || isDire || isAssist) && (
                                <tr className={styles.plus} onClick={() => navigate("/app/aluno/criar")}>
                                    <td colSpan="4"><FaPlus className={styles.icon_plus} /> Adicionar novo aluno</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Alunos;