import styles from "./AmigosMelvinApp.module.scss";

import { useEffect, useState } from "react";

import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from "../../../services/requests/get";

function AmigosMelvinApp(){
    const [busca, setBusca] = useState('');
    const [amigosmelvin, setAmigosMelvin] = useState([]);
    const navigate = useNavigate();

    const fetchAmigosmelvin = async () => {
        try{
            const response = await get.amigosmelvin();
            const dados = response.data;

            if(Array.isArray(dados)){
                const amigosmelvinAtivos = dados.filter(amigomelvin => amigomelvin.status === true);
                setAmigosMelvin(amigosmelvinAtivos);
            }else{
                console.error("6002:Formato inesperado no response:", response);
            }

        } catch(error){
            console.error("6001:Erro ao obter amigosmelvin!", error);   
            alert('Erro ao obter amigosmelvin!');
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
            amigomelvin.nome.toLowerCase().includes(termoBusca)   ||
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
                    <h2 className={styles.title}>Amigos do Melvin</h2>
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
                            <th>Contato</th>
                            <th>Email</th>
                            <th className={styles.edicao}>Edição</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {amigosmelvinFiltradosBusca
                            .map((amigomelvin) => (
                            <tr key={amigomelvin.id}>
                                <td>{amigomelvin.nome}</td>
                                <td>{amigomelvin.contato}</td>
                                <td>{amigomelvin.email}</td>
                                <td className={styles.edicao}>
                                    <MdOutlineModeEdit 
                                        className={styles.icon_editar}
                                        onClick={()=>handleEditClick(amigomelvin.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AmigosMelvinApp;