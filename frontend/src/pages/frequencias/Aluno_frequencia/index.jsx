import styles from './Aluno_frequencia.module.scss';
import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";

import { IoMdSearch } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import put from '../../../services/requests/put';

import Botao from '../../../components/gerais/Botao';

function Aluno_frequencia(){
    const [alunos, setAlunos] = useState([]);
    const [data, setData] = useState('');
    const [sala, setSala] = useState('1');
    const [turno, setTurno] = useState('');
    const [presencas, setPresencas] = useState({});
    const [busca, setBusca] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [isEditable, setIsEditable] = useState(true);
    
    const getTurnoAtual = () => {
        const now = new Date();
        const hour = now.getHours();
        return hour < 12 ? 'manha' : 'tarde';
    };

    const fetchAlunos = async (selectedSala) => {
        try {
            const response = await get.discente(selectedSala);
            const objetoDados = response.data;

            if (Array.isArray(objetoDados)) {
                const alunosAtivos = objetoDados.filter(aluno => aluno.status === true && aluno.turno === turno);
                setAlunos(alunosAtivos);
            } else {
                console.error("5006: Formato inesperado no response:", response);
                alert('Erro ao obter objeto! Formato inesperado de resposta.');
            }
        } catch (error) {
            console.error("5007: Erro ao obter objeto!", error);
            alert('Erro ao obter objeto!');
        }
    };

    const fetchFrequencias = async (selectedDate) => {
        try {
            const response = await get.frequenciadiscente(selectedDate);

            const presencaObj = {};

            response.data.forEach(frequencia => {
                presencaObj[frequencia.matricula] = {
                    presenca_manha: frequencia.presenca_manha,
                    presenca_tarde: frequencia.presenca_tarde,
                    justificativa: frequencia.justificativa
                };
            });
            setPresencas(presencaObj);
        } catch (error) {
            console.error("Erro ao obter frequências!", error);
            alert('Erro ao obter frequências!');
        }
    };

    useEffect(() => {
        if (turno) {
            fetchAlunos(sala);
        }
    }, [sala, turno]);

    useEffect(() => {
        if (data) {
            fetchFrequencias(data);
        }
    }, [data]);

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        setData(getCurrentDate());
        setTurno(getTurnoAtual());

        const fetch = async () => {

            let role = Cookies.get('role');
            let matricula = Cookies.get('login');

            if(role === "PROF" || role === "AUX"){
                try {
                    const dadosVoluntario = await get.voluntarioByMatricula(matricula);
                    setSala(dadosVoluntario.data.sala);
                    setIsEditable(false);
                } catch (error) {
                    console.error("Erro ao buscar dados do voluntário:", error);
                }
            }
        };

        fetch();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const promises = alunos
                .map(async (aluno) => {
                const { matricula, nome } = aluno;
                const presenca_manha = presencas[matricula]?.presenca_manha || '';
                const presenca_tarde = presencas[matricula]?.presenca_tarde || '';
                const justificativa = presencas[matricula]?.justificativa || '';

                console.log(`Enviando dados para matrícula ${matricula}:`, {
                    matricula,
                    nome,
                    sala,
                    data,
                    justificativa,
                    presenca_manha,
                    presenca_tarde
                });

                console.log("dados:", data, matricula);
                const frequenciaDiscenteExistente = await get.frequenciadiscente(data, matricula);
                console.log("frequencia existente:", frequenciaDiscenteExistente.data);

                if (frequenciaDiscenteExistente && frequenciaDiscenteExistente.data) {
                    console.log('Tentando fazer PUT...');
                    try {
                        const response = await put.frequenciadiscente({ matricula, nome, sala, data, justificativa, presenca_manha, presenca_tarde });  
                        console.log('PUT bem-sucedido:', response);
                        return response;
                    } catch (error) {
                        console.error('5014:Erro capturado no PUT:', error);
                        throw error;
                    }
                } else {
                    console.log('Tentando fazer POST...');
                    try {
                        const response = await post.frequenciadiscente({ matricula, nome, sala, data, justificativa, presenca_manha, presenca_tarde });
                        console.log('POST bem-sucedido:', response);
                        return response;
                    } catch (error) {
                        console.error('5015:Erro capturado no POST:', error);
                        throw error;
                    }
                }
            });

            const responses = await Promise.all(promises);
            responses.forEach(response => {
                if (response.error) {
                    throw new Error(response.error.message);
                }
            });

            await fetchFrequencias(data);
            alert('Salvação realizada com sucesso!');
        } catch (error) {
            console.error('5009:Erro ao atualizar!', error);
            alert('Erro ao salvar!');
        }
    };

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handlePresenceChange = (matricula, periodo) => (e) => {
        const { value } = e.target;
        setPresencas((prev) => ({
            ...prev,
            [matricula]: {
                ...prev[matricula],
                [periodo]: value
            }
        }));
    };

    const handleJustificativaChange = (matricula) => (e) => {
        const { value } = e.target;
        setPresencas((prev) => ({
            ...prev,
            [matricula]: {
                ...prev[matricula],
                justificativa: value
            }
        }));
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const handleToggleRow = (matricula) => {
        setExpandedRows(prevState => ({
            ...prevState,
            [matricula]: !prevState[matricula]
        }));
    };

    const handleResize = () => {
        const sizeE = 880;
        if (window.innerWidth > sizeE) {
            setExpandedRows({});
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const alunosFiltrados = alunos.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        return (
            aluno.matricula.toString().includes(termoBusca) ||
            aluno.nome.toLowerCase().includes(termoBusca) ||
            (presencas[aluno.matricula]?.justificativa || '').toLowerCase().includes(termoBusca)
        );
    });

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Frequência de alunos</h2>
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
                        <select
                            className={styles.select_turno} 
                            value={turno} 
                            onChange={handleChange(setTurno)}
                            disabled={!isEditable}
                        >
                            <option value="" hidden></option>
                            <option value="manha">Manhã</option>
                            <option value="tarde">Tarde</option>
                        </select>
                        <select 
                            className={styles.select_sala} 
                            value={sala} 
                            onChange={handleChange(setSala)}
                            disabled={!isEditable}
                        >
                            <option value="" hidden></option>
                            <option value="1">Sala 1</option>
                            <option value="2">Sala 2</option>
                            <option value="3">Sala 3</option>
                            <option value="4">Sala 4</option>
                        </select>
                        <input 
                            className={styles.input_data}
                            type="date"
                            placeholder=''
                            name="data"
                            value={data}
                            onChange={handleChange(setData)}
                            autoFocus
                        />
                    </div>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome</th>
                                <th className={styles.th_presenca}>
                                    <div className={styles.ctn_presenca}>
                                        <p className={styles.p}>Presença</p>
                                    </div>
                                </th>
                                <th className={styles.coluna_justificativa_th}>Justificativa</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {alunosFiltrados.map((aluno) => (
                                <React.Fragment key={aluno.matricula}>
                                    <tr key={aluno.matricula}>
                                        <td>{aluno.matricula}</td>
                                        <td>{aluno.nome}</td>
                                        <td className={styles.td_presenca}>
                                            <div className={styles.select_turnos}>
                                                <select
                                                    className={styles.select_presenca}
                                                    value={turno === 'manha' 
                                                        ? presencas[aluno.matricula]?.presenca_manha || '' 
                                                        : presencas[aluno.matricula]?.presenca_tarde || ''
                                                    }
                                                    onChange={handlePresenceChange(aluno.matricula, turno === 'manha' ? 'presenca_manha' : 'presenca_tarde')}
                                                >
                                                    <option value="" hidden></option>
                                                    <option value="P">P</option>
                                                    <option value="F">F</option>
                                                    <option value="FJ">FJ</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className={styles.toggleButton} onClick={() => handleToggleRow(aluno.matricula)}>
                                            {expandedRows[aluno.matricula] ? <FaChevronUp /> : <FaChevronDown />}
                                        </td>
                                        <td className={styles.coluna_justificativa_td}>
                                            <input
                                                className={styles.input_justificativa}
                                                type="text"
                                                name="justificativa"
                                                value={presencas[aluno.matricula]?.justificativa || ''}
                                                onChange={handleJustificativaChange(aluno.matricula)}
                                            />
                                        </td>
                                    </tr>
                                    {expandedRows[aluno.matricula] && (
                                        <tr className={styles.expanded} key={`${aluno.matricula}-expanded`}>
                                            <td colSpan="4" className={styles.justificativa_td}>
                                                <input 
                                                    className={styles.input_justificativa}
                                                    type="text"
                                                    name="justificativa"
                                                    value={presencas[aluno.matricula]?.justificativa || ''} 
                                                    onChange={handleJustificativaChange(aluno.matricula)} 
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.container_botao}>
                        <Botao
                            nome="Salvar"
                            corFundo="#F29F05"
                            corBorda="#8A6F3E"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Aluno_frequencia;