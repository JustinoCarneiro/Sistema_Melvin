import styles from './Cestas.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6"; // Importando ícone de plus para padronizar

import get from '../../../services/requests/get';

function Cestas({ modoDesativados = false }){
    const [busca, setBusca] = useState('');
    const [cestas, setCestas] = useState([]);
    const navigate = useNavigate();
    const [data, setData] = useState("todos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCestas = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await get.cestas();
            const dados = response.data;

            if(Array.isArray(dados)){
                // Filtra baseado no modo (Ativos vs Desativados)
                // Usando String() para garantir compatibilidade se o backend retornar boolean ou string
                const cestasFiltradas = dados.filter(cesta => 
                    String(cesta.status) === (modoDesativados ? 'false' : 'true')
                );
                setCestas(cestasFiltradas);
            }else{
                console.error("6003:Formato inesperado no response:", response);
                setError("Erro ao carregar dados.");
            }

        } catch(error){
            console.error("6003:Erro ao obter cestas!", error);   
            setError("Não foi possível buscar as cestas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCestas();
    }, [modoDesativados]); // Recarrega se o modo mudar

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const cestasFiltradosBusca = cestas.filter((cesta) => {
        const termoBusca = busca.toLowerCase();
        
        // Tratamento seguro para data
        let dataEntrega = '';
        if (cesta.dataEntrega) {
            dataEntrega = new Date(cesta.dataEntrega).toISOString().split('T')[0];
        }

        return (
            (cesta.contato.includes(termoBusca) ||
            cesta.nome.toLowerCase().includes(termoBusca)) &&
            (data === "todos" || dataEntrega === data)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/cestas/editar/${id}`);
    };

    // Título dinâmico
    const tituloPagina = modoDesativados ? "Cestas Entregues (Arquivo)" : "Cestas Básicas";

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    {/* Grupo de Título e Voltar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {modoDesativados && (
                            <IoMdArrowRoundBack 
                                className={styles.voltar} 
                                onClick={() => navigate(-1)} 
                                title="Voltar"
                                style={{ fontSize: '1.8rem', cursor: 'pointer', color: '#666' }}
                            />
                        )}
                        <h2 className={styles.title}>{tituloPagina}</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome ou contato...'
                                name='busca'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        
                        <div className={styles.botoes}>
                            {/* Filtro de Data */}
                            <select
                                className={styles.select_sala}
                                name="filtroData"
                                value={data === "todos" ? "todos" : "especifica"}
                                onChange={(e) => {
                                    setData(e.target.value === "todos" ? "todos" : new Date().toISOString().split('T')[0]);
                                }}
                            >
                                <option value="todos">Todas Datas</option>
                                <option value="especifica">Data Específica</option>
                            </select>
                            
                            {data !== "todos" && (
                                <input
                                    className={styles.select_sala}
                                    type="date"
                                    name="data"
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Nome</th>
                                <th>Responsável</th>
                                <th>Data de Entrega</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                cestasFiltradosBusca.length > 0 ? (
                                    cestasFiltradosBusca.map((cesta) => (
                                        <tr key={cesta.id} className={styles.tr_body}>
                                            <td data-label="Nome">{cesta.nome}</td>
                                            <td data-label="Responsável">{cesta.responsavel}</td>
                                            <td data-label="Data Entrega">
                                                {cesta.dataEntrega 
                                                    ? new Date(cesta.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR') 
                                                    : '-'}
                                            </td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(cesta.id)}
                                                    title="Editar Cesta"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.empty}>
                                            {modoDesativados ? "Nenhum registro antigo encontrado." : "Nenhum registro encontrado."}
                                        </td>
                                    </tr>
                                )
                            )}

                            {/* Botão Adicionar: Apenas se NÃO for modo desativados e NÃO estiver carregando */}
                            {!loading && !modoDesativados && (
                                <tr className={styles.plus} onClick={()=>navigate("/app/cestas/criar")}>
                                    <td colSpan="4"><FaPlus className={styles.icon_plus}/> Adicionar entrega</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Cestas;