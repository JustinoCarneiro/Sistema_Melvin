import styles from "./Config.module.scss";
import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from "react-icons/fa";
import Cookies from "js-cookie";

import get from "../../services/requests/get";
import put from "../../services/requests/put";
import post from "../../services/requests/post";

import Input from "../../components/gerais/Input";
import Botao from "../../components/gerais/Botao";
import Deslogar from "../../components/Deslogar";

function Config(){
    const [userData, setUserData] = useState(null);
    const [matricula, setMatricula] = useState('');
    const [novaSenhaAlterar, setNovaSenhaAlterar] = useState("");
    const [repetirSenhaAlterar, setRepetirSenhaAlterar] = useState("");
    const [senhaRegistrar, setSenhaRegistrar] = useState("");
    const [repetirSenhaRegistrar, setRepetirSenhaRegistrar] = useState("");
    const [divAtiva, setDivAtiva] = useState('');
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
                let matricula = Cookies.get('login');

                const response = await get.frequenciavoluntario(data, matricula);
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

        fetchFrequencia();
    }, [data]);
    

    useEffect(() => {
        async function fetchUserData() {

            const login = Cookies.get('login');

            if (!login) {
                console.error("Login não encontrado no cookie");
                return;
            }

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
        return <div>Carregando...</div>;
    }

    const weekDays = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const dayLabels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    const renderCheckboxes = (day) => {
        const availability = userData[day];

        const morningChecked = availability.includes("manha") || availability.includes("integral");
        const afternoonChecked = availability.includes("tarde") || availability.includes("integral");

        return (
            <>
                <label className={styles.label}>
                    Manhã
                    <div className={styles.checkbox} type="checkbox">
                        {morningChecked && <FaCheck className={styles.check} />}
                    </div>
                </label>
                <label className={styles.label}>
                    Tarde
                    <div className={styles.checkbox} type="checkbox">
                        {afternoonChecked && <FaCheck className={styles.check} />}
                    </div>
                </label>
            </>
        );
    };

    const handleRegistrar = async (e) => {
        e.preventDefault();
        if (senhaRegistrar !== repetirSenhaRegistrar) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            console.log("Matricula:", matricula, "Nova senha:", senhaRegistrar);

            const voluntario = await get.voluntarioByMatricula(matricula);

            const funcao = voluntario.data.funcao;

            let role;
            if(funcao === "coordenador"){
                role = "COOR";
            }else if(funcao === "professor"){
                role = "PROF";
            }else if(funcao === "auxiliar"){
                role = "AUX";
            }else if(funcao === "cozinheiro"){
                role = "COZI";
            }else if(funcao === "diretor"){
                role = "DIRE";
            }else if(funcao === "administrador"){
                role = "ADM";
            }else if(funcao === "marketing"){
                role = "MARK";
            }else if(funcao === "zelador"){
                role = "ZELA";
            }

            const login = matricula;
            const password = senhaRegistrar;

            const response = await post.registrarvoluntario({login, password, role});

            if (response && response.status === 200) {
                alert("voluntário registrado com sucesso!");
            } else {
                alert("Erro ao registrar voluntário.");
            }
        } catch (error) {
            console.error("Erro ao registrar voluntário:", error);
            alert("Erro ao registrar voluntário.");
        }
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        if (novaSenhaAlterar !== repetirSenhaAlterar) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            const response = await put.alterarsenha(matricula, novaSenhaAlterar);
            console.log("response:", response);
            if (response && response.status === 200) {
                alert("Senha alterada com sucesso!");
            } else {
                alert("Erro ao alterar a senha.");
            }
        } catch (error) {
            console.error("Erro ao alterar a senha:", error);
            alert("Erro ao alterar a senha.");
        }
    };

    const handleNavigateAlunos = () => {
        navigate('/app/config/matriculasdesativadas/alunos');
    };

    const handleNavigateVoluntarios = () => {
        navigate('/app/config/matriculasdesativadas/voluntarios');
    };

    const handleNavigateEmbaixadores = () => {
        navigate('/app/config/embaixadoresdesativados');
    }

    const handleNavigateAmigosMelvin = () => {
        navigate('/app/config/amigosmelvindesativados');
    }

    const handleNavigateAvisos = () => {
        navigate('/app/config/avisosdesativados');
    }

    const fields = {
        "Nome": "nome",
        "Contato": "contato",
        "Data de nascimento": "data",
        "Endereço": "endereco",
        "Bairro": "bairro",
        "Cidade": "cidade",
        "Email": "email",
        "Sexo": "sexo",
        "Cor/Raça": "cor",
        "RG/CPF": "rg",
        "Matrícula": "matricula"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const matricula = userData.matricula;
            const nome = userData.nome;
            const presenca_manha = frequencia.presenca_manha;
            const presenca_tarde = frequencia.presenca_tarde;
            const justificativa = frequencia.justificativa;

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
                    console.log("Teste dados::", matricula, nome, data, justificativa, presenca_manha, presenca_tarde);
                    const response = await post.frequenciavoluntario({ matricula, nome, data, justificativa, presenca_manha, presenca_tarde });
                    console.log('POST bem-sucedido:', response);
                    return response;
                } catch (error) {
                    console.error('5012:Erro capturado no POST:', error);
                    throw error;
                }
            }
        } catch(error) {
            console.error('5014:Erro ao marcar presença!', error);
            alert('Erro ao marcar presença!');
        }
    }

    return(
        <div className={styles.body}>
            <div className={styles.linha_vertical}></div>
            <div className={styles.container}>
                <h1 className={styles.title}>Configuração</h1>
                <hr className={styles.linha_menor}/>
                <h3 className={styles.subtitle}>Perfil</h3>
                <h4 className={styles.title_h4}>Informações pessoais</h4>
                <hr className={styles.linha_menor}/>
                <div className={styles.informacoes}>
                    <h4>Administrador</h4>
                    <div className={styles.colunas}>
                        <div className={styles.coluna}>
                            {["Nome", "Contato", "Data de nascimento", "Endereço", "Bairro", "Cidade"].map((field, index) => (
                                <div className={styles.linha} key={index}>
                                    <div className={styles.campo}>{field}</div>
                                    <div className={styles.conteudo}>{userData[fields[field]] || ''}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.coluna}>
                            {["Email", "Sexo", "Cor/Raça", "RG/CPF"].map((field, index) => (
                                <div className={styles.linha} key={index}>
                                    <div className={styles.campo}>{field}</div>
                                    <div className={styles.conteudo}>{userData[fields[field]] || ''}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.informacoes}>
                    <h4 className={styles.title_h4}>Institucional</h4>
                    <div className={styles.colunas}>
                        <div className={styles.coluna}>
                            {["Matrícula", "Contato"].map((field, index) => (
                                <div className={styles.linha} key={index}>
                                    <div className={styles.campo}>{field}</div>
                                    <div className={styles.conteudo}>{userData[fields[field]] || ''}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linha}>
                                <div className={styles.campo}>Função</div>
                                <div className={styles.conteudo}>{userData.funcao}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.semanal}>
                        <div className={styles.title_semana}>Dias semanais de voluntariado</div>
                        <div className={styles.semana}>
                            {weekDays.map((day, index) => (
                                <div className={styles.coluna_semana} key={index}>
                                    <div className={styles.title_coluna_semana}>{dayLabels[index]}</div>
                                    {renderCheckboxes(day)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {isAdm && (
                    <>
                        <hr className={styles.linha_maior}/>
                        <h3 className={styles.subtitle}>Autenticação</h3>
                        <h4 className={styles.title_h4}>Informações sobre autenticação de voluntário</h4>
                        <hr className={styles.linha_menor}/>
                        <div className={styles.informacoes}>
                            <div className={styles.autenticacao}>
                                <button onClick={() => setDivAtiva('registrar')}>Registrar voluntário</button>
                                <div className={styles.linha_auth}></div>
                                <button onClick={() => setDivAtiva('alterar_senha')}>Alterar senha de voluntário</button>
                            </div>
                            {divAtiva === 'registrar' && 
                                <div id="registrar">
                                    <form onSubmit={handleRegistrar} className={styles.forms_senha}>
                                        <Input 
                                            label="Matrícula"
                                            placeholder=""
                                            type="text"
                                            name="matricula"
                                            value={matricula}
                                            onChange={(e) => setMatricula(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Input 
                                            label="Senha"
                                            placeholder=""
                                            type="password"
                                            name="senhaRegistrar"
                                            value={senhaRegistrar}
                                            onChange={(e) => setSenhaRegistrar(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Input 
                                            label="Repita a senha"
                                            placeholder=""
                                            type="password"
                                            name="repetirSenhaRegistrar"
                                            value={repetirSenhaRegistrar}
                                            onChange={(e) => setRepetirSenhaRegistrar(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Botao 
                                            nome="Registrar"
                                            corFundo="#F29F05" 
                                            corBorda="#8A6F3E"
                                            comp="8rem"
                                            type="submit"
                                        />
                                    </form>
                                </div>
                            }
                            {divAtiva === 'alterar_senha' &&
                                <div id="alterar_senha">
                                    <form onSubmit={handleAlterarSenha} className={styles.forms_senha}>
                                        <Input 
                                            label="Matrícula"
                                            placeholder=""
                                            type="text"
                                            name="matricula"
                                            value={matricula}
                                            onChange={(e) => setMatricula(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Input 
                                            label="Nova senha"
                                            placeholder=""
                                            type="password"
                                            name="novaSenha"
                                            value={novaSenhaAlterar}
                                            onChange={(e) => setNovaSenhaAlterar(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Input 
                                            label="Repita a senha"
                                            placeholder=""
                                            type="password"
                                            name="repetirSenha"
                                            value={repetirSenhaAlterar}
                                            onChange={(e) => setRepetirSenhaAlterar(e.target.value)}
                                            comp="10rem"
                                            prioridade="false"
                                        />
                                        <Botao 
                                            nome="Alterar senha"
                                            corFundo="#F29F05" 
                                            corBorda="#8A6F3E"
                                            comp="8rem"
                                            type="submit"
                                        />
                                    </form>
                                </div>
                            }   
                        </div>
                        <hr className={styles.linha_maior}/>
                        <h3 className={styles.subtitle}>Pessoas desativadas</h3>
                        <h4 className={styles.title_h4}>Click no botão abaixo para acessar matrículas desativadas</h4>
                        <hr className={styles.linha_menor}/>
                        <div className={styles.botao}>
                            <Botao
                                nome="Alunos"
                                corFundo="#7EA629" 
                                corBorda="#58751A"
                                onClick={handleNavigateAlunos}
                            />
                            <Botao
                                nome="Voluntários"
                                corFundo="#044D8C" 
                                corBorda="#043560"
                                onClick={handleNavigateVoluntarios}
                            />
                        </div>
                        <hr className={styles.linha_maior}/>
                        <h3 className={styles.subtitle}>Solicitações</h3>
                        <h4 className={styles.title_h4}>Click no botão abaixo para acessar as solicitações</h4>
                        <hr className={styles.linha_menor}/>
                        <div className={styles.botao}>
                            <Botao
                                nome="Embaixadores"
                                corFundo="#f29f05" 
                                corBorda="#8A6F3E"
                                onClick={handleNavigateEmbaixadores}
                            />
                            <Botao
                                nome="Amigos Melvin"
                                corFundo="#044D8C" 
                                corBorda="#043560"
                                onClick={handleNavigateAmigosMelvin}
                            />
                        </div>
                        <hr className={styles.linha_maior}/>
                        <h3 className={styles.subtitle}>Avisos desativados</h3>
                        <hr className={styles.linha_menor}/>
                        <div className={styles.botao}>
                            <Botao
                                nome="Avisos"
                                corFundo="#f29f05" 
                                corBorda="#8A6F3E"
                                onClick={handleNavigateAvisos}
                            />
                        </div>
                    </>
                )}
                <hr className={styles.linha_maior}/>
                <h3 className={styles.subtitle}>Auto frequência</h3>
                <hr className={styles.linha_menor}/>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label_select}>
                        <div className={styles.sublabel_select}>Presença manhã:</div>
                        <select className={styles.select} name="presenca_manha" value={frequencia ? frequencia.presenca_manha : ''} onChange={handleChange}>
                            <option value="" hidden>Selecione...</option>
                            <option value="P">Presente</option>
                            <option value="F">Falta</option>
                            <option value="FJ">Falta Justificada</option>
                            <option value="X">Nenhuma</option>
                        </select>
                    </label>
                    <label className={styles.label_select}>
                        <div className={styles.sublabel_select}>Presença tarde:</div>
                        <select className={styles.select} name="presenca_tarde" value={frequencia ? frequencia.presenca_tarde : ''} onChange={handleChange}>
                            <option value="" hidden>Selecione...</option>
                            <option value="P">Presente</option>
                            <option value="F">Falta</option>
                            <option value="FJ">Falta Justificada</option>
                            <option value="X">Nenhuma</option>
                        </select>
                    </label>
                    <input
                        className={styles.input_justificativa}
                        type="text"
                        name="justificativa"
                        value={frequencia ? frequencia.justificativa : ''}
                        onChange={handleChange}
                    />
                    <div className={styles.botao_form}>
                        <Botao
                            nome="Marcar presença"
                            corFundo="#044D8C" 
                            corBorda="#043560"
                            type="submit"
                        />
                    </div>
                </form>
                <hr className={styles.linha_maior}/>
                <div className={styles.botao}>
                    <Deslogar/>
                </div>
            </div>
        </div>
    )
}

export default Config;