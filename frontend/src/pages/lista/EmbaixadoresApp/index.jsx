import styles from "./EmbaixadoresApp.module.scss";

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";

function EmbaixadoresApp(){
    const [busca, setBusca] = useState('');
    const [embaixadores, setEmbaixadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchEmbaixadores = async () => {
        setLoading(true);
        try{
            const response = await get.embaixadores();
            const dados = response.data;

            if(Array.isArray(dados)){
                const embaixadoresAtivos = dados.filter(embaixador => embaixador.status === true);
                setEmbaixadores(embaixadoresAtivos);
            }else{
                console.error("6002:Formato inesperado no response:", response);
                setError("Erro ao carregar dados.");
            }

        } catch(error){
            console.error("6001:Erro ao obter embaixadores!", error);   
            setError("Não foi possível buscar a lista de embaixadores.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmbaixadores();
    }, []);

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const embaixadoresFiltradosBusca = embaixadores.filter((embaixador) => {
        const termoBusca = busca.toLowerCase();
        return (
            embaixador.contato.includes(termoBusca) ||
            (embaixador.instagram || '').toLowerCase().includes(termoBusca) ||
            embaixador.nome.toLowerCase().includes(termoBusca)   ||
            (embaixador.email || '').toLowerCase().includes(termoBusca)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/embaixador/editar/${id}`);
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Embaixadores</h2>
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome, insta ou contato...'
                                name='busca'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Nome</th>
                                <th>Instagram</th>
                                <th>Contato</th>
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
                                embaixadoresFiltradosBusca.length > 0 ? (
                                    embaixadoresFiltradosBusca.map((embaixador) => (
                                        <tr key={embaixador.id} className={styles.tr_body}>
                                            <td data-label="Nome">{embaixador.nome}</td>
                                            <td data-label="Instagram">{embaixador.instagram}</td>
                                            <td data-label="Contato">{embaixador.contato}</td>
                                            <td data-label="Email">{embaixador.email}</td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(embaixador.id)}
                                                    title="Editar Embaixador"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className={styles.empty}>Nenhum embaixador encontrado.</td>
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

export default EmbaixadoresApp;