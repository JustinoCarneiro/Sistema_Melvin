import styles from './Cestas.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from '../../../services/requests/get';

function Cestas(){
    const [busca, setBusca] = useState('');
    const [cestas, setCestas] = useState([]);
    const navigate = useNavigate();
    const [data, setData] = useState("todos");
    const [loading, setLoading] = useState(true); // Novo estado
    const [error, setError] = useState(null); // Estado para erros

    const fetchCestas = async () => {
        setLoading(true);
        try{
            const response = await get.cestas();
            const dados = response.data;

            if(Array.isArray(dados)){
                setCestas(dados);
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
    }, []);

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const cestasFiltradosBusca = cestas.filter((cesta) => {
        const termoBusca = busca.toLowerCase();
        const dataEntrega = new Date(cesta.dataEntrega).toISOString().split('T')[0];
        return (
            (cesta.contato.includes(termoBusca) ||
            cesta.nome.toLowerCase().includes(termoBusca)) &&
            (data === "todos" || dataEntrega === data)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/cestas/editar/${id}`);
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Cestas Básicas</h2>
                    
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
                            <button className={styles.botao} onClick={()=>navigate("/app/cestas/criar")}>
                                Adicionar
                            </button>
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
                                                {new Date(cesta.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR')}
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
                                        <td colSpan="4" className={styles.empty}>Nenhum registro encontrado.</td>
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

export default Cestas;