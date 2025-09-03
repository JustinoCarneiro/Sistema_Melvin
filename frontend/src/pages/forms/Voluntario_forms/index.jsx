import styles from './Voluntario_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdArrowRoundBack } from "react-icons/io";
 
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';
import del from '../../../services/requests/delete';

function Voluntario_forms({tipo}){
    const {matricula} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        matricula: '',
        nome: '',
        email: '',
        contato: '',
        sexo: '',
        data: '',
        cor: '',
        nacionalidade: '',
        endereco: '',
        bairro: '',
        cidade: '',
        rg: '',
        funcao: tipo || '',
        aulaExtra: '',
        salaUm: '',
        salaDois:'',
        segunda: '',
        terca: '',
        quarta: '',
        quinta: '',
        sexta: '',
        status: ''
    })
    
    useEffect(() => {
        const fetchVoluntario = async () => {
            setErrorMessage('');

            try {
                const voluntarioExistente = await get.voluntarioByMatricula(matricula);
                if (voluntarioExistente) {
                    const response = await get.voluntarioByMatricula(matricula);
                    if(response.data){
                        setFormDado({
                            matricula: response.data.matricula || '',
                            nome: response.data.nome || '',
                            email: response.data.email || '',
                            contato: response.data.contato || '',
                            sexo: response.data.sexo || '',
                            data: response.data.data || '',
                            cor: response.data.cor || '',
                            nacionalidade: response.data.nacionalidade || '',
                            endereco: response.data.endereco || '',
                            bairro: response.data.bairro || '',
                            cidade: response.data.cidade || '',
                            rg: response.data.rg || '',
                            funcao:  response.data.funcao || tipo || '',
                            aulaExtra: response.data.aulaExtra || '',
                            salaUm: response.data.salaUm || '',
                            salaDois: response.data.salaDois || '',
                            segunda: response.data.segunda || '',
                            terca: response.data.terca || '',
                            quarta: response.data.quarta || '',
                            quinta: response.data.quinta || '',
                            sexta: response.data.sexta || '',
                            status: response.data.status || '',
                        })
                    }
                } else {
                    console.log('Voluntario não encontrado');
                }
            } catch (error) {
                console.error('Erro ao buscar voluntário!', error);
                setErrorMessage(error.message || 'Não foi possível carregar os dados do voluntário.');
            }
        };
    
        fetchVoluntario();
    }, [matricula]);

    const handleRoleChange = async novaFuncao => {
        let novaRole = '';
    
        switch (novaFuncao) {
            case 'coordenador':
                novaRole = 'COOR';
                break;
            case 'professor':
                novaRole = 'PROF';
                break;
            case 'auxiliar':
                novaRole = 'AUX';
                break;
            case 'cozinheiro':
                novaRole = 'COZI';
                break;
            case 'administrador':
                novaRole = 'ADM';
                break;
            case 'marketing':
                novaRole = 'MARK';
                break;
            case 'zelador':
                novaRole = 'ZELA';
                break;
            case 'diretor':
                novaRole = 'DIRE';
                break;
            default:
                novaRole = '';
        }
    
        if (novaRole) {
            try {
                await put.alterarRole(formDado.matricula, novaRole);
                setFormDado(prevData => ({
                    ...prevData,
                    funcao: novaFuncao,
                }));
            } catch (error) {
                console.error('Erro ao alterar função do voluntário!', error);
                alert('Erro ao alterar função do voluntário!');
            }
        }
    };


    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormDado((prevData) => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'funcao') {
            handleRoleChange(value);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            let response;

            if (formDado.status === 'deletar') {
                const confirmar = window.confirm('Você realmente deseja deletar este registro? Esta ação não pode ser desfeita.');
        
                if (confirmar) {
                    // Executar o método de deleção do discente
                    await del.voluntario(matricula);
    
                    alert('Registro deletado com sucesso!');
                    navigate(-1);
                    return;
                } else {
                    // Se o usuário cancelar a exclusão, apenas retorne
                    return;
                }
            }

            const voluntarioExistente = await get.voluntarioByMatricula(matricula);

            if (voluntarioExistente && voluntarioExistente.data) {
                console.log("Matrícula já existe. Atualizando dados...");
                console.log("formDado", formDado);
                response = await put.voluntario(formDado);
            } else {
                console.log("Matrícula não existe. Criando novo aluno...");
                response = await post.voluntario(formDado);
            }

            if (response.error) {
                throw new Error(response.error.message);
            }
            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar voluntário!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar. Verifique os dados e tente novamente.');
        }
    };
    
    return(
        <div className={styles.body}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES PESSOAIS DO VOLUNTÁRIO</h2>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Nome:"
                            type="text"
                            placeholder="Nome completo"
                            name="nome"
                            value={formDado.nome}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Contato:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato"
                                value={formDado.contato}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                            <Input
                                label="Data de nascimento:"
                                type="date"
                                placeholder="DD/MM/AAAA"
                                name="data"
                                value={formDado.data}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                        </div>
                        <Input
                            label="Endereço:"
                            type="text"
                            placeholder=""
                            name="endereco"
                            value={formDado.endereco}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Bairro:"
                                type="text"
                                placeholder=""
                                name="bairro"
                                value={formDado.bairro}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                            <Input
                                label="Cidade:"
                                type="text"
                                placeholder=""
                                name="cidade"
                                value={formDado.cidade}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                        </div>
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Sexo:</div>
                                <select className={styles.select} name="sexo" value={formDado.sexo} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </label>
                            <Input
                                label="Nacionalidade:"
                                type="text"
                                placeholder=""
                                name="nacionalidade"
                                value={formDado.nacionalidade}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <Input
                            label="Cor/Raça:"
                            type="text"
                            placeholder=""
                            name="cor"
                            value={formDado.cor}
                            onChange={handleChange}
                            comp="pequeno"
                            prioridade=""
                        />
                        <Input
                            label="RG ou CPF:"
                            type="text"
                            placeholder=""
                            name="rg"
                            value={formDado.rg}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <Input
                            label="Email:"
                            type="email"
                            placeholder=""
                            name="email"
                            value={formDado.email}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="false"
                        />
                    </div>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES INSTITUCIONAIS</h2>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Situação matrícula:<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="status" value={formDado.status} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                    <option value="deletar">Deletar</option>
                                    <option value="espera">Em espera...</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Função:<p className={styles.asterisco}>*</p></div>
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
                                </select>
                            </label>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Aula extra:</div>
                                <select className={styles.select} name="aulaExtra" value={formDado.aulaExtra} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
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
                            </label>
                        </div>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Primeira sala:</div>
                                <select className={styles.select} name="salaUm" value={formDado.salaUm} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="">Nenhuma</option>
                                    <option value="1">Sala 1</option>
                                    <option value="2">Sala 2</option>
                                    <option value="3">Sala 3</option>
                                    <option value="4">Sala 4</option>
                                </select>
                            </label>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Segunda sala:</div>
                                <select className={styles.select} name="salaDois" value={formDado.salaDois} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="">Nenhuma</option>
                                    <option value="1">Sala 1</option>
                                    <option value="2">Sala 2</option>
                                    <option value="3">Sala 3</option>
                                    <option value="4">Sala 4</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={styles.turnos}>
                    <div className={styles.label_turnos}>Dias semanais de volutariado:</div>
                    <div className={styles.container}>
                        <div className={styles.dia}>
                            <label className={styles.label_select_semana}>
                                <div className={styles.sublabel_select_semana}>Segunda:</div>
                                <select className={styles.select_semana} name="segunda" value={formDado.segunda} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dia}>
                            <label className={styles.label_select_semana}>
                                <div className={styles.sublabel_select_semana}>Terça:</div>
                                <select className={styles.select_semana} name="terca" value={formDado.terca} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dia}>
                            <label className={styles.label_select_semana}>
                                <div className={styles.sublabel_select_semana}>Quarta:</div>
                                <select className={styles.select_semana} name="quarta" value={formDado.quarta} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dia}>
                            <label className={styles.label_select_semana}>
                                <div className={styles.sublabel_select_semana}>Quinta:</div>
                                <select className={styles.select_semana} name="quinta" value={formDado.quinta} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dia}>
                            <label className={styles.label_select_semana}>
                                <div className={styles.sublabel_select_semana}>Sexta:</div>
                                <select className={styles.select_semana} name="sexta" value={formDado.sexta} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="integral">Integral</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="nenhum">Nenhum</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={styles.cadastrar}>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                    <Botao 
                        nome="Salvar" 
                        corFundo="#F29F05" 
                        corBorda="#8A6F3E" 
                        comp="pequeno"
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )
}

export default Voluntario_forms;