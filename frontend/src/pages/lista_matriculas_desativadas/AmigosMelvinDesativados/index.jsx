import styles from "./AmigosMelvinDesativados.module.scss";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";
import get from "../../../services/requests/get";

function AmigosMelvinDesativados(){
    const [busca, setBusca] = useState('');
    const [amigosmelvin, setAmigosMelvin] = useState([]);
    const [loading, setLoading] = useState(true); // Novo estado
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchAmigosmelvin = async () => {
        setLoading(true);
        try{
            const response = await get.amigosmelvin();
            const dados = response.data;

            if(Array.isArray(dados)){
                // Filtra desativados (trata booleano ou string 'false')
                const amigosmelvinAtivos = dados.filter(amigo => 
                    amigo.status === false || String(amigo.status) === 'false'
                );
                setAmigosMelvin(amigosmelvinAtivos);
            } else {
                console.error("6003:Formato inesperado:", response);
                setError("Erro ao carregar dados.");
            }
        } catch(error){
            console.error("6003:Erro na requisição:", error);   
            setError("Não foi possível buscar a lista.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAmigosmelvin();
    }, []);

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

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                        <h2 className={styles.title}>Amigos Melvin Desativados</h2>
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
                                                    title="Editar"
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

export default AmigosMelvinDesativados;