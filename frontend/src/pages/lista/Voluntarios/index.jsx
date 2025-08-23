import styles from './Voluntarios.module.scss';
import { useNavigate } from 'react-router-dom';
import { useVoluntarios } from '../../../hooks/useVoluntarios'; // 1. Importe o hook

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';

function Voluntarios({ tipo }) {
    const navigate = useNavigate();

    const {
        busca,
        setBusca,
        filtroEspera,
        setFiltroEspera,
        voluntariosFiltrados,
        loading,
        error,
        isAdm,
        title,
        prox_rota
    } = useVoluntarios(tipo);

    const handleEditClick = (matricula) => {
        navigate(`/app/voluntario/${tipo}/editar/${matricula}`);
    };

    const handleFrequenciasClick = () => {
        navigate(`/app/voluntario/frequencias/${prox_rota}`);
    };
    
    if (loading) return <div className={styles.centeredMessage}>Carregando...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{filtroEspera ? `${title} em espera...` : title}</h2>
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
                        <Botao
                            nome={filtroEspera ? "Mostrar Ativos" : "Em espera"}
                            corFundo="#F29F05"
                            corBorda="#8A6F3E"
                            type="button"
                            onClick={() => setFiltroEspera(!filtroEspera)}
                        />
                        <Botao
                            nome="Frequências"
                            corFundo="#7EA629"
                            corBorda="#58751A"
                            type="button"
                            onClick={handleFrequenciasClick}
                        />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr_head}>
                            <th>Matrícula</th>
                            <th>Nome</th>
                            <th>Email</th>
                            {isAdm && <th className={styles.edicao}>Edição</th>}
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {voluntariosFiltrados.map((voluntario) => (
                            <tr key={voluntario.matricula} className={styles.tr_body}>
                                <td>{voluntario.matricula}</td>
                                <td>{voluntario.nome}</td>
                                <td>{voluntario.email}</td>
                                {isAdm && (
                                    <td className={styles.edicao}>
                                        <MdOutlineModeEdit
                                            className={styles.icon_editar}
                                            onClick={() => handleEditClick(voluntario.matricula)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {isAdm && (
                            <tr className={styles.plus} onClick={() => navigate(`/app/voluntario/criar/${tipo}`)}>
                                <td colSpan="4"><FaPlus className={styles.icon_plus} /></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Voluntarios;