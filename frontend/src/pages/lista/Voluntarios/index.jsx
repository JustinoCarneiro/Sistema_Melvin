import styles from './Voluntarios.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import Cookies from "js-cookie";

import get from '../../../services/requests/get';
import Botao from '../../../components/gerais/Botao';

function Voluntarios({tipo}){
    const [busca, setBusca] = useState('');
    const [voluntarios, setVoluntarios] = useState([]);
    const navigate = useNavigate();
    const [isAdm, setIsAdm] = useState(false);

    useEffect(() => {
        const userRole = Cookies.get('role');  
        setIsAdm(userRole === "ADM");

        const fetchVoluntarios = async () => {
            try {
                const response = await get.voluntario();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    const voluntariosAtivos = objetoDados.filter(voluntario => voluntario.status === true);
                    setVoluntarios(voluntariosAtivos);
                } else {
                    console.error("5005:Formato inesperado no response:", response);
                    alert('Erro ao obter objeto! Formato inesperado de resposta.');
                }
                
            } catch (error) {
                console.error("5006:Erro ao obter objeto!", error);
                alert('Erro ao obter objeto!');
            }
        };

        fetchVoluntarios();
    }, []);

    let title, prox_rota;

    if(tipo === "coordenador"){
        title = "Coordenadores";
        prox_rota = "coordenadores";
    } else if(tipo === "professor"){
        title = "Professores";
        prox_rota = "professores";
    } else if(tipo === "auxiliar"){
        title = "Auxiliares";
        prox_rota = "auxiliares";
    } else if(tipo === "cozinheiro"){
        title = "Cozinheiros";
        prox_rota = "cozinheiros";
    } else if(tipo === "diretor"){
        title = "Diretores";
        prox_rota = "diretores";
    } else if(tipo === "marketing"){
        title = "Marketing";
        prox_rota = "marketing";
    } else if(tipo === "administrador"){
        title = "Administradores";
        prox_rota = "administradores";
    } else if(tipo === "zelador"){
        title = "Zeladores";
        prox_rota = "zeladores";
    }

    const handleEditClick = (matricula) => {
        navigate(`/app/voluntario/${tipo}/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const voluntariosFiltradosBusca = voluntarios.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        return (
            aluno.matricula.toString().includes(termoBusca) ||
            aluno.nome.toLowerCase().includes(termoBusca)   ||
            (aluno.email || '').toLowerCase().includes(termoBusca)
        );
    });

    const handleFrequenciasClick = () => {
        navigate(`/app/voluntario/frequencias/${prox_rota}`);
    };

    return(
        <div className={styles.body}>
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
                    <Botao 
                        nome="Frequências" 
                        corFundo="#7EA629" 
                        corBorda="#58751A"
                        type="button"
                        onClick={handleFrequenciasClick}
                    />
                </div>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr className={styles.tr_head}>
                            <th>Matrícula</th>
                            <th>Nome</th>
                            <th>Email</th>
                            {isAdm && (
                                <th className={styles.edicao}>Edição</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {voluntariosFiltradosBusca
                            .filter(voluntario => voluntario.funcao === tipo)
                            .map((voluntario) => (
                            <tr key={voluntario.matricula} className={styles.tr_body}>
                                <td>{voluntario.matricula}</td>
                                <td>{voluntario.nome}</td>
                                <td>{voluntario.email}</td>
                                {isAdm && (
                                    <td className={styles.edicao}>
                                        <MdOutlineModeEdit 
                                            className={styles.icon_editar}
                                            onClick={()=>handleEditClick(voluntario.matricula)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {isAdm && (
                            <>
                                <tr className={styles.plus} onClick={()=>navigate(`/app/voluntario/criar/${tipo}`)}>
                                    <td colSpan="4"><FaPlus className={styles.icon_plus}/></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Voluntarios;