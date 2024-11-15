import styles from './AlunosExtra.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import get from '../../../services/requests/get';
import Botao from '../../../components/gerais/Botao';

function AlunosExtra(){
    const [busca, setBusca] = useState('');
    const [alunos, setAlunos] = useState([]);
    const [aula, setAula] = useState('informatica');
    const [isAdm, setIsAdm] = useState(false);
    const [filtroEspera, setFiltroEspera] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userRole = Cookies.get('role');
        const isUserAdm = userRole === 'ADM' || userRole === 'DIRE' || userRole === 'COOR';
        setIsAdm(isUserAdm);

        const fetchAlunos = async () => {
            try {
                const response = await get.discente();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    setAlunos(objetoDados);
                } else {
                    console.error("5003:Formato inesperado no response:", response);
                    alert('Erro ao obter objeto! Formato inesperado de resposta.');
                }
                
            } catch (error) {
                console.error("5004:Erro ao obter objeto!", error);
                alert('Erro ao obter objeto!');
            }
        };

        fetchAlunos();
    }, []);

    const handleEditClick = (matricula) => {
        navigate(`/app/aluno/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const alunosFiltrados = alunos.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        const statusCondicao = filtroEspera ? aluno.status === 'espera' : aluno.status === 'true';
    
        // Check if the student is part of the selected "aula"
        let aulaCondicao = true;  // Default to true for general cases
        if (aula) {
            aulaCondicao = aluno[aula] === true;  // Check if the selected activity is true for the student
        }
    
        return (
            statusCondicao &&
            aulaCondicao &&
            (
                aluno.matricula.toString().includes(termoBusca) ||
                aluno.nome.toLowerCase().includes(termoBusca) ||
                (aluno.nome_pai || '').toLowerCase().includes(termoBusca) ||
                (aluno.nome_mae || '').toLowerCase().includes(termoBusca)
            )
        );
    });
    

    const handleEsperaClick = () => {
        setFiltroEspera(!filtroEspera);
    };

    const handleFrequenciasClick = () => {
        navigate("/app/frequencias/alunos");
    };

    const handleChange = (setter) => (event) => {
        setter(event.target.value);
    };    

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{filtroEspera ? "Alunos em espera...": "Alunos"}</h2>
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
                        { isAdm &&(
                            <>
                                <Botao 
                                    nome={filtroEspera ? "Mostrar Ativos" : "Em espera"} 
                                    corFundo="#F29F05" 
                                    corBorda="#8A6F3E" 
                                    type="button"
                                    onClick={handleEsperaClick}
                                />
                            </>
                        )}
                        
                        <Botao 
                            nome="Frequências" 
                            corFundo="#7EA629" 
                            corBorda="#58751A" 
                            type="button"
                            onClick={handleFrequenciasClick}
                        />

                        <select
                            className={styles.select_aula}
                            value={aula} 
                            onChange={handleChange(setAula)}
                        >
                            <option value="" hidden></option>
                            <option value="ingles">Inglês</option>
                            <option value="karate">Karatê</option>
                            <option value="informatica">Informática</option>
                            <option value="artesanato">Artesanato</option>
                            <option value="ballet">Ballet</option>
                            <option value="musica">Música</option>
                            <option value="futsal">Futsal</option>
                        </select>
                    </div>
                </div>
                <table className={styles.table}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nome</th>
                            <th>Responsável</th>
                            {isAdm && (
                                <>
                                    <th className={styles.edicao}>Edição</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {alunosFiltrados.map((aluno) => (
                            <tr key={aluno.matricula}>
                                <td>{aluno.matricula}</td>
                                <td>{aluno.nome}</td>
                                <td>{aluno.nome_pai || aluno.nome_mae || ''}</td>
                                {isAdm && (
                                    <>
                                        <td className={styles.edicao}>
                                            <MdOutlineModeEdit 
                                                className={styles.icon_editar}
                                                onClick={()=>handleEditClick(aluno.matricula)}
                                            />
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {isAdm && (
                            <>
                                <tr className={styles.plus} onClick={()=>navigate("/app/aluno/criar")}>
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

export default AlunosExtra;