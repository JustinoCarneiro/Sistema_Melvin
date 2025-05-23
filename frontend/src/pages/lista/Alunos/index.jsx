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
    const [aula, setAula] = useState('1');
    const [isAdm, setIsAdm] = useState(false);
    const [filtroEspera, setFiltroEspera] = useState(false);
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);
    const [turnoSelecionado, setTurnoSelecionado] = useState('manha');
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

    useEffect(() => {
        const fetchSalasDisponiveis = async () => {
            const role = Cookies.get('role');
            const matricula = Cookies.get('login');
        
            if (role === 'PROF' || role === 'AUX') {
                try {
                    const dadosVoluntario = await get.voluntarioByMatricula(matricula);
                    const { salaUm, salaDois, aulaExtra } = dadosVoluntario.data;
        
                    // Salas regulares
                    const salas = [];
                    if (salaUm) salas.push(salaUm.toString());
                    if (salaDois) salas.push(salaDois.toString());
        
                    // Sala extra (se existir)
                    if (aulaExtra) salas.push(aulaExtra.toString());
        
                    setSalasDisponiveis(salas);
                    setAula(salas[0] || '1'); // Define a primeira sala como padrão
                } catch (error) {
                    console.error("Erro ao buscar dados do voluntário:", error);
                    alert('Erro ao carregar as salas disponíveis!');
                }
            } else {
                setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
            }
        };
        
        fetchSalasDisponiveis();
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
        const turnoCondicao = turnoSelecionado === 'todos' || aluno.turno === turnoSelecionado;

        // Verifica se o aluno pertence à sala ou aula extra selecionada
        const aulaCondicao = (() => {
            if (aula === "todos") {
                return true; // Exibe todos os alunos
            }
            if (aula <= 4) {
                return aluno.sala === parseInt(aula, 10);
            } else {
                const mapeamentoAulasExtras = {
                    '5': aluno.ingles,
                    '6': aluno.karate,
                    '7': aluno.informatica,
                    '8': aluno.teatro,
                    '9': aluno.ballet,
                    '10': aluno.musica,
                    '11': aluno.futsal,
                    '12': aluno.artesanato,
                };
                return mapeamentoAulasExtras[aula] || false;
            }
        })();
    
        return (
            statusCondicao &&
            turnoCondicao &&
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
                                <select 
                                    className={styles.select_sala}
                                    value={turnoSelecionado}
                                    onChange={(e) => setTurnoSelecionado(e.target.value)}
                                >
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="todos">Todos</option>
                                </select>
                                <Botao 
                                    nome={filtroEspera ? "Mostrar Ativos" : "Em espera"} 
                                    corFundo="#F29F05" 
                                    corBorda="#8A6F3E" 
                                    type="button"
                                    onClick={handleEsperaClick}
                                />
                            </>
                        )}
                        <select 
                            className={styles.select_sala} 
                            value={aula} 
                            onChange={(e) => setAula(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            {salasDisponiveis.map((sala) => (
                                <option key={sala} value={sala}>
                                    {sala <= 4 ? `Sala ${sala}` : (
                                        sala === '5' ? 'Inglês' :
                                        sala === '6' ? 'Karatê' :
                                        sala === '7' ? 'Informática' :
                                        sala === '8' ? 'Teatro' :
                                        sala === '9' ? 'Ballet' :
                                        sala === '10' ? 'Música' :
                                        sala === '11' ? 'Futsal' :
                                        sala === '12' ? 'Artesanato' : `Sala ${sala}`
                                    )}
                                </option>
                            ))}
                        </select>
                        <Botao 
                            nome="Frequências" 
                            corFundo="#7EA629" 
                            corBorda="#58751A" 
                            type="button"
                            onClick={handleFrequenciasClick}
                        />
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

export default Alunos;