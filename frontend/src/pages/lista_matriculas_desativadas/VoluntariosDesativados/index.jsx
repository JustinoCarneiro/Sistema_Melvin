import styles from './VoluntariosDesativados.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MdOutlineModeEdit } from "react-icons/md";
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import get from '../../../services/requests/get';

function VoluntariosDesativados(){
    const [busca, setBusca] = useState('');
    const [voluntarios, setVoluntarios] = useState([]);
    const [funcao, setFuncao] = useState('todos'); // Padrão 'todos'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVoluntarios = async () => {
            setLoading(true);
            try {
                const response = await get.voluntario();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    // Filtra status false (string ou bool)
                    const voluntariosDesativados = objetoDados.filter(voluntario => 
                        String(voluntario.status) === 'false' || voluntario.status === false
                    );
                    setVoluntarios(voluntariosDesativados);
                } else {
                    console.error("5015:Formato inesperado:", response);
                    setError("Erro ao carregar dados.");
                }
            } catch (error) {
                console.error("5016:Erro na requisição:", error);
                setError("Não foi possível buscar os voluntários.");
            } finally {
                setLoading(false);
            }
        };

        fetchVoluntarios();
    }, []);

    const handleEditClick = (matricula) => {
        // Redireciona para a edição geral, ou específica se necessário
        navigate(`/app/voluntario/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const handleFuncaoChange = (e) => {
        setFuncao(e.target.value);
    };

    // Formata o nome da função para exibição (Primeira letra maiúscula)
    const formatFuncao = (func) => {
        if(!func) return '-';
        return func.charAt(0).toUpperCase() + func.slice(1);
    }

    const voluntariosFiltrados = voluntarios.filter((voluntario) => {
        const termoBusca = busca.toLowerCase();
        const matchBusca = (
            voluntario.matricula.toString().includes(termoBusca) ||
            voluntario.nome.toLowerCase().includes(termoBusca)   ||
            (voluntario.email || '').toLowerCase().includes(termoBusca)
        );

        const matchFuncao = funcao === 'todos' || voluntario.funcao === funcao;

        return matchBusca && matchFuncao;
    });

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                        <h2 className={styles.title}>Voluntários Desativados</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome ou matrícula...'
                                name='busca'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        <select className={styles.select_sala} value={funcao} onChange={handleFuncaoChange}>
                            <option value="todos">Todas Funções</option>
                            <option value="coordenador">Coordenação</option>
                            <option value="professor">Docência</option>
                            <option value="auxiliar">Auxílio</option>
                            <option value="cozinheiro">Cozinha</option>
                            <option value="diretor">Diretoria</option>
                            <option value="marketing">Marketing</option>
                            <option value="zelador">Zeladoria</option>
                            <option value="administrador">Administração</option>
                            <option value="psicologo">Psicologia</option>
                            <option value="assistente">Assistência Social</option>
                        </select>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th>Função</th>
                                <th>Email</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                voluntariosFiltrados.length > 0 ? (
                                    voluntariosFiltrados.map((voluntario) => (
                                        <tr key={voluntario.matricula} className={styles.tr_body}>
                                            <td data-label="Matrícula">{voluntario.matricula}</td>
                                            <td data-label="Nome">{voluntario.nome}</td>
                                            <td data-label="Função">{formatFuncao(voluntario.funcao)}</td>
                                            <td data-label="Email">{voluntario.email}</td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(voluntario.matricula)}
                                                    title="Editar Voluntário"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styles.empty}>Nenhum voluntário desativado encontrado.</td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default VoluntariosDesativados;