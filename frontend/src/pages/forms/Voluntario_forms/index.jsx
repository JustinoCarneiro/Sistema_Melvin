import styles from './Voluntario_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";

import { IoMdArrowRoundBack } from "react-icons/io";
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';
import del from '../../../services/requests/delete';
import auth from '../../../services/auth';

function Voluntario_forms(){
    const {matricula} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [isAdm, setIsAdm] = useState(false);

    // Estados para senha
    const [senhaAcesso, setSenhaAcesso] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [formDado, setFormDado] = useState({
        matricula: '', nome: '', email: '', contato: '', sexo: '', data: '', cor: '', nacionalidade: '', endereco: '', bairro: '', cidade: '', rg: '', funcao: '', aulaExtra: '', salaUm: '', salaDois:'', segunda: '', terca: '', quarta: '', quinta: '', sexta: '', status: ''
    });
    
    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsAdm(userRole === 'ADM');

        const fetchVoluntario = async () => {
            setErrorMessage('');
            if (!matricula) return;

            try {
                const response = await get.voluntarioByMatricula(matricula);
                if(response.data){
                    setFormDado(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Erro ao buscar voluntário!', error);
                setErrorMessage('Não foi possível carregar os dados do voluntário.');
            }
        };
        fetchVoluntario();
    }, [matricula]);

    const getRoleFromFuncao = (funcao) => {
        const f = funcao ? funcao.trim().toLowerCase() : "";
        const roles = {
            'coordenador': 'COOR', 'professor': 'PROF', 'auxiliar': 'AUX', 'cozinheiro': 'COZI',
            'administrador': 'ADM', 'marketing': 'MARK', 'zelador': 'ZELA', 'diretor': 'DIRE',
            'psicologo': 'PSICO', 'assistente': 'ASSIST'
        };
        return roles[f] || null;
    };

    const handleRoleChange = async novaFuncao => {
        const novaRole = getRoleFromFuncao(novaFuncao);
        if (novaRole && formDado.matricula) {
            try {
                await put.alterarRole(formDado.matricula, novaRole);
                setFormDado(prev => ({ ...prev, funcao: novaFuncao }));
            } catch (error) { console.error(error); }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDado(prev => ({ ...prev, [name]: value }));
        if (name === 'funcao' && matricula) handleRoleChange(value);
    };

    const handleCriarAcesso = async () => {
        if (!senhaAcesso || senhaAcesso !== confirmarSenha) return alert("As senhas não coincidem!");
        const role = getRoleFromFuncao(formDado.funcao);
        if (!role) return alert(`A função "${formDado.funcao}" não tem perfil de acesso.`);

        try {
            const response = await auth.registrar({ login: formDado.matricula, password: senhaAcesso, role: role });
            if (response?.status === 200) {
                alert("Acesso criado!");
                setSenhaAcesso(''); setConfirmarSenha('');
            }
        } catch (error) { alert("Erro ao criar acesso. Usuário já existe?"); }
    };

    const handleRedefinirSenha = async () => {
        if (!senhaAcesso || senhaAcesso !== confirmarSenha) return alert("As senhas não coincidem!");
        try {
            const response = await put.alterarsenha(formDado.matricula, senhaAcesso);
            if (response?.status === 200) {
                alert("Senha redefinida!");
                setSenhaAcesso(''); setConfirmarSenha('');
            }
        } catch (error) { alert("Erro ao redefinir senha."); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            let response;
            if (formDado.status === 'deletar') {
                if(window.confirm('Deseja realmente deletar este voluntário?')) {
                    await del.voluntario(matricula);
                    alert('Deletado com sucesso!');
                    navigate('/app/voluntarios');
                    return;
                } else return;
            }

            if (matricula) {
                response = await put.voluntario(formDado);
            } else {
                response = await post.voluntario(formDado);
            }

            if (response.error) throw new Error(response.error.message);
            alert('Salvo com sucesso!');
            
            if (!matricula && response.data?.matricula) {
                 navigate(`/app/voluntario/editar/${response.data.matricula}`);
            } else {
                 navigate('/app/voluntarios');
            }
        } catch (error) {
            setErrorMessage(error.message || 'Erro ao salvar.');
        }
    };
    
    return(
        <div className={styles.body}>
            <div className={styles.container}>
                {/* --- HEADER --- */}
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate('/app/voluntarios')}/>
                    <h2 className={styles.titlePage}>
                        {matricula ? `Editar Voluntário (${matricula})` : "Novo Voluntário"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- PESSOAL --- */}
                    <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome Completo:" name="nome" value={formDado.nome} onChange={handleChange} comp="grande" prioridade="true" />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Contato:" name="contato" value={formDado.contato} onChange={handleChange} comp="pequeno" placeholder="(00) 00000-0000" />
                                <Input label="Data Nasc.:" type="date" name="data" value={formDado.data} onChange={handleChange} comp="pequeno" />
                            </div>
                            
                            <Input label="Endereço:" name="endereco" value={formDado.endereco} onChange={handleChange} comp="grande" />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Bairro:" name="bairro" value={formDado.bairro} onChange={handleChange} comp="pequeno" />
                                <Input label="Cidade:" name="cidade" value={formDado.cidade} onChange={handleChange} comp="pequeno" />
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Sexo:</label>
                                    <select className={styles.select} name="sexo" value={formDado.sexo} onChange={handleChange}>
                                        <option value="" hidden>...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                    </select>
                                </div>
                                <Input label="Nacionalidade:" name="nacionalidade" value={formDado.nacionalidade} onChange={handleChange} comp="pequeno" />
                            </div>

                            <Input label="Cor/Raça:" name="cor" value={formDado.cor} onChange={handleChange} comp="pequeno" />
                            <Input label="RG ou CPF:" name="rg" value={formDado.rg} onChange={handleChange} comp="grande" />
                            <Input label="Email:" type="email" name="email" value={formDado.email} onChange={handleChange} comp="grande" prioridade="false" />
                        </div>
                    </div>

                    {/* --- INSTITUCIONAL --- */}
                    <h3 className={styles.sectionTitle}>Informações Institucionais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <div className={styles.inputGroup}>
                                <label>Situação: <span className={styles.required}>*</span></label>
                                <select className={styles.select} name="status" value={formDado.status} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                    <option value="deletar">Deletar</option>
                                    <option value="espera">Em espera...</option>
                                </select>
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>Função: <span className={styles.required}>*</span></label>
                                <select className={styles.select} name="funcao" value={formDado.funcao} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="diretor">Diretoria</option>
                                    <option value="coordenador">Coordenador</option>
                                    <option value="professor">Professor</option>
                                    <option value="auxiliar">Auxiliar</option>
                                    <option value="administrador">Administração</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="zelador">Zeladoria</option>
                                    <option value="cozinheiro">Cozinheiro</option>
                                    <option value="psicologo">Psicólogo</option>
                                    <option value="assistente">Assistente Social</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.inputGroup}>
                                <label>Aula Extra (Professores):</label>
                                <select className={styles.select} name="aulaExtra" value={formDado.aulaExtra} onChange={handleChange}>
                                    <option value="">Nenhuma</option>
                                    <option value="5">Inglês</option>
                                    <option value="6">Karatê</option>
                                    <option value="7">Informática</option>
                                    <option value="8">Teatro</option>
                                    <option value="9">Ballet</option>
                                    <option value="10">Música</option>
                                    <option value="11">Futsal</option>
                                    <option value="12">Artesanato</option>
                                </select>
                            </div>

                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Sala 1:</label>
                                    <select className={styles.select} name="salaUm" value={formDado.salaUm} onChange={handleChange}>
                                        <option value="">Nenhuma</option>
                                        <option value="1">Sala 1</option>
                                        <option value="2">Sala 2</option>
                                        <option value="3">Sala 3</option>
                                        <option value="4">Sala 4</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Sala 2:</label>
                                    <select className={styles.select} name="salaDois" value={formDado.salaDois} onChange={handleChange}>
                                        <option value="">Nenhuma</option>
                                        <option value="1">Sala 1</option>
                                        <option value="2">Sala 2</option>
                                        <option value="3">Sala 3</option>
                                        <option value="4">Sala 4</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- DIAS DE VOLUNTARIADO --- */}
                    <h3 className={styles.sectionTitle}>Dias de Voluntariado</h3>
                    <div className={styles.turnosContainer}>
                        {['segunda', 'terca', 'quarta', 'quinta', 'sexta'].map(dia => (
                            <div key={dia} className={styles.inputGroup}>
                                <label style={{textTransform: 'capitalize'}}>{dia}:</label>
                                <select className={styles.select} name={dia} value={formDado[dia]} onChange={handleChange}>
                                    <option value="" hidden>...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* --- LOGIN (ADM ONLY) --- */}
                    {isAdm && matricula && (
                        <div className={styles.loginSection}>
                            <h3 className={styles.loginTitle}>Acesso ao Sistema</h3>
                            <p className={styles.loginDesc}>
                                Crie ou redefina a senha para o usuário <strong>{matricula}</strong>.
                            </p>
                            
                            <div className={styles.gridContainer}>
                                <Input label="Nova Senha:" type="password" name="senhaAcesso" value={senhaAcesso} onChange={(e) => setSenhaAcesso(e.target.value)} comp="grande" />
                                <Input label="Confirmar Senha:" type="password" name="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} comp="grande" />
                            </div>
                            
                            <div className={styles.loginButtons}>
                                <Botao nome="Criar Acesso" corFundo="#044D8C" corBorda="#043560" type="button" onClick={handleCriarAcesso} />
                                <Botao nome="Redefinir Senha" corFundo="#F29F05" corBorda="#8A6F3E" type="button" onClick={handleRedefinirSenha} />
                            </div>
                        </div>
                    )}

                    {/* --- FOOTER --- */}
                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        <Botao nome="Salvar Dados" corFundo="#7EA629" corBorda="#58751A" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Voluntario_forms;