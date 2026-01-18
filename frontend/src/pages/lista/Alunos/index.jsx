import styles from './Alunos.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAlunos } from '../../../hooks/useAlunos';
import { useState } from 'react';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus, FaFileExcel } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';
import get from '../../../services/requests/get';

function Alunos() {
    const navigate = useNavigate();
    const [exporting, setExporting] = useState(false);

    const {
        busca,
        setBusca,
        aula,
        setAula,
        filtroEspera,
        setFiltroEspera,
        turnoSelecionado,
        setTurnoSelecionado,
        alunosFiltrados,
        loading,
        error,
        isAdm,
        isCoor,
        isDire,
        isPsico,
        isAssist, // Certifique-se de que o hook useAlunos atualizado está retornando isso
        salasDisponiveis
    } = useAlunos();

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

    if (loading) return <div className={styles.centeredMessage}>Carregando...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{filtroEspera ? "Alunos em espera..." : "Alunos"}</h2>
                    <div className={styles.container_busca}>
                        <IoMdSearch className={styles.icon_busca} />
                        <input
                            className={styles.busca}
                            type='text'
                            placeholder='Buscar'
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    <div className={styles.botoes}>
                        {(isAdm || isCoor || isDire || isAssist || isPsico) && (
                            <>
                                <select
                                    className={styles.select_sala}
                                    value={turnoSelecionado}
                                    onChange={(e) => setTurnoSelecionado(e.target.value)}
                                >
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="todos">Todos</option>
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
                            <option value="todos">Todos</option>
                            {salasDisponiveis.map((sala) => (
                                <option key={sala} value={sala}>
                                    {sala <= 4 ? `Sala ${sala}` : {'5':'Inglês','6':'Karatê','7':'Informática','8':'Teatro','9':'Ballet','10':'Música','11':'Futsal','12':'Artesanato'}[sala] || `Sala ${sala}`}
                                </option>
                            ))}
                        </select>
                        
                        {/* ALTERAÇÃO AQUI: Oculta botão se for Psico OU Assistente */}
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
                                nome={exporting ? "Exportando..." : "Exportar"}
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
                        {alunosFiltrados.map((aluno) => (
                            <tr key={aluno.matricula} className={styles.tr_body}>
                                <td>{aluno.matricula}</td>
                                <td>{aluno.nome}</td>
                                <td>{aluno.nome_pai || aluno.nome_mae || ''}</td>
                                {(isAdm || isCoor || isDire || isPsico || isAssist) && (
                                    <td className={styles.edicao}>
                                        <MdOutlineModeEdit
                                            className={styles.icon_editar}
                                            onClick={() => handleEditClick(aluno.matricula)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {(isAdm || isCoor || isDire || isAssist) && (
                            <tr className={styles.plus} onClick={() => navigate("/app/aluno/criar")}>
                                <td colSpan="4"><FaPlus className={styles.icon_plus} /></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Alunos;