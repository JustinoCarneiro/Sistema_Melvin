import styles from "./Config.module.scss";
import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCog, FaCalendarCheck, FaTools } from "react-icons/fa";
import Cookies from "js-cookie";

import get from "../../services/requests/get";
import put from "../../services/requests/put";
import post from "../../services/requests/post";

import Botao from "../../components/gerais/Botao";
import Deslogar from "../../components/Deslogar";

function Config(){
    const [userData, setUserData] = useState(null);
    const [isAdm, setIsAdm] = useState(false);
    const [data, setData] = useState('');
    const [frequencia, setFrequencia] = useState({
        presenca_manha: '',
        presenca_tarde: '',
        justificativa: ''
    });
    const navigate = useNavigate();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(()=>{
        setData(getCurrentDate());
    }, []);

    useEffect(() => {
        const fetchFrequencia = async () => {
            try {
                let matriculaCookie = Cookies.get('login');
                if(!matriculaCookie) return;

                const response = await get.frequenciavoluntario(data, matriculaCookie);
                if (response.data) {
                    setFrequencia({
                        presenca_manha: response.data.presenca_manha || '',
                        presenca_tarde: response.data.presenca_tarde || '',
                        justificativa: response.data.justificativa || ''
                    });
                }
            } catch (error) {
                console.error('Erro ao capturar dados da frequência:', error);
            }
        };
        if(data) fetchFrequencia();
    }, [data]);
    

    useEffect(() => {
        async function fetchUserData() {
            const login = Cookies.get('login');
            if (!login) return;

            try {
                const response = await get.voluntarioByMatricula(login);
                if (response.status === 200) {
                    setUserData(response.data);
                    const userRole = Cookies.get('role');
                    setIsAdm(userRole === 'ADM'); 
                }
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        }
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFrequencia({ ...frequencia, [name]: value });
    };

    if (!userData) {
        return <div className={styles.loading}>Carregando perfil...</div>;
    }

    const weekDays = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const dayLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    const renderCheckboxes = (day) => {
        const availability = userData[day] || "";
        const morningChecked = availability.includes("manha") || availability.includes("integral");
        const afternoonChecked = availability.includes("tarde") || availability.includes("integral");

        return (
            <div className={styles.dayChecks}>
                <div className={`${styles.checkItem} ${morningChecked ? styles.active : ''}`}>
                    <span>M</span>
                </div>
                <div className={`${styles.checkItem} ${afternoonChecked ? styles.active : ''}`}>
                    <span>T</span>
                </div>
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const payload = {
                matricula: userData.matricula,
                nome: userData.nome,
                data,
                presenca_manha: frequencia.presenca_manha,
                presenca_tarde: frequencia.presenca_tarde,
                justificativa: frequencia.justificativa
            };

            const check = await get.frequenciavoluntario(data, userData.matricula);

            if (check && check.data) {
                await put.frequenciavoluntario(payload);  
                alert("Presença atualizada!");
            } else {
                await post.frequenciavoluntario(payload);
                alert("Presença marcada!");
            }
        } catch(error) {
            alert('Erro ao marcar presença!');
        }
    }

    // Helper para exibir dados
    const InfoRow = ({ label, value }) => (
        <div className={styles.infoRow}>
            <span className={styles.infoLabel}>{label}:</span>
            <span className={styles.infoValue}>{value || '-'}</span>
        </div>
    );

    return(
        <div className={styles.body}>
            <div className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Configurações</h1>

                {/* --- CARD 1: PERFIL --- */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <FaUserCog className={styles.icon}/>
                        <h3>Meu Perfil</h3>
                    </div>
                    
                    <div className={styles.gridProfile}>
                        <div className={styles.coluna}>
                            <h4 className={styles.subTitle}>Pessoal</h4>
                            <InfoRow label="Nome" value={userData.nome} />
                            <InfoRow label="Contato" value={userData.contato} />
                            <InfoRow label="Nascimento" value={userData.data} />
                            <InfoRow label="Email" value={userData.email} />
                            <InfoRow label="Endereço" value={`${userData.endereco || ''}, ${userData.bairro || ''}`} />
                        </div>
                        <div className={styles.coluna}>
                            <h4 className={styles.subTitle}>Institucional</h4>
                            <InfoRow label="Matrícula" value={userData.matricula} />
                            <InfoRow label="Função" value={userData.funcao} />
                            <InfoRow label="CPF/RG" value={userData.rg} />
                            
                            <div className={styles.weekSchedule}>
                                <p className={styles.scheduleTitle}>Dias de Voluntariado:</p>
                                <div className={styles.daysGrid}>
                                    {weekDays.map((day, index) => (
                                        <div key={day} className={styles.dayContainer}>
                                            <span className={styles.dayLabel}>{dayLabels[index]}</span>
                                            {renderCheckboxes(day)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CARD 2: AUTO FREQUÊNCIA --- */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <FaCalendarCheck className={styles.icon}/>
                        <h3>Auto Frequência</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className={styles.formFrequencia}>
                        <div className={styles.frequenciaGrid}>
                            <div className={styles.inputGroup}>
                                <label>Manhã:</label>
                                <select className={styles.select} name="presenca_manha" value={frequencia.presenca_manha} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="P">Presente</option>
                                    <option value="F">Falta</option>
                                    <option value="FJ">Justificada</option>
                                    <option value="X">N/A</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Tarde:</label>
                                <select className={styles.select} name="presenca_tarde" value={frequencia.presenca_tarde} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="P">Presente</option>
                                    <option value="F">Falta</option>
                                    <option value="FJ">Justificada</option>
                                    <option value="X">N/A</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup} style={{flexGrow: 2}}>
                                <label>Justificativa:</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    name="justificativa"
                                    placeholder="Opcional..."
                                    value={frequencia.justificativa}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.actionRight}>
                            <Botao nome="Confirmar Presença" corFundo="#044D8C" corBorda="#043560" type="submit" comp="pequeno"/>
                        </div>
                    </form>
                </section>

                {/* --- CARD 3: ADMINISTRAÇÃO (Só para ADMs) --- */}
                {isAdm && (
                    <section className={`${styles.card} ${styles.cardAdmin}`}>
                        <div className={styles.cardHeader}>
                            <FaTools className={styles.icon}/>
                            <h3>Administração (Arquivo Morto)</h3>
                        </div>

                        {/* Atalhos de Gestão */}
                        <div className={styles.shortcutsSection}>
                            <div className={styles.shortcutsGrid}>
                                <Botao 
                                    nome="Alunos Desativados" 
                                    corFundo="#7EA629" 
                                    corBorda="#58751A" 
                                    onClick={() => navigate('/app/config/matriculasdesativadas/alunos')} 
                                />
                                <Botao 
                                    nome="Voluntários Desativados" 
                                    corFundo="#7EA629" 
                                    corBorda="#58751A" 
                                    onClick={() => navigate('/app/config/matriculasdesativadas/voluntarios')} 
                                />
                                <Botao 
                                    nome="Embaixadores" 
                                    corFundo="#f29f05" 
                                    corBorda="#8A6F3E" 
                                    onClick={() => navigate('/app/config/embaixadoresdesativados')} 
                                />
                                <Botao 
                                    nome="Amigos Melvin" 
                                    corFundo="#f29f05" 
                                    corBorda="#8A6F3E" 
                                    onClick={() => navigate('/app/config/amigosmelvindesativados')} 
                                />
                                <Botao 
                                    nome="Avisos" 
                                    corFundo="#C60108" 
                                    corBorda="#602929" 
                                    onClick={() => navigate('/app/config/avisosdesativados')} 
                                />
                            </div>
                        </div>
                    </section>
                )}

                <div className={styles.logoutSection}>
                    <Deslogar/>
                </div>
            </div>
        </div>
    )
}

export default Config;