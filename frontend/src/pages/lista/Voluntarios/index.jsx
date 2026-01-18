import styles from './Voluntarios.module.scss';
import { useNavigate } from 'react-router-dom';
import { useVoluntarios } from '../../../hooks/useVoluntarios';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';

function Voluntarios() {
    // Removemos a prop 'tipo', pois agora a página controla isso internamente
    const navigate = useNavigate();

    const {
        busca, setBusca,
        filtroEspera, setFiltroEspera,
        filtroFuncao, setFiltroFuncao, // Pegamos os novos controles do hook
        voluntariosFiltrados,
        loading, error, isAdm
    } = useVoluntarios();

    const handleEditClick = (matricula) => {
        // Redireciona para a rota genérica de edição
        navigate(`/app/voluntario/editar/${matricula}`);
    };

    const handleCreateClick = () => {
        // Redireciona para a rota genérica de criação
        navigate(`/app/voluntario/criar`);
    };

    // Função inteligente para decidir para onde o botão "Frequências" vai
    const handleFrequenciasClick = () => {
        // Mapeia o valor do select (singular) para a rota (plural)
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
    
    // Formata o texto da função para a tabela (ex: "assistente" -> "Assistente Social")
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
                        {filtroEspera ? "Aprovações Pendentes" : "Voluntários e Equipe"}
                    </h2>
                    
                    <div className={styles.controls}>
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

                        {/* Dropdown de Filtro de Função */}
                        <select 
                            className={styles.selectFilter}
                            value={filtroFuncao}
                            onChange={(e) => setFiltroFuncao(e.target.value)}
                        >
                            <option value="todos">Todos</option>
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
                    </div>

                    <div className={styles.botoes}>
                        <Botao
                            nome={filtroEspera ? "Mostrar Ativos" : "Em espera"}
                            corFundo="#F29F05"
                            corBorda="#8A6F3E"
                            type="button"
                            onClick={() => setFiltroEspera(!filtroEspera)}
                        />
                        
                        {/* Botão Frequências: Só aparece se selecionar um cargo específico e não estiver vendo pendentes */}
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

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Função</th> {/* Nova Coluna */}
                                <th>Email</th>
                                {isAdm && <th className={styles.edicao}>Edição</th>}
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {voluntariosFiltrados.length > 0 ? (
                                voluntariosFiltrados.map((voluntario) => (
                                    <tr key={voluntario.matricula} className={styles.tr_body}>
                                        <td>{voluntario.matricula}</td>
                                        <td className={styles.nomeAluno}>{voluntario.nome}</td> {/* Ajuste classe se necessário */}
                                        <td>{formatFuncao(voluntario.funcao)}</td>
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
                                ))
                            ) : (
                                <tr><td colSpan="5" className={styles.empty}>Nenhum voluntário encontrado.</td></tr>
                            )}
                            
                            {/* Botão Novo Genérico */}
                            {isAdm && !filtroEspera && (
                                <tr className={styles.plus} onClick={handleCreateClick}>
                                    <td colSpan="5"><FaPlus className={styles.icon_plus} /></td>
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