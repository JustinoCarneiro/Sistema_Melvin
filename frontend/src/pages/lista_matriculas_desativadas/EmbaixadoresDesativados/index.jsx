import styles from "./EmbaixadoresDesativados.module.scss";

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch,IoMdArrowRoundBack} from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";

function EmbaixadoresApp(){
    const [busca, setBusca] = useState('');
    const [embaixadores, setEmbaixadores] = useState([]);
    const navigate = useNavigate();

    const fetchEmbaixadores = async () => {
        try {
            const response = await get.embaixadores();
            const dados = response.data;

            if (Array.isArray(dados)) {
                const embaixadoresDesativos = dados.filter(embaixador => embaixador.status === false);
                setEmbaixadores(embaixadoresDesativos);
            } else {
                console.error("6003: Formato inesperado no response:", response);
            }

        } catch (error) {
            console.error("6003: Erro ao obter embaixadores!", error);
            alert('Erro ao obter embaixadores!');
        }
    };

    useEffect(() => {
        fetchEmbaixadores();
    }, []);

    {/*const handleStatusChange = async (id) => {
        try {
            // Encontre o embaixador correspondente
            const embaixador = embaixadores.find(e => e.id === id);
            if (!embaixador) {
                console.error("6006: Embaixador não encontrado:", id);
                return;
            }

            // Atualize o status do embaixador
            const updatedEmbaixador = { ...embaixador, status: !embaixador.status };
            await put.embaixadores(updatedEmbaixador);

            // Refetch the embaixadores after updating the status
            await fetchEmbaixadores();
        } catch (error) {
            console.error("6006: Erro ao alterar o status do embaixador:", error);
            alert('Erro ao alterar o status do embaixador. Tente novamente.');
        }
    };*/}

    {/*const handleContatadoChange = async (id) => {
        try {
            // Encontre o embaixador correspondente
            const embaixador = embaixadores.find(e => e.id === id);
            if (!embaixador) {
                console.error("6007: Embaixador não encontrado:", id);
                return;
            }

            // Atualize o atributo contatado do embaixador
            const updatedEmbaixador = { ...embaixador, contatado: !embaixador.contatado };
            await put.embaixadores(updatedEmbaixador);

            // Atualize a lista de embaixadores no estado
            setEmbaixadores(prevEmbaixadores =>
                prevEmbaixadores.map(e => (e.id === id ? updatedEmbaixador : e))
            );
        } catch (error) {
            console.error("6007: Erro ao alterar o atributo contatado do embaixador:", error);
            alert('Erro ao alterar o atributo contatado do embaixador. Tente novamente.');
        }
    };*/}

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
            <div className={styles.linha_voltar}>
                <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Embaixadores desativados</h2>
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
                            <th className={styles.edicao}>Edição</th>
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
                                    <td className={styles.edicao}>
                                        <MdOutlineModeEdit 
                                            className={styles.icon_editar}
                                            onClick={()=>handleEditClick(embaixador.id)}
                                        />
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EmbaixadoresApp;