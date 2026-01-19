import styles from './Voluntario_frequencia.module.scss';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";

import put from '../../../services/requests/put';
import post from '../../../services/requests/post';
import get from '../../../services/requests/get';

import Botao from '../../../components/gerais/Botao';

function Voluntario_frequencia({tipo}){
    const navigate = useNavigate();
    
    // Título dinâmico
    const getTitle = () => {
        const titles = {
            coordenador: "Frequência Coordenadores",
            professor: "Frequência Professores",
            auxiliar: "Frequência Auxiliares",
            cozinheiro: "Frequência Cozinheiros",
            administrador: "Frequência Administradores",
            marketing: "Frequência Marketing",
            zelador: "Frequência Zeladores",
            diretor: "Frequência Diretores",
            psicologo: "Frequência Psicólogos",
            assistente: "Frequência Assistentes"
        };
        return titles[tipo] || "Frequência Voluntários";
    };

    const [data, setData] = useState('');
    const [voluntarios, setVoluntarios] = useState([]);
    const [presencas, setPresencas] = useState({});
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVoluntarios = async () => {
            setLoading(true);
            try {
                const response = await get.voluntario();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    // Filtra apenas ativos
                    const voluntariosAtivos = objetoDados.filter(voluntario => 
                        voluntario.status === true || String(voluntario.status) === 'true'
                    );
                    setVoluntarios(voluntariosAtivos);
                } else {
                    console.error("5003: Formato inesperado:", response);
                }
            } catch (error) {
                console.error("5004: Erro ao obter voluntários!", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVoluntarios();
    }, []);

    const fetchFrequencias = async (selectedDate) => {
        try {
            const response = await get.frequenciavoluntario(selectedDate);
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
        }
    };

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
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const promises = voluntarios
                .filter(voluntario => voluntario.funcao === tipo)
                .map(async (voluntario) => {
                const { matricula, nome } = voluntario;
                const presenca_manha = presencas[matricula]?.presenca_manha || '';
                const presenca_tarde = presencas[matricula]?.presenca_tarde || '';
                const justificativa = presencas[matricula]?.justificativa || '';

                const frequenciaVoluntarioExistente = await get.frequenciavoluntario(data, matricula);

                if (frequenciaVoluntarioExistente && frequenciaVoluntarioExistente.data) {
                    return await put.frequenciavoluntario({ matricula, nome, data, justificativa, presenca_manha, presenca_tarde });  
                } else {
                    return await post.frequenciavoluntario({ matricula, nome, data, justificativa, presenca_manha, presenca_tarde });
                }
            });

            await Promise.all(promises);
            await fetchFrequencias(data);
            alert('Frequência salva com sucesso!');
        } catch (error) {
            console.error('5013: Erro ao atualizar!', error);
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

    const voluntarioFiltradosBusca = voluntarios.filter((voluntario) => {
        const termoBusca = busca.toLowerCase();
        return (
            voluntario.matricula.toString().includes(termoBusca) ||
            voluntario.nome.toLowerCase().includes(termoBusca) ||
            (presencas[voluntario.matricula]?.justificativa || '').toLowerCase().includes(termoBusca)
        );
    });

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
                        <h2 className={styles.title}>{getTitle()}</h2>
                    </div>
                    
                    <div className={styles.filters}>
                        <div className={styles.container_busca}>
                            <IoMdSearch className={styles.icon_busca}/>
                            <input 
                                className={styles.busca} 
                                type='text'
                                placeholder='Buscar voluntário...'
                                name='busca'
                                onChange={handleBuscaChange}
                            />
                        </div>
                        <div className={styles.controls}>
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
                                    <th className={styles.th_center}>Presença (M / T)</th>
                                    <th>Justificativa</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tbody}>
                                {loading ? (
                                    <tr><td colSpan="4" className={styles.empty}>Carregando...</td></tr>
                                ) : (
                                    voluntarioFiltradosBusca.length > 0 ? (
                                        voluntarioFiltradosBusca
                                            .filter(voluntario => voluntario.funcao === tipo) 
                                            .map((voluntario) => (
                                            <tr key={voluntario.matricula} className={styles.tr_body}>
                                                <td data-label="Matrícula">{voluntario.matricula}</td>
                                                <td data-label="Nome">{voluntario.nome}</td>
                                                <td data-label="Presença" className={styles.td_presenca}>
                                                    <div className={styles.select_turnos}>
                                                        {/* Manhã */}
                                                        <select className={styles.select_presenca}
                                                            value={presencas[voluntario.matricula]?.presenca_manha || ''}
                                                            onChange={handlePresenceChange(voluntario.matricula, 'presenca_manha')}
                                                            title="Manhã"
                                                        >
                                                            <option value="">-</option>
                                                            <option value="P">P</option>
                                                            <option value="F">F</option>
                                                            <option value="FJ">FJ</option>
                                                            <option value="X">X</option>
                                                        </select>
                                                        {/* Tarde */}
                                                        <select className={styles.select_presenca}
                                                            value={presencas[voluntario.matricula]?.presenca_tarde || ''}
                                                            onChange={handlePresenceChange(voluntario.matricula, 'presenca_tarde')}
                                                            title="Tarde"
                                                        >
                                                            <option value="">-</option>
                                                            <option value="P">P</option>
                                                            <option value="F">F</option>
                                                            <option value="FJ">FJ</option>
                                                            <option value="X">X</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td data-label="Justificativa">
                                                    <input
                                                        className={styles.input_justificativa}
                                                        type="text"
                                                        placeholder="Opcional..."
                                                        name="justificativa"
                                                        value={presencas[voluntario.matricula]?.justificativa || ''}
                                                        onChange={handleJustificativaChange(voluntario.matricula)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className={styles.empty}>Nenhum voluntário encontrado.</td></tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {!loading && voluntarioFiltradosBusca.length > 0 && (
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

export default Voluntario_frequencia;