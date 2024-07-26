import styles from './AvisosDesativados.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";
function AvisosDesativados(){
    const [busca, setBusca] = useState('');
    const [avisos, setAvisos] = useState([]);
    const navigate = useNavigate();

    const fetchAvisos = async () => {
        try{
            const response = await get.aviso();
            const dados = response.data;

            if(Array.isArray(dados)){
                const avisosAtivos = dados.filter(aviso => aviso.status === false);
                setAvisos(avisosAtivos);
            }else{
                console.error("6002:Formato inesperado no response:", response);
            }
        }catch(error){
            console.error("6001:Erro ao obter avisos!", error);   
            alert('Erro ao obter avisos!');
        }
    }

    useEffect(() => {
        fetchAvisos();
    }, []);

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const avisosFiltradosBusca = avisos.filter((aviso) => {
        const termoBusca = busca.toLowerCase();
        return (
            (aviso.titulo || '').toLowerCase().includes(termoBusca) ||
            (aviso.data_inicio || '').includes(termoBusca) ||
            (aviso.data_final || '').includes(termoBusca)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/avisos/editar/${id}`);
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Avisos</h2>
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
                            <th>Título</th>
                            <th>Data de início</th>
                            <th>Data de término</th>
                            <th className={styles.edicao}>Edição</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                    {avisosFiltradosBusca.map((aviso) => (
                        <tr key={aviso.id}>
                            <td>{aviso.titulo}</td>
                            <td>{aviso.data_inicio}</td>
                            <td>{aviso.data_final}</td>
                            <td className={styles.edicao}>
                                <MdOutlineModeEdit 
                                    className={styles.icon_editar}
                                    onClick={()=>handleEditClick(aviso.id)}
                                />
                            </td>
                        </tr>
                    ))}
                        <tr className={styles.plus} onClick={()=>navigate(`/app/avisos/criar`)}>
                            <td colSpan="4"><FaPlus className={styles.icon_plus}/></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AvisosDesativados;