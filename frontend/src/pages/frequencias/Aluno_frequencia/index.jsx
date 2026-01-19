import styles from './Aluno_frequencia.module.scss';
import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import put from '../../../services/requests/put';

import Botao from '../../../components/gerais/Botao';

function Aluno_frequencia(){
    const navigate = useNavigate();
    const [todosOsAlunos, setTodosOsAlunos] = useState([]); 
    const [alunos, setAlunos] = useState([]); 
    const [data, setData] = useState('');
    const [sala, setSala] = useState('1');
    const [turno, setTurno] = useState('');
    const [presencas, setPresencas] = useState({});
    const [busca, setBusca] = useState('');
    const [salasDisponiveis, setSalasDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state

    const getTurnoAtual = () => {
        const now = new Date();
        const hour = now.getHours();
        return hour < 12 ? 'manha' : 'tarde';
    };

    const fetchAlunos = async () => {
        setLoading(true);
        try {
            const response = await get.discente(); 
            if (Array.isArray(response.data)) {
                setTodosOsAlunos(response.data); 
            } else {
                console.error("5006: Formato inesperado:", response);
            }
        } catch (error) {
            console.error("5007: Erro ao buscar alunos!", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const alunosFiltradosPorTurno = todosOsAlunos.filter(aluno => aluno.status === 'true' && aluno.turno === turno);

        const salaNumero = Number(sala);
        let alunosFiltradosFinal;

        if (salaNumero > 4) {
            const mapeamentoAulas = {
                5: 'ingles', 6: 'karate', 7: 'informatica', 8: 'musica',
                9: 'teatro', 10: 'ballet', 11: 'futsal', 12: 'artesanato'
            };
            const aulaKey = mapeamentoAulas[salaNumero];
            alunosFiltradosFinal = alunosFiltradosPorTurno.filter(aluno => aluno[aulaKey] === true);
        } else {
            alunosFiltradosFinal = alunosFiltradosPorTurno.filter(aluno => aluno.sala === salaNumero);
        }

        setAlunos(alunosFiltradosFinal);

    }, [sala, turno, todosOsAlunos]);

    const fetchFrequencias = async (selectedDate) => {
        try {
            const response = await get.frequenciadiscente(selectedDate);
            const presencaObj = {};

            response.data.forEach(frequencia => {
                const chave = `${frequencia.matricula}-${frequencia.sala}`;
                presencaObj[chave] = {
                    presenca_manha: frequencia.presenca_manha,
                    presenca_tarde: frequencia.presenca_tarde,
                    justificativa: frequencia.justificativa
                };
            });
            setPresencas(presencaObj);
        } catch (error) {
            console.error("Erro ao obter frequências!", error);
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
                    const { salaUm, salaDois, aulaExtra} = dadosVoluntario.data;

                    const salas = [];
                    if (salaUm) salas.push(salaUm);
                    if (salaDois) salas.push(salaDois);
                    if (aulaExtra) salas.push(aulaExtra.toString());
                    
                    setSalasDisponiveis(salas);
                    setSala(salas[0] || '1');
                } catch (error) {
                    console.error("Erro ao buscar dados do voluntário:", error);
                }
            } else {
                setSalasDisponiveis(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
            }
        };

        fetch();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const promises = alunos.map(async (aluno) => {
                const { matricula, nome } = aluno;
                const key = `${matricula}-${sala}`;
                const presenca_manha = presencas[key]?.presenca_manha || '';
                const presenca_tarde = presencas[key]?.presenca_tarde || '';
                const justificativa = presencas[key]?.justificativa || '';

                const frequenciaDiscenteExistente = await get.frequenciadiscente(data, matricula);

                if (frequenciaDiscenteExistente && frequenciaDiscenteExistente.data) {
                    return await put.frequenciadiscente({ matricula, nome, sala, data, justificativa, presenca_manha, presenca_tarde });
                } else {
                    return await post.frequenciadiscente({ matricula, nome, sala, data, justificativa, presenca_manha, presenca_tarde });
                }
            });

            await Promise.all(promises);
            await fetchFrequencias(data);
            alert('Chamada salva com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar!', error);
            alert('Erro ao salvar!');
        }
    };

    const handleChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handlePresenceChange = (matricula, periodo) => (e) => {
        const { value } = e.target;
        const key = `${matricula}-${sala}`;
        
        setPresencas((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],  
                [periodo]: value,
            }
        }));
    };

    const handleJustificativaChange = (matricula) => (e) => {
        const { value } = e.target;
        const key = `${matricula}-${sala}`;

        setPresencas((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                justificativa: value
            }
        }));
    };

    const handleBuscaChange = (e) => {
        setBusca(e.target.value);
    };

    const alunosFiltrados = alunos.filter((aluno) => {
        const termoBusca = busca.toLowerCase();
        return (
            aluno.matricula.toString().includes(termoBusca) ||
            aluno.nome.toLowerCase().includes(termoBusca) ||
            (Object.keys(presencas).some(key => 
                key.startsWith(aluno.matricula) && 
                (presencas[key]?.justificativa || '').toLowerCase().includes(termoBusca)
            ))
        );
    });

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
                        <h2 className={styles.title}>Frequência de Alunos</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar aluno...'
                                name='busca'
                                value={busca}
                                onChange={handleBuscaChange}
                            />
                        </div>
                        <div className={styles.controls}>
                            <select
                                className={styles.select_modern} 
                                value={turno} 
                                onChange={handleChange(setTurno)}
                            >
                                <option value="manha">Manhã</option>
                                <option value="tarde">Tarde</option>
                            </select>
                            <select 
                                className={styles.select_modern} 
                                value={sala} 
                                onChange={(e) => setSala(e.target.value)}
                            >
                                {salasDisponiveis.map((sala) => (
                                    <option key={sala} value={sala}>
                                        {sala <= 4 ? `Sala ${sala}` : (
                                            sala === '5' ? 'Inglês' :
                                            sala === '6' ? 'Karatê' :
                                            sala === '7' ? 'Informática' :
                                            sala === '8' ? 'Música' :
                                            sala === '9' ? 'Teatro' :
                                            sala === '10' ? 'Ballet' :
                                            sala === '11' ? 'Futsal' : 
                                            sala === '12' ? 'Artesanato' : `Sala ${sala}`
                                        )}
                                    </option>
                                ))}
                            </select>
                            <input 
                                className={styles.input_data}
                                type="date"
                                name="data"
                                value={data}
                                onChange={handleChange(setData)}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr_head}>
                                    <th>Matrícula</th>
                                    <th>Nome</th>
                                    <th className={styles.th_center}>Presença</th>
                                    <th>Justificativa</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {loading ? (
                                    <tr><td colSpan="4" className={styles.empty}>Carregando...</td></tr>
                                ) : (
                                    alunosFiltrados.length > 0 ? (
                                        alunosFiltrados.map((aluno) => (
                                            <tr key={aluno.matricula} className={styles.tr_body}>
                                                <td data-label="Matrícula">{aluno.matricula}</td>
                                                <td data-label="Nome">{aluno.nome}</td>
                                                <td data-label="Presença" className={styles.td_center}>
                                                    <select
                                                        className={styles.select_presenca}
                                                        value={turno === 'manha' 
                                                            ? presencas[`${aluno.matricula}-${sala}`]?.presenca_manha || '' 
                                                            : presencas[`${aluno.matricula}-${sala}`]?.presenca_tarde || ''
                                                        }
                                                        onChange={handlePresenceChange(aluno.matricula, turno === 'manha' ? 'presenca_manha' : 'presenca_tarde')}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="P">P</option>
                                                        <option value="F">F</option>
                                                        <option value="FJ">FJ</option>
                                                    </select>
                                                </td>
                                                <td data-label="Justificativa">
                                                    <input
                                                        className={styles.input_justificativa}
                                                        type="text"
                                                        placeholder="Opcional..."
                                                        name="justificativa"
                                                        value={presencas[`${aluno.matricula}-${sala}`]?.justificativa || ''}
                                                        onChange={handleJustificativaChange(aluno.matricula)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className={styles.empty}>Nenhum aluno encontrado nesta sala/turno.</td></tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {!loading && alunosFiltrados.length > 0 && (
                        <div className={styles.footerActions}>
                            <Botao
                                nome="Salvar Chamada"
                                corFundo="#F29F05"
                                corBorda="#8A6F3E"
                                type="submit"
                            />
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Aluno_frequencia;