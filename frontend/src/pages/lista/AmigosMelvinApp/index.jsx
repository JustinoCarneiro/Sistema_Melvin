import styles from "./AmigosMelvinApp.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaGift } from "react-icons/fa";
import amigoMelvinService from "../../../services/amigoMelvinService";
import { usePermissions } from "../../../hooks/usePermissions";

function AmigosMelvinApp({ modoDesativados = false }){
    const { hasPermission, isAdm } = usePermissions();
    const podeGerenciar = hasPermission('GERENCIAR_AMIGOS');
    const [busca, setBusca] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [amigosmelvin, setAmigosMelvin] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchAmigosmelvin = async () => {
        setLoading(true);
        try{
            const response = await amigoMelvinService.list();
            const dados = response.data;

            if(Array.isArray(dados)){
                setAmigosMelvin(dados);
            } else {
                console.error("6002:Formato inesperado no response:", response);
                setError("Erro ao carregar dados.");
            }
        } catch(error){
            console.error("6001:Erro ao obter amigosmelvin!", error);   
            setError("Não foi possível buscar a lista de amigos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAmigosmelvin();
    }, [modoDesativados]); 

    const handleBuscaChange = (e) => setBusca(e.target.value);
    const handleStatusChange = (e) => setStatusFilter(e.target.value);

    const amigosmelvinFiltrados = amigosmelvin.filter((amigomelvin) => {
        const termoBusca = busca.toLowerCase();
        const matchBusca = (amigomelvin.nome || '').toLowerCase().includes(termoBusca) ||
                           (amigomelvin.email || '').toLowerCase().includes(termoBusca);
        const matchStatus = statusFilter ? amigomelvin.status === statusFilter : true;
        return matchBusca && matchStatus;
    });

    const handleEditClick = (id) => {
        navigate(`/app/amigomelvin/editar/${id}`);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'ACTIVE': return <span style={{ background: '#2e7d32', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Ativo</span>;
            case 'PENDING': return <span style={{ background: '#fbc02d', color: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Pendente</span>;
            case 'CANCELLED': 
            case 'INACTIVE': return <span style={{ background: '#c62828', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Inativo/Cancelado</span>;
            default: return <span style={{ background: '#757575', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{status || 'Desconhecido'}</span>;
        }
    };

    const isRewardEligible = (meses) => {
        return meses === 3 || meses === 6 || meses === 12;
    };

    const tituloPagina = "Gestão Amigos do Melvin";

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 className={styles.title}>{tituloPagina}</h2>
                    </div>
                    
                    <div className={styles.filters} style={{ display: 'flex', gap: '1rem' }}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar por nome ou email...'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        <select className={styles.busca} value={statusFilter} onChange={handleStatusChange} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">Todos os Status</option>
                            <option value="ACTIVE">Ativo</option>
                            <option value="PENDING">Pendente</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>
                </div>

                {error && <div style={{color: '#C70039', textAlign: 'center', padding: '0.5rem'}}>{error}</div>}
                
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr className={styles.tr_head}>
                                <th>Nome</th>
                                <th>Valor (R$)</th>
                                <th>Status</th>
                                <th>Meses Ativos</th>
                                <th>Data Início</th>
                                <th className={styles.edicao}>Ações</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                amigosmelvinFiltrados.length > 0 ? (
                                    amigosmelvinFiltrados.map((amigomelvin) => (
                                        <tr key={amigomelvin.id} className={styles.tr_body}>
                                            <td data-label="Nome">
                                                {amigomelvin.nome}
                                                {isRewardEligible(amigomelvin.mesesContribuindo) && (
                                                    <FaGift style={{ color: '#F29F05', marginLeft: '0.5rem' }} title="Elegível para recompensa!" />
                                                )}
                                            </td>
                                            <td data-label="Valor">
                                                {amigomelvin.valorMensal ? amigomelvin.valorMensal.toFixed(2) : 'N/A'}
                                            </td>
                                            <td data-label="Status">
                                                {getStatusBadge(amigomelvin.status)}
                                            </td>
                                            <td data-label="Meses">
                                                {amigomelvin.mesesContribuindo || 0}
                                            </td>
                                            <td data-label="Data">
                                                {amigomelvin.dataInicio ? new Date(amigomelvin.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}
                                            </td>
                                            <td className={styles.edicao} data-label="Ações">
                                                {(isAdm || podeGerenciar) && (
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                                        <MdOutlineModeEdit 
                                                            className={styles.icon_editar}
                                                            onClick={()=>handleEditClick(amigomelvin.id)}
                                                            title="Editar Amigo"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.empty}>Nenhum registro encontrado.</td>
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

export default AmigosMelvinApp;