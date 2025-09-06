import styles from './Cestas.module.scss';

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch } from "react-icons/io";
import { MdOutlineModeEdit } from "react-icons/md";

import get from '../../../services/requests/get';

function Cestas(){
    const [busca, setBusca] = useState('');
    const [cestas, setCestas] = useState([]);
    const navigate = useNavigate();
    const [data, setData] = useState("todos");

    const fetchCestas = async () => {
        try{
            const response = await get.cestas();
            const dados = response.data;

            if(Array.isArray(dados)){
                setCestas(dados);
            }else{
                console.error("6003:Formato inesperado no response:", response);
            }

        } catch(error){
            console.error("6003:Erro ao obter cestas!", error);   
            alert('Erro ao obter cestas!');
        }
    };

    useEffect(() => {
        fetchCestas();
    }, []);

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const handleDataChange = (e) => {
        setData(e.target.value);
    };

    const cestasFiltradosBusca = cestas.filter((cesta) => {
        const termoBusca = busca.toLowerCase();
        const dataEntrega = new Date(cesta.dataEntrega).toISOString().split('T')[0];
        return (
            (cesta.contato.includes(termoBusca) ||
            cesta.nome.toLowerCase().includes(termoBusca)) &&
            (data === "todos" || dataEntrega === data)
        );
    });

    const handleEditClick = (id) => {
        navigate(`/app/cestas/editar/${id}`);
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
            <div className={styles.header}>
                    <h2 className={styles.title}>Cestas básicas</h2>
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
                    <div className={styles.botoes}>
                        <button className={styles.botao} onClick={()=>navigate("/app/cestas/criar")}>Adicionar</button>
                        <select
                            className={styles.input_data}
                            name="filtroData"
                            value={data === "todos" ? "todos" : "especifica"}
                            onChange={(e) => {
                                setData(e.target.value === "todos" ? "todos" : new Date().toISOString().split('T')[0]);
                            }}
                        >
                            <option value="todos">Todos</option>
                            <option value="especifica">Especificar Data</option>
                        </select>
                        {data !== "todos" && (
                            <input
                                className={styles.input_data}
                                type="date"
                                name="data"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.container_table}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th>Nome</th>
                                <th>Responsável</th>
                                <th>Data</th>
                                <th className={styles.edicao}>Edição</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {cestasFiltradosBusca
                                .map((cesta) => (
                                <React.Fragment key={cesta.id}>
                                    <tr key={cesta.id}>
                                        <td>{cesta.nome}</td>
                                        <td>{cesta.responsavel}</td>
                                        <td>{new Date(cesta.dataEntrega + "T00:00:00").toLocaleDateString('pt-BR')}</td>
                                        <td className={styles.edicao}>
                                            <MdOutlineModeEdit 
                                                className={styles.icon_editar}
                                                onClick={()=>handleEditClick(cesta.id)}
                                            />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Cestas;