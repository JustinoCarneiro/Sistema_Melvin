import styles from './AvisosDesativados.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";

function AvisosDesativados(){
    const [busca, setBusca] = useState('');
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchAvisos = async () => {
        setLoading(true);
        try{
            const response = await get.aviso();
            const dados = response.data;

            if(Array.isArray(dados)){
                // Filtra status false (booleano ou string)
                const avisosAtivos = dados.filter(aviso => 
                    aviso.status === false || String(aviso.status) === 'false'
                );
                setAvisos(avisosAtivos);
            }else{
                console.error("6002:Formato inesperado:", response);
                setError("Erro ao carregar dados.");
            }
        }catch(error){
            console.error("6001:Erro na requisição:", error);   
            setError("Não foi possível buscar os avisos.");
        } finally {
            setLoading(false);
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
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                        <h2 className={styles.title}>Avisos Desativados</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por título ou data...'
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
                                <th>Título</th>
                                <th>Data de início</th>
                                <th>Data de término</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                avisosFiltradosBusca.length > 0 ? (
                                    avisosFiltradosBusca.map((aviso) => (
                                        <tr key={aviso.id} className={styles.tr_body}>
                                            <td data-label="Título">{aviso.titulo}</td>
                                            <td data-label="Início">{aviso.data_inicio}</td>
                                            <td data-label="Término">{aviso.data_final}</td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(aviso.id)}
                                                    title="Editar Aviso"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.empty}>Nenhum aviso desativado encontrado.</td>
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

export default AvisosDesativados;