import styles from "./EmbaixadoresApp.module.scss";

import React, { useEffect, useState } from "react";

import { IoMdSearch } from "react-icons/io";
import { LuArrowRightLeft } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import get from "../../../services/requests/get";
import put from "../../../services/requests/put";

function EmbaixadoresApp(){
    const [busca, setBusca] = useState('');
    const [embaixadores, setEmbaixadores] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    const fetchEmbaixadores = async () => {
        try{
            const response = await get.embaixadores();
            const dados = response.data;

            if(Array.isArray(dados)){
                const embaixadoresAtivos = dados.filter(embaixador => embaixador.status === true);
                setEmbaixadores(embaixadoresAtivos);
            }else{
                console.error("6002:Formato inesperado no response:", response);
            }

        } catch(error){
            console.error("6001:Erro ao obter embaixadores!", error);   
            alert('Erro ao obter embaixadores!');
        }
    };

    useEffect(() => {
        fetchEmbaixadores();
    }, []);

    const handleStatusChange = async (id) => {
        try {
            // Encontre o embaixador correspondente
            const embaixador = embaixadores.find(e => e.id === id);
            if (!embaixador) {
                console.error("6006:Embaixador não encontrado:", id);
                return;
            }

            // Atualize o status do embaixador
            const updatedEmbaixador = { ...embaixador, status: !embaixador.status };
            await put.embaixadores(updatedEmbaixador);

            await fetchEmbaixadores();
        } catch (error) {
            console.error("6006:Erro ao alterar o status do embaixador:", error);
            alert('Erro ao alterar o status do embaixador. Tente novamente.');
        }
    };

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

    const handleToggleRow = (id) => {
        setExpandedRows(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const handleResize = () => {
        const sizeE = 1215;
        if (window.innerWidth > sizeE) {
            setExpandedRows({});
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Embaixadores</h2>
                    <div className={styles.container_busca}>
                        <IoMdSearch className={styles.icon_busca}/>
                        <input 
                            className={styles.busca} 
                            type='text'
                            placeholder='Buscar'
                            name='busca'
                            value={busca}
                            onChange={handleBuscaChange}
                        />
                    </div>
                </div>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Nome</th>
                            <th>Instagram</th>
                            <th>Contato</th>
                            <th>Email</th>
                            <th>Alterar status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {embaixadoresFiltradosBusca
                            .map((embaixador) => (
                            <React.Fragment key={embaixador.id}>
                                <tr key={embaixador.id}>
                                    <td>{embaixador.nome}</td>
                                    <td>{embaixador.instagram}</td>
                                    <td>{embaixador.contato}</td>
                                    <td>{embaixador.email}</td>
                                    <td>
                                        <LuArrowRightLeft
                                            onClick={() => handleStatusChange(embaixador.id)}
                                            style={{ fontSize: '1.2rem' }}
                                        />
                                    </td>
                                    <td className={styles.toggleButton} onClick={() => handleToggleRow(embaixador.id)}>
                                        {expandedRows[embaixador.id] ? <FaChevronUp /> : <FaChevronDown />}
                                    </td>
                                </tr>
                                {expandedRows[embaixador.id] && (
                                    <tr className={styles.expanded} key={`${embaixador.id}-expanded`}>
                                        <td colSpan="5" className={styles.row_expanded}>
                                            <div>
                                                Instagram: {embaixador.instagram}
                                            </div>
                                            <div>
                                                Email: {embaixador.email}
                                            </div>
                                            <div>
                                                Contato: {embaixador.contato}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EmbaixadoresApp;