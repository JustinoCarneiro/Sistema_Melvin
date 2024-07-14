import styles from './VoluntariosDesativados.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MdOutlineModeEdit } from "react-icons/md";
import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import get from '../../../services/requests/get';

function VoluntariosDesativados(){
    const [busca, setBusca] = useState('');
    const [voluntarios, setVoluntarios] = useState([]);
    const [funcao, setFuncao] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVoluntarios = async () => {
            try {
                const response = await get.voluntario();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    const voluntariosAtivos = objetoDados.filter(voluntario => voluntario.status === false);
                    setVoluntarios(voluntariosAtivos);
                } else {
                    console.error("5015:Formato inesperado no response:", response);
                    alert('Erro ao obter objeto! Formato inesperado de resposta.');
                }
            } catch (error) {
                console.error("5016:Erro ao obter objeto!", error);
                alert('Erro ao obter objeto!');
            }
        };

        fetchVoluntarios();
    }, []);

    let title;

    if(funcao === "coordenador"){
        title = "Coordenadores";
    } else if(funcao === "professor"){
        title = "Professores";
    } else if(funcao === "auxiliar"){
        title = "Auxiliares";
    } else if(funcao === "cozinheiro"){
        title = "Cozinheiros";
    } else if(funcao === "diretor"){
        title = "Diretores";
    } else if(funcao === "administrador"){
        title = "Administradores";
    } else if(funcao === "marketing"){
        title = "Marketing";
    } else if(funcao === "zelador"){
        title = "Zeladores";
    }

    const handleEditClick = (matricula) => {
        navigate(`/app/voluntario/${funcao}/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const handleFuncaoChange = (e) => {
        setFuncao(e.target.value);
    };

    const voluntariosFiltradosBusca = voluntarios.filter((voluntario) => {
        const termoBusca = busca.toLowerCase();
        return (
            voluntario.matricula.toString().includes(termoBusca) ||
            voluntario.nome.toLowerCase().includes(termoBusca)   ||
            (voluntario.email || '').toLowerCase().includes(termoBusca)
        );
    });

    return(
        <div className={styles.body}>
            <div className={styles.linha_voltar}>
                <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
            </div>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
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
                    <select className={styles.select_funcao} value={funcao} onChange={handleFuncaoChange}>
                        <option value="" hidden>Selecione...</option>
                        <option value="coordenador">Coordenação</option>
                        <option value="professor">Docência</option>
                        <option value="auxiliar">Auxílio</option>
                        <option value="cozinheiro">Cozinha</option>
                        <option value="diretor">Diretoria</option>
                        <option value="marketing">Marketing</option>
                        <option value="zelador">Zeladoria</option>
                        <option value="administrador">Administração</option>
                    </select>
                </div>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th className={styles.edicao}>Edição</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {voluntariosFiltradosBusca
                            .filter(voluntario => voluntario.funcao === funcao)
                            .map((voluntario) => (
                            <tr key={voluntario.matricula}>
                                <td>{voluntario.matricula}</td>
                                <td>{voluntario.nome}</td>
                                <td>{voluntario.email}</td>
                                <td className={styles.edicao}>
                                    <MdOutlineModeEdit 
                                        className={styles.icon_editar}
                                        onClick={()=>handleEditClick(voluntario.matricula)}
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

export default VoluntariosDesativados;