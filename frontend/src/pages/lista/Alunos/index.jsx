import styles from './Alunos.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

import { MdOutlineModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";

import get from '../../../services/requests/get';
import Botao from '../../../components/gerais/Botao';

function Alunos(){
    const [busca, setBusca] = useState('');
    const [alunos, setAlunos] = useState([]);
    const [isAdminOrDire, setIsAdminOrDire] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const response = await get.discente();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    const alunosAtivos = objetoDados.filter(aluno => aluno.status === true);
                    setAlunos(alunosAtivos);

                    const userRole = Cookies.get('role');
                    setIsAdminOrDire(userRole === 'COOR' || userRole === 'DIRE'); 
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
        navigate(`/aluno/editar/${matricula}`);
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const alunosFiltrados = alunos.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        return (
            aluno.matricula.toString().includes(termoBusca) ||
            aluno.nome.toLowerCase().includes(termoBusca)   ||
            (aluno.nome_pai || '').toLowerCase().includes(termoBusca) ||
            (aluno.nome_mae || '').toLowerCase().includes(termoBusca)
        );
    });

    const handleFrequenciasClick = () => {
        navigate("/frequencias/alunos");
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Alunos</h2>
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
                        <tr>
                            <th>Matrícula</th>
                            <th>Nome</th>
                            <th>Responsável</th>
                            {isAdminOrDire && (
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
                                {isAdminOrDire && (
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
                        {isAdminOrDire && (
                                <>
                                    <tr className={styles.plus} onClick={()=>navigate("/aluno/criar")}>
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

export default Alunos;