import styles from './Voluntarios.module.scss';
import { useNavigate } from 'react-router-dom';
import { useVoluntarios } from '../../../hooks/useVoluntarios';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';

function Voluntarios() {
    const navigate = useNavigate();

    const {
        busca, setBusca,
        filtroEspera, setFiltroEspera,
        filtroFuncao, setFiltroFuncao,
        voluntariosFiltrados,
        loading, error, isAdm
    } = useVoluntarios();

    const handleEditClick = (matricula) => {
        navigate(`/app/voluntario/editar/${matricula}`);
    };

    const handleCreateClick = () => {
        navigate(`/app/voluntario/criar`);
    };

    const handleFrequenciasClick = () => {
        const rotas = {
            coordenador: "coordenadores",
            professor: "professores",
            auxiliar: "auxiliares",
            cozinheiro: "cozinheiros",
            diretor: "diretores",
            marketing: "marketing",
            administrador: "administradores",
            zelador: "zeladores",
            psicologo: "psicologos",
            assistente: "assistentes"
        };

        const rotaDestino = rotas[filtroFuncao];
        if (rotaDestino) {
            navigate(`/app/voluntario/frequencias/${rotaDestino}`);
        }
    };
    
    const formatFuncao = (funcao) => {
        if (!funcao) return '-';
        if (funcao === 'assistente') return 'Assistente Social';
        return funcao.charAt(0).toUpperCase() + funcao.slice(1);
    };

    if (loading) return <div className={styles.centeredMessage}>Carregando...</div>;
    if (error) return <div className={`${styles.centeredMessage} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {filtroEspera ? "Aprovações Pendentes" : "Voluntários"}
                    </h2>
                    
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

                        <div className={styles.botoes}>
                            <select 
                                className={styles.select_sala}
                                value={filtroFuncao}
                                onChange={(e) => setFiltroFuncao(e.target.value)}
                            >
                                <option value="todos">Todas Funções</option>
                                <option value="professor">Professores</option>
                                <option value="coordenador">Coordenadores</option>
                                <option value="auxiliar">Auxiliares</option>
                                <option value="diretor">Diretoria</option>
                                <option value="administrador">Administração</option>
                                <option value="marketing">Marketing</option>
                                <option value="cozinheiro">Cozinha</option>
                                <option value="zelador">Zeladoria</option>
                                <option value="psicologo">Psicólogos</option>
                                <option value="assistente">Assistentes Sociais</option>
                            </select>

                            <Botao
                                nome={filtroEspera ? "Mostrar Ativos" : "Em espera"}
                                corFundo="#F29F05"
                                corBorda="#8A6F3E"
                                type="button"
                                onClick={() => setFiltroEspera(!filtroEspera)}
                            />
                            
                            {!filtroEspera && filtroFuncao !== 'todos' && (
                                <Botao
                                    nome="Frequências"
                                    corFundo="#7EA629"
                                    corBorda="#58751A"
                                    type="button"
                                    onClick={handleFrequenciasClick}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Função</th>
                                <th>Email</th>
                                {isAdm && <th className={styles.edicao}>Edição</th>}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {voluntariosFiltrados.length > 0 ? (
                                voluntariosFiltrados.map((voluntario) => (
                                    <tr key={voluntario.matricula} className={styles.tr_body}>
                                        <td data-label="Matrícula">{voluntario.matricula}</td>
                                        <td data-label="Nome">{voluntario.nome}</td>
                                        <td data-label="Função">{formatFuncao(voluntario.funcao)}</td>
                                        <td data-label="Email">{voluntario.email}</td>
                                        {isAdm && (
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit
                                                    className={styles.icon_editar}
                                                    onClick={() => handleEditClick(voluntario.matricula)}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className={styles.empty}>Nenhum voluntário encontrado.</td></tr>
                            )}
                            
                            {!loading && isAdm && !filtroEspera && (
                                <tr className={styles.plus} onClick={handleCreateClick}>
                                    <td colSpan="5"><FaPlus className={styles.icon_plus} /> Adicionar novo integrante</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Voluntarios;