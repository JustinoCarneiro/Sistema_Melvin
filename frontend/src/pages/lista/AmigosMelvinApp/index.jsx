import styles from "./AmigosMelvinApp.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import get from "../../../services/requests/get";

function AmigosMelvinApp({ modoDesativados = false }){
    const [busca, setBusca] = useState('');
    const [amigosmelvin, setAmigosMelvin] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchAmigosmelvin = async () => {
        setLoading(true);
        try{
            const response = await get.amigosmelvin();
            const dados = response.data;

            if(Array.isArray(dados)){
                // Filtra com base na prop: se modoDesativados for true, busca status 'false', senão 'true'
                const listaFiltrada = dados.filter(amigomelvin => 
                    String(amigomelvin.status) === (modoDesativados ? 'false' : 'true')
                );
                setAmigosMelvin(listaFiltrada);
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
    }, [modoDesativados]); // Recarrega se o modo mudar

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const amigosmelvinFiltradosBusca = amigosmelvin.filter((amigomelvin) => {
        const termoBusca = busca.toLowerCase();
        return (
            amigomelvin.contato.includes(termoBusca) ||
            amigomelvin.nome.toLowerCase().includes(termoBusca) ||
            (amigomelvin.email || '').toLowerCase().includes(termoBusca)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/amigomelvin/editar/${id}`);
    };

    // Define o título com base no modo
    const tituloPagina = modoDesativados ? "Amigos Desativados" : "Amigos do Melvin";

    return(
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
                                placeholder='Buscar por nome, contato ou email...'
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
                                <th>Contato</th>
                                <th>Email</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className={styles.empty}>Carregando...</td>
                                </tr>
                            ) : (
                                amigosmelvinFiltradosBusca.length > 0 ? (
                                    amigosmelvinFiltradosBusca.map((amigomelvin) => (
                                        <tr key={amigomelvin.id} className={styles.tr_body}>
                                            <td data-label="Nome">{amigomelvin.nome}</td>
                                            <td data-label="Contato">{amigomelvin.contato}</td>
                                            <td data-label="Email">{amigomelvin.email}</td>
                                            <td className={styles.edicao} data-label="Ações">
                                                <MdOutlineModeEdit 
                                                    className={styles.icon_editar}
                                                    onClick={()=>handleEditClick(amigomelvin.id)}
                                                    title="Editar Amigo"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.empty}>
                                            {modoDesativados ? "Nenhum amigo desativado encontrado." : "Nenhum registro encontrado."}
                                        </td>
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