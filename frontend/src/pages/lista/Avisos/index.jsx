import styles from './Avisos.module.scss';
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";

function Avisos({ modoDesativados = false }){
    const [busca, setBusca] = useState('');
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchAvisos = async () => {
        setLoading(true);
        setError(null);
        try{
            const response = await get.aviso();
            const dados = response.data;

            if(Array.isArray(dados)){
                // Filtra com base no modo: 'false' para desativados, 'true' para ativos
                const avisosFiltrados = dados.filter(aviso => 
                    String(aviso.status) === (modoDesativados ? 'false' : 'true')
                );
                setAvisos(avisosFiltrados);
            } else {
                console.error("6002:Formato inesperado no response:", response);
                setError("Erro ao carregar dados.");
            }
        } catch(error){
            console.error("6001:Erro ao obter avisos!", error);   
            setError("Não foi possível obter a lista de avisos.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAvisos();
    }, [modoDesativados]); // Recarrega se o modo mudar

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

    // Define o título da página
    const tituloPagina = modoDesativados ? "Avisos Desativados" : "Avisos";

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    {/* Grupo de Título com botão de voltar condicional */}
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
                                            <td data-label="Data Início">{aviso.data_inicio}</td>
                                            <td data-label="Data Término">{aviso.data_final}</td>
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
                                        <td colSpan="4" className={styles.empty}>
                                            {modoDesativados ? "Nenhum aviso desativado encontrado." : "Nenhum aviso encontrado."}
                                        </td>
                                    </tr>
                                )
                            )}
                            
                            {/* Botão Criar Novo (Apenas se NÃO for desativados e NÃO estiver carregando) */}
                            {!loading && !modoDesativados && (
                                <tr className={styles.plus} onClick={()=>navigate(`/app/avisos/criar`)}>
                                    <td colSpan="4"><FaPlus className={styles.icon_plus}/> Criar novo aviso</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Avisos;