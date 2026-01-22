import styles from './Voluntarios.module.scss';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook original (usado apenas no modo ativos)
import { useVoluntarios } from '../../../hooks/useVoluntarios';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';
import get from '../../../services/requests/get';

function Voluntarios({ modoDesativados = false }) {
    const navigate = useNavigate();

    // --- ESTADOS PARA MODO "DESATIVADOS" ---
    const [desativados, setDesativados] = useState([]);
    const [loadingDesativados, setLoadingDesativados] = useState(false);
    const [errorDesativados, setErrorDesativados] = useState(null);
    const [buscaDesativados, setBuscaDesativados] = useState('');

    // --- HOOK PARA MODO "ATIVOS" ---
    const {
        busca, setBusca,
        filtroEspera, setFiltroEspera,
        filtroFuncao, setFiltroFuncao,
        voluntariosFiltrados: ativosFiltrados,
        loading: loadingAtivos,
        error: errorAtivos,
        isAdm
    } = useVoluntarios();

    // --- EFEITO: BUSCAR DESATIVADOS ---
    useEffect(() => {
        if (modoDesativados) {
            setLoadingDesativados(true);
            const fetchDesativados = async () => {
                try {
                    // Supondo que get.voluntarios retorna todos, filtramos por status
                    const response = await get.voluntario(); 
                    const dados = response.data;
                    if (Array.isArray(dados)) {
                        setDesativados(dados.filter(v => String(v.status) === 'false'));
                    }
                } catch (err) {
                    console.error("Erro ao buscar voluntários desativados:", err);
                    setErrorDesativados("Não foi possível carregar os voluntários desativados.");
                } finally {
                    setLoadingDesativados(false);
                }
            };
            fetchDesativados();
        }
    }, [modoDesativados]);

    // --- FILTRAGEM LOCAL (DESATIVADOS) ---
    const desativadosFiltrados = useMemo(() => {
        if (!modoDesativados) return [];
        const termo = buscaDesativados.toLowerCase();
        return desativados.filter(v => 
            v.nome.toLowerCase().includes(termo) ||
            v.matricula.toString().includes(termo) ||
            (v.email || '').toLowerCase().includes(termo)
        );
    }, [desativados, buscaDesativados, modoDesativados]);

    // --- SELEÇÃO DE DADOS PARA EXIBIÇÃO ---
    const listaParaExibir = modoDesativados ? desativadosFiltrados : ativosFiltrados;
    const isLoading = modoDesativados ? loadingDesativados : loadingAtivos;
    const errorMessage = modoDesativados ? errorDesativados : errorAtivos;

    // --- MANIPULADORES ---
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

    // --- TÍTULO DINÂMICO ---
    let tituloPagina = "Voluntários";
    if (modoDesativados) tituloPagina = "Voluntários Desativados";
    else if (filtroEspera) tituloPagina = "Aprovações Pendentes";

    return (
        <div className={styles.body}>
            <div className={styles.container}>
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
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca} />
                            <input
                                className={styles.busca}
                                type='text'
                                placeholder='Buscar por nome...'
                                value={modoDesativados ? buscaDesativados : busca}
                                onChange={(e) => modoDesativados ? setBuscaDesativados(e.target.value) : setBusca(e.target.value)}
                            />
                        </div>

                        {/* Botões extras: Apenas no modo ATIVOS */}
                        {!modoDesativados && (
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
                        )}
                    </div>
                </div>
                
                {isLoading && <div className={styles.centeredMessage}>Carregando...</div>}
                {errorMessage && <div className={`${styles.centeredMessage} ${styles.error}`}>{errorMessage}</div>}

                {!isLoading && !errorMessage && (
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
                                {listaParaExibir.length > 0 ? (
                                    listaParaExibir.map((voluntario) => (
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
                                    <tr>
                                        <td colSpan="5" className={styles.empty}>
                                            {modoDesativados ? "Nenhum voluntário desativado encontrado." : "Nenhum voluntário encontrado."}
                                        </td>
                                    </tr>
                                )}
                                
                                {/* Botão Adicionar (Apenas modo Ativos e sem filtro de espera) */}
                                {!modoDesativados && isAdm && !filtroEspera && (
                                    <tr className={styles.plus} onClick={handleCreateClick}>
                                        <td colSpan="5"><FaPlus className={styles.icon_plus} /> Adicionar novo integrante</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Voluntarios;