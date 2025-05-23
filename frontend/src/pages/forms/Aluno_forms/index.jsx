import styles from './Aluno_forms.module.scss';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdArrowRoundBack, IoIosDownload } from "react-icons/io";
import { SiGoogledocs } from "react-icons/si";

 
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';
import del from '../../../services/requests/delete';


function Aluno_forms(){
    const {matricula} = useParams();
    const navigate = useNavigate();
    const [diario, setDiario] = useState(null);

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
        sala: '',
        turno: '',
        nome_pai: '',
        contato_pai: '',
        instrucao_pai: '',
        ocupacao_pai: '',
        local_trabalho_pai: '',
        contato_trabalho_pai: '',
        alfabetizacao_pai: '',
        estado_civil_pai: '',
        nome_mae: '',
        contato_mae: '',
        instrucao_mae: '',
        ocupacao_mae: '',
        local_trabalho_mae: '',
        contato_trabalho_mae: '',
        alfabetizacao_mae: '',
        estado_civil_mae: '',
        qtd_filho: '',
        beneficio_governo: '',
        meio_transporte: '',
        qtd_transporte: '',
        mora_familiar: '',
        outro_familiar: '',
        todos_moram_casa: '',
        renda_total: '',
        clt: '',
        autonomo: '',
        familia_congrega: '',
        gostaria_congregar: '',
        doenca: '',
        medicacao: '',
        remedio_instituto: '',
        tratamento: '',
        horario_medicamento: '',
        esportes: '',
        saida_aluno: '',
        contato_saida: '',
        status: '',
        karate: false, 
        ballet: false,
        informatica: false,
        musica: false,
        artesanato: false,
        futsal: false, 
        ingles: false
    });

    useEffect(() => {
        const fetchAluno = async () => {
            try {
                const diarioExistente = await get.diarioByMatricula(matricula);

                if(diarioExistente && diarioExistente.data != ""){
                    console.log("Diario existente", diarioExistente);
                    setDiario(diarioExistente);
                }

                const response = await get.discenteByMatricula(matricula);
                console.log("reponse:", response);
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
                        sala: response.data.sala || '',
                        turno: response.data.turno || '',
                        nome_pai: response.data.nome_pai || '',
                        contato_pai: response.data.contato_pai || '',
                        instrucao_pai: response.data.instrucao_pai || '',
                        ocupacao_pai: response.data.ocupacao_pai || '',
                        local_trabalho_pai: response.data.local_trabalho_pai || '',
                        contato_trabalho_pai: response.data.contato_trabalho_pai || '',
                        alfabetizacao_pai: response.data.alfabetizacao_pai || '',
                        estado_civil_pai: response.data.estado_civil_pai || '',
                        nome_mae: response.data.nome_mae || '',
                        contato_mae: response.data.contato_mae || '',
                        instrucao_mae: response.data.instrucao_mae || '',
                        ocupacao_mae: response.data.ocupacao_mae || '',
                        local_trabalho_mae: response.data.local_trabalho_mae || '',
                        contato_trabalho_mae: response.data.contato_trabalho_mae || '',
                        alfabetizacao_mae: response.data.alfabetizacao_mae || '',
                        estado_civil_mae: response.data.estado_civil_mae || '',
                        qtd_filho: response.data.qtd_filho || '',
                        beneficio_governo: response.data.beneficio_governo || '',
                        meio_transporte: response.data.meio_transporte || '',
                        qtd_transporte: response.data.qtd_transporte || '',
                        mora_familiar: response.data.mora_familiar || '',
                        outro_familiar: response.data.outro_familiar || '',
                        todos_moram_casa: response.data.todos_moram_casa || '',
                        renda_total: response.data.renda_total || '',
                        clt: response.data.clt || '',
                        autonomo: response.data.autonomo || '',
                        familia_congrega: response.data.familia_congrega || '',
                        gostaria_congregar: response.data.gostaria_congregar || '',
                        doenca: response.data.doenca || '',
                        medicacao: response.data.medicacao || '',
                        remedio_instituto: response.data.remedio_instituto || '',
                        tratamento: response.data.tratamento || '',
                        horario_medicamento: response.data.horario_medicamento || '',
                        esportes: response.data.esportes || '',
                        saida_aluno: response.data.saida_aluno || '',
                        contato_saida: response.data.contato_saida || '',
                        status: response.data.status || '',
                        karate: response.data.karate || false,
                        ballet: response.data.ballet || false,
                        informatica: response.data.informatica || false,
                        musica: response.data.musica || false,
                        artesanato: response.data.artesanato || false,
                        futsal: response.data.futsal || false,
                        ingles: response.data.ingles || false
                    });
                } else {
                    console.log('Aluno não encontrado');
                }
            } catch (error) {
                console.error('5002:Erro ao obter dados do aluno!', error);

                // Verificar se o erro tem uma resposta e pegar o texto ou JSON
                if (error.response) {
                    const errorMessage = error.response.data ? JSON.stringify(error.response.data) : error.response.statusText;
                    console.error(`Erro ao obter dados do aluno: ${errorMessage}`);
                    alert(`Erro ao obter dados do aluno: ${errorMessage}`);
                } else {
                    alert('Erro ao obter dados do aluno!');
                }
            }
        };
    
        fetchAluno();
    }, [matricula]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormDado(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const onDrop = (acceptedFiles) => {
        console.log('Files dropped:', acceptedFiles);
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setDiario(file);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            let responseDiario;

            if (formDado.status === 'deletar') {
                const confirmar = window.confirm('Você realmente deseja deletar este registro? Esta ação não pode ser desfeita.');
        
                if (confirmar) {
                    // Executar o método de deleção do discente
                    await del.discente(matricula);
                    
                    // Tentar deletar o diário, mas sem impedir a exclusão do discente se o diário não existir
                    try {
                        await del.diario(matricula);
                    } catch (error) {
                        console.warn(`Diário não encontrado para a matrícula: ${matricula}. Prosseguindo com a exclusão do discente.`);
                    }
    
                    alert('Registro deletado com sucesso!');
                    navigate(-1);
                    return;
                } else {
                    // Se o usuário cancelar a exclusão, apenas retorne
                    return;
                }
            }

            const alunoExistente = await get.discenteByMatricula(matricula);

            if (alunoExistente && alunoExistente.data) {
                console.log("Matrícula já existe. Atualizando dados...");
                response = await put.discente(formDado);

                if (diario && diario instanceof File) {
                    responseDiario = await put.atualizarDiario({ matricula: response.data.matricula, file: diario });
                }
            } else {
                console.log("Matrícula não existe. Criando novo aluno...");
                response = await post.discente(formDado);

                if(diario && diario instanceof File){
                    responseDiario = await post.uploadDiario({ matricula: response.data.matricula, file: diario });
                }
            }

            if (response.error) {
                throw new Error(response.error.message);
            }
            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('5001:Erro ao salvar!', error);

            if (error.response) {
                // Verificar se a resposta é um texto simples ou JSON
                let errorMessage;
                try {
                    errorMessage = JSON.parse(error.response.data);
                } catch (e) {
                    // Se der erro ao fazer o parse, considerar que é um texto simples
                    errorMessage = error.response.data;
                }

                console.error(`Erro ao salvar: ${errorMessage}`);
                alert(`Erro ao salvar: ${errorMessage}`);
            } else {
                alert('Erro ao salvar!');
            }
        }
    };

    const handleDownload = async(e) => {
        e.preventDefault();
        try{
            if (diario) {
                console.log("Diario", diario);
                const filename = diario.data.fileName || diario.name
                await get.downloadFile(matricula, filename);
            }
        }catch(error){
            console.error('5001:Erro ao baixar arquivo!', error);
            alert('Erro ao baixar arquivo!');
        }
    };

    const handleRedimentoClick = () => {
        navigate(`/app/rendimento_aluno/${matricula}`);
    };

    return(
        <div className={styles.body}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.botao}>
                    <Botao 
                        nome="Rendimento" 
                        corFundo="#7EA629" 
                        corBorda="#58751A" 
                        type="button"
                        onClick={handleRedimentoClick}
                    />
                </div>
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES PESSOAIS DO ALUNO</h2>
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
                                prioridade=""
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
                            label="N° certidão de nascimento, RG ou CPF:"
                            type="text"
                            placeholder=""
                            name="rg"
                            value={formDado.rg}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
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
                                    <option value="true">Ativa</option>
                                    <option value="false">Inativa</option>
                                    <option value="deletar">Deletar</option>
                                    <option value="espera">Em espera...</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Sala:<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="sala" value={formDado.sala} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </label>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Turno no instituto:<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="turno" value={formDado.turno} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="manha">Manhã</option>
                                    <option value="tarde">Tarde</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES FAMILIARES</h2>
                <h3 className={styles.subtitle}>PAI:</h3>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Nome do pai:"
                            type="text"
                            placeholder=""
                            name="nome_pai"
                            value={formDado.nome_pai}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Ocupação:"
                                type="text"
                                placeholder=""
                                name="ocupacao_pai"
                                value={formDado.ocupacao_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Contato do trabalho:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato_trabalho_pai"
                                value={formDado.contato_trabalho_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <Input
                            label="Local do trabalho:"
                            type="text"
                            placeholder=""
                            name="local_trabalho_pai"
                            value={formDado.local_trabalho_pai}
                            onChange={handleChange}
                            comp="grande"
                        />
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <Input
                                label="Contato:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato_pai"
                                value={formDado.contato_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Grau de instrução:"
                                type="text"
                                placeholder=""
                                name="instrucao_pai"
                                value={formDado.instrucao_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <div className={styles.linha}>
                            <Input
                                label="Alfabetização:"
                                type="text"
                                placeholder=""
                                name="alfabetizacao_pai"
                                value={formDado.alfabetizacao_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Estado civil:"
                                type="text"
                                placeholder=""
                                name="estado_civil_pai"
                                value={formDado.estado_civil_pai}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                    </div>
                </div>
                <h3 className={styles.subtitle}>MÃE:</h3>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Nome da mãe:"
                            type="text"
                            placeholder=""
                            name="nome_mae"
                            value={formDado.nome_mae}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Ocupação:"
                                type="text"
                                placeholder=""
                                name="ocupacao_mae"
                                value={formDado.ocupacao_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Contato do trabalho:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato_trabalho_mae"
                                value={formDado.contato_trabalho_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <Input
                            label="Local do trabalho:"
                            type="text"
                            placeholder=""
                            name="local_trabalho_mae"
                            value={formDado.local_trabalho_mae}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <Input
                                label="Contato:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato_mae"
                                value={formDado.contato_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Grau de instrução:"
                                type="text"
                                placeholder=""
                                name="instrucao_mae"
                                value={formDado.instrucao_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <div className={styles.linha}>
                            <Input
                                label="Alfabetização:"
                                type="text"
                                placeholder=""
                                name="alfabetizacao_mae"
                                value={formDado.alfabetizacao_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Estado civil:"
                                type="text"
                                placeholder=""
                                name="estado_civil_mae"
                                value={formDado.estado_civil_mae}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                    </div>
                </div>
                <h3 className={styles.subtitle}>FAMÍLIA:</h3>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <Input
                                label="Quantos filhos além do aluno:"
                                type="text"
                                placeholder=""
                                name="qtd_filho"
                                value={formDado.qtd_filho}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Benefício do governo:"
                                type="text"
                                placeholder=""
                                name="beneficio_governo"
                                value={formDado.beneficio_governo}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <div className={styles.linha}>
                            <Input
                                label="O aluno mora atualmente com qual familiar?"
                                type="text"
                                placeholder=""
                                name="mora_familiar"
                                value={formDado.mora_familiar}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Em caso de outro:"
                                type="text"
                                placeholder=""
                                name="outro_familiar"
                                value={formDado.outro_familiar}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <div className={styles.linha}>
                            <Input
                                label="Todos moram na mesma residência?"
                                type="text"
                                placeholder=""
                                name="todos_moram_casa"
                                value={formDado.todos_moram_casa}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Renda total da família:"
                                type="text"
                                placeholder=""
                                name="renda_total"
                                value={formDado.renda_total}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <Input
                                label="Meio de transporte da família:"
                                type="text"
                                placeholder=""
                                name="meio_transporte"
                                value={formDado.meio_transporte}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Quantidade:"
                                type="text"
                                placeholder=""
                                name="qtd_transporte"
                                value={formDado.qtd_transporte}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <label >
                            <p className={styles.label_qtd_clt_auto}>Quantas pessoas trabalham na casa?</p>
                            <div className={styles.linha}>
                                <Input
                                    label="Carteira assinada:"
                                    type="text"
                                    placeholder=""
                                    name="clt"
                                    value={formDado.clt}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade=""
                                />
                                <Input
                                    label="Autônomo:"
                                    type="text"
                                    placeholder=""
                                    name="autonomo"
                                    value={formDado.autonomo}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade=""
                                />
                            </div>
                        </label>
                        <div className={styles.linha}>
                            <Input
                                label="Família congrega em alguma igreja?"
                                type="text"
                                placeholder=""
                                name="familia_congrega"
                                value={formDado.familia_congrega}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Gostaria de congregar?"
                                type="text"
                                placeholder=""
                                name="gostaria_congregar"
                                value={formDado.gostaria_congregar}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                    </div>
                </div>
                <h2 className={styles.title}>OUTRAS INFORMAÇÕES</h2>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Aluno possui alguma doença?"
                            type="text"
                            placeholder=""
                            name="doenca"
                            value={formDado.doenca}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <Input
                            label="Precisa tomar remédio no instituto?"
                            type="text"
                            placeholder=""
                            name="remedio_instituto"
                            value={formDado.remedio_instituto}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Horário do medicamento:"
                                type="time"
                                placeholder=""
                                name="horario_medicamento"
                                value={formDado.horario_medicamento}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="false"
                            />
                            <Input
                                label="Pode praticar esportes?"
                                type="text"
                                placeholder=""
                                name="esportes"
                                value={formDado.esportes}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                        <div className={styles.aulas_extras}>
                            <div className={styles.label_aulas}>Aulas extras:</div>
                            <div className={styles.container}>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Karatê:</div>
                                        <input
                                            type="checkbox"
                                            name="karate"
                                            checked={formDado.karate === true}
                                            onChange={(e) => setFormDado({ ...formDado, karate: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Ballet:</div>
                                        <input
                                            type="checkbox"
                                            name="ballet"
                                            checked={formDado.ballet === true}
                                            onChange={(e) => setFormDado({ ...formDado, ballet: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Informática:</div>
                                        <input
                                            type="checkbox"
                                            name="informatica"
                                            checked={formDado.informatica === true}
                                            onChange={(e) => setFormDado({ ...formDado, informatica: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Música:</div>
                                        <input
                                            type="checkbox"
                                            name="musica"
                                            checked={formDado.musica === true}
                                            onChange={(e) => setFormDado({ ...formDado, musica: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Artesanato:</div>
                                        <input
                                            type="checkbox"
                                            name="artesanato"
                                            checked={formDado.artesanato === true}
                                            onChange={(e) => setFormDado({ ...formDado, artesanato: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Futsal:</div>
                                        <input
                                            type="checkbox"
                                            name="futsal"
                                            checked={formDado.futsal === true}
                                            onChange={(e) => setFormDado({ ...formDado, futsal: e.target.checked })}
                                        />
                                    </label>
                                </div>
                                <div className={styles.aula}>
                                    <label className={styles.label_select_aula}>
                                        <div className={styles.sublabel_select_aula}>Inglês:</div>
                                        <input
                                            type="checkbox"
                                            name="ingles"
                                            checked={formDado.ingles === true}
                                            onChange={(e) => setFormDado({ ...formDado, ingles: e.target.checked })}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.diario}>
                            Diário de acompanhamento:
                            <div className={styles.container_diario}>
                                <label className={styles.label_diario}>
                                    <div {...getRootProps({ className: styles.dropzone })}>
                                        <input {...getInputProps()} />
                                        {diario ? (
                                            <p className={styles.placeholderdiario}>{diario.name || diario.data.fileName}</p>
                                        ) : (
                                            <p className={styles.placeholderdiario}>Adicione o arquivo aqui...</p>
                                        )}
                                        <SiGoogledocs/>
                                    </div>
                                </label>
                                {diario &&(
                                    <IoIosDownload className={styles.download} onClick={handleDownload}/>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.coluna}>
                        <Input
                            label="Toma alguma medicação?"
                            type="text"
                            placeholder=""
                            name="medicacao"
                            value={formDado.medicacao}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <Input
                            label="Faz algum tipo de tratamento?"
                            type="text"
                            placeholder=""
                            name="tratamento"
                            value={formDado.tratamento}
                            onChange={handleChange}
                            comp="grande"
                            prioridade=""
                        />
                        <div className={styles.linha}>
                            <Input
                                label="Saída do aluno:"
                                type="text"
                                placeholder=""
                                name="saida_aluno"
                                value={formDado.saida_aluno}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                            <Input
                                label="Contato:"
                                type="text"
                                placeholder=""
                                name="contato_saida"
                                value={formDado.contato_saida}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade=""
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.cadastrar}>
                    <Botao
                        nome="Salvar" 
                        corFundo="#F29F05" 
                        corBorda="#8A6F3E" 
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )
}

export default Aluno_forms;