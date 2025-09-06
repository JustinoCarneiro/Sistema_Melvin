import styles from './Voluntario_frequencia.module.scss';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { IoMdSearch, IoMdArrowRoundBack } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import put from '../../../services/requests/put';
import post from '../../../services/requests/post';
import get from '../../../services/requests/get';

import Botao from '../../../components/gerais/Botao';

function Voluntario_frequencia({tipo}){
    const navigate = useNavigate();

    var title;
    if(tipo === "coordenador"){
        title = "Frequência coordenadores";
    } else if(tipo === "professor"){
        title = "Frequência professores";
    } else if(tipo === "auxiliar"){
        title = "Frequência auxiliares";
    } else if(tipo === "cozinheiro"){
        title = "Frequência cozinheiros";
    } else if(tipo === "administrador"){
        title = "Frequência administradores";
    } else if(tipo === "marketing"){
        title = "Frequência marketing";
    } else if(tipo === "zelador"){
        title = "Frequência zeladores";
    } else if(tipo === "diretor"){
        title = "Frequência diretores";
    }

    const [data, setData] = useState('');
    const [voluntarios, setVoluntarios] = useState([]);
    const [presencas, setPresencas] = useState({});
    const [busca, setBusca] = useState('');
    const [expandedRows, setExpandedRows] = useState({});


    useEffect(() => {
        const fetchVoluntarios = async () => {
            try {
                const response = await get.voluntario();
                const objetoDados = response.data;

                if (Array.isArray(objetoDados)) {
                    const voluntariosAtivos = objetoDados.filter(voluntario => voluntario.status === 'true');
                    setVoluntarios(voluntariosAtivos);
                } else {
                    console.error("5003:Formato inesperado no response:", response);
                    alert('Erro ao obter objeto! Formato inesperado de resposta.');
                }
                
            } catch (error) {
                console.error("5004:Erro ao obter objeto!", error);
                alert('Erro ao obter objeto!');
            }
        };

        fetchVoluntarios();
    }, []);

    const fetchFrequencias = async (selectedDate) => {
        try {
            console.log("data selecionada:", selectedDate);
            const response = await get.frequenciavoluntario(selectedDate);
            console.log("Response frequencias:", response);

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
                    console.log('Tentando fazer PUT...');
                    try {
                        const response = await put.frequenciavoluntario({ matricula, nome, data, justificativa, presenca_manha, presenca_tarde });  
                        console.log('PUT bem-sucedido:', response);
                        return response;
                    } catch (error) {
                        console.error('5011:Erro capturado no PUT:', error);
                        throw error;
                    }
                } else {
                    console.log('Tentando fazer POST...');
                    try {
                        const response = await post.frequenciavoluntario({ matricula, nome, data, justificativa, presenca_manha, presenca_tarde });
                        console.log('POST bem-sucedido:', response);
                        return response;
                    } catch (error) {
                        console.error('5012:Erro capturado no POST:', error);
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
            alert('Atualização realizada com sucesso!');
        } catch (error) {
            console.error('5013:Erro ao atualizar!', error);
            alert('Erro ao atualizar!');
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
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)} />
                </div>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.container_busca}>
                        <IoMdSearch className={styles.icon_busca}/>
                        <input 
                            className={styles.busca} 
                            type='text'
                            placeholder='Buscar'
                            name='busca'
                            onChange={handleBuscaChange}
                        />
                    </div>
                    <input 
                        className={styles.input_data}
                        type="date"
                        placeholder=''
                        name="data"
                        value={data}
                        onChange={handleChange(setData)}
                    />
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
                                        <div className={styles.th_turnos}>
                                            <p>M</p>
                                            <p>T</p>
                                        </div>
                                    </div>
                                </th>
                                <th className={styles.coluna_justificativa_th}>Justificativa</th>
                            </tr>
                        </thead>
                        <tbody className={styles.tbody}>
                            {voluntarioFiltradosBusca
                                .filter(voluntario => voluntario.funcao === tipo) 
                                .map((voluntario) => (
                                <React.Fragment key={voluntario.matricula}>
                                    <tr key={voluntario.matricula}>
                                        <td>{voluntario.matricula}</td>
                                        <td>{voluntario.nome}</td>
                                        <td className={styles.td_presenca}>
                                            <div className={styles.select_turnos}>
                                                <select className={styles.select_presenca}
                                                    value={presencas[voluntario.matricula]?.presenca_manha || ''}
                                                    onChange={handlePresenceChange(voluntario.matricula, 'presenca_manha')}
                                                >
                                                    <option value="" hidden></option>
                                                    <option value="P">P</option>
                                                    <option value="F">F</option>
                                                    <option value="FJ">FJ</option>
                                                    <option value="X">X</option>
                                                </select>
                                                <select className={styles.select_presenca}
                                                    value={presencas[voluntario.matricula]?.presenca_tarde || ''}
                                                    onChange={handlePresenceChange(voluntario.matricula, 'presenca_tarde')}
                                                >
                                                    <option value="" hidden></option>
                                                    <option value="P">P</option>
                                                    <option value="F">F</option>
                                                    <option value="FJ">FJ</option>
                                                    <option value="X">X</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className={styles.toggleButton} onClick={() => handleToggleRow(voluntario.matricula)}>
                                            {expandedRows[voluntario.matricula] ? <FaChevronUp /> : <FaChevronDown />}
                                        </td>
                                        <td className={styles.coluna_justificativa_td}>
                                            <input
                                                className={styles.input_justificativa}
                                                type="text"
                                                name="justificativa"
                                                value={presencas[voluntario.matricula]?.justificativa || ''}
                                                onChange={handleJustificativaChange(voluntario.matricula)}
                                            />
                                        </td>
                                    </tr>
                                    {expandedRows[voluntario.matricula] && (
                                        <tr className={styles.expanded} key={`${voluntario.matricula}-expanded`}>
                                            <td colSpan="4" className={styles.justificativa_td}>
                                                <input
                                                    className={styles.input_justificativa}
                                                    type="text"
                                                    name="justificativa"
                                                    value={presencas[voluntario.matricula]?.justificativa || ''}
                                                    onChange={handleJustificativaChange(voluntario.matricula)}
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

export default Voluntario_frequencia;