import styles from './Aluno_forms.module.scss';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';

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
    const [errorMessage, setErrorMessage] = useState('');
    const [isPsico, setIsPsico] = useState(false);

    // Estado completo com TODOS os campos originais
    const [formDado, setFormDado] = useState({
        matricula: '', nome: '', email: '', contato: '', sexo: '', data: '', cor: '', nacionalidade: '', 
        endereco: '', bairro: '', cidade: '', rg: '', sala: '', turno: '', 
        nome_pai: '', contato_pai: '', instrucao_pai: '', ocupacao_pai: '', local_trabalho_pai: '', contato_trabalho_pai: '', alfabetizacao_pai: '', estado_civil_pai: '', 
        nome_mae: '', contato_mae: '', instrucao_mae: '', ocupacao_mae: '', local_trabalho_mae: '', contato_trabalho_mae: '', alfabetizacao_mae: '', estado_civil_mae: '', 
        qtd_filho: '', beneficio_governo: '', meio_transporte: '', qtd_transporte: '', mora_familiar: '', outro_familiar: '', todos_moram_casa: '', renda_total: '', clt: '', autonomo: '', familia_congrega: '', gostaria_congregar: '', 
        doenca: '', medicacao: '', remedio_instituto: '', tratamento: '', horario_medicamento: '', esportes: '', saida_aluno: '', contato_saida: '', status: '',
        karate: false, ballet: false, informatica: false, musica: false, artesanato: false, futsal: false, ingles: false
    });

    useEffect(() => {
        const userRole = Cookies.get('role');
        setIsPsico(userRole === 'PSICO');
    }, []);

    useEffect(() => {
        const fetchAluno = async () => {
            setErrorMessage(''); 
            if(!matricula) return;

            try {
                const diarioExistente = await get.diarioByMatricula(matricula);
                if(diarioExistente && diarioExistente.data != ""){
                    setDiario(diarioExistente);
                }

                const response = await get.discenteByMatricula(matricula);
                if(response.data){
                    setFormDado(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Erro ao obter dados:', error);
                setErrorMessage('Não foi possível carregar os dados do aluno.');
            }
        };
        fetchAluno();
    }, [matricula]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormDado(prevState => ({ ...prevState, [name]: value }));
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setDiario(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            let response;
            if (formDado.status === 'deletar') {
                if (window.confirm('Deseja realmente deletar este aluno?')) {
                    await del.discente(matricula);
                    try { await del.diario(matricula); } catch (e) { console.warn("Diário não encontrado"); }
                    alert('Registro deletado!');
                    navigate(-1);
                    return;
                } else { return; }
            }

            if (matricula) {
                response = await put.discente(formDado);
                if (diario instanceof File) {
                    await put.atualizarDiario({ matricula: response.data.matricula, file: diario });
                }
            } else {
                response = await post.discente(formDado);
                if (diario instanceof File) {
                    await post.uploadDiario({ matricula: response.data.matricula, file: diario });
                }
            }

            if (response.error) throw new Error(response.error.message);
            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            setErrorMessage(error.message || 'Erro ao salvar.');
        }
    };

    const handleDownload = async(e) => {
        e.preventDefault();
        try{
            if (diario) {
                const filename = diario.data.fileName || diario.name
                await get.downloadFile(matricula, filename);
            }
        }catch(error){
            alert('Erro ao baixar arquivo.');
        }
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                {/* --- HEADER --- */}
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>{matricula ? "Editar Aluno" : "Novo Aluno"}</h2>
                    
                    {matricula && (
                        <div className={styles.headerButton}>
                            <Botao 
                                nome="Rendimento" 
                                corFundo="#7EA629" 
                                corBorda="#58751A" 
                                type="button"
                                onClick={() => navigate(`/app/rendimento_aluno/${matricula}`)}
                            />
                        </div>
                    )}
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- 1. INFORMAÇÕES PESSOAIS --- */}
                    <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome Completo:" name="nome" value={formDado.nome} onChange={handleChange} comp="grande" prioridade="true" disabled={isPsico} />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Contato:" name="contato" value={formDado.contato} onChange={handleChange} comp="pequeno" disabled={isPsico} placeholder="(00) 00000-0000" />
                                <Input label="Data de Nasc.:" type="date" name="data" value={formDado.data} onChange={handleChange} comp="pequeno" prioridade="true" disabled={isPsico} />
                            </div>
                            
                            <Input label="Endereço:" name="endereco" value={formDado.endereco} onChange={handleChange} comp="grande" prioridade="true" disabled={isPsico} />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Bairro:" name="bairro" value={formDado.bairro} onChange={handleChange} comp="pequeno" prioridade="true" disabled={isPsico} />
                                <Input label="Cidade:" name="cidade" value={formDado.cidade} onChange={handleChange} comp="pequeno" prioridade="true" disabled={isPsico} />
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Sexo:</label>
                                    <select className={styles.select} name="sexo" value={formDado.sexo} onChange={handleChange} disabled={isPsico}>
                                        <option value="" hidden>Selecione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                    </select>
                                </div>
                                <Input label="Nacionalidade:" name="nacionalidade" value={formDado.nacionalidade} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>

                            <Input label="Cor/Raça:" name="cor" value={formDado.cor} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            <Input label="RG ou CPF:" name="rg" value={formDado.rg} onChange={handleChange} comp="grande" disabled={isPsico} />
                            <Input label="Email:" type="email" name="email" value={formDado.email} onChange={handleChange} comp="grande" prioridade="false" disabled={isPsico} />
                        </div>
                    </div>

                    {/* --- 2. INFORMAÇÕES INSTITUCIONAIS --- */}
                    <h3 className={styles.sectionTitle}>Informações Institucionais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <div className={styles.inputGroup}>
                                <label>Situação Matrícula: <span className={styles.required}>*</span></label>
                                <select className={styles.select} name="status" value={formDado.status} onChange={handleChange} disabled={isPsico}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Ativa</option>
                                    <option value="false">Inativa</option>
                                    <option value="deletar">Deletar</option>
                                    <option value="espera">Em espera...</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Sala: <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="sala" value={formDado.sala} onChange={handleChange} disabled={isPsico}>
                                        <option value="" hidden>...</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Turno: <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="turno" value={formDado.turno} onChange={handleChange} disabled={isPsico}>
                                        <option value="" hidden>...</option>
                                        <option value="manha">Manhã</option>
                                        <option value="tarde">Tarde</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- 3. INFORMAÇÕES FAMILIARES --- */}
                    <h3 className={styles.sectionTitle}>Informações Familiares</h3>
                    
                    {/* PAI */}
                    <h4 className={styles.subSectionTitle}>Pai</h4>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome do Pai:" name="nome_pai" value={formDado.nome_pai} onChange={handleChange} comp="grande" disabled={isPsico} />
                            <div className={styles.linhaDupla}>
                                <Input label="Ocupação:" name="ocupacao_pai" value={formDado.ocupacao_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Contato Trab.:" name="contato_trabalho_pai" value={formDado.contato_trabalho_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <Input label="Local Trabalho:" name="local_trabalho_pai" value={formDado.local_trabalho_pai} onChange={handleChange} comp="grande" disabled={isPsico} />
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input label="Contato Pessoal:" name="contato_pai" value={formDado.contato_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Instrução:" name="instrucao_pai" value={formDado.instrucao_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <div className={styles.linhaDupla}>
                                <Input label="Alfabetização:" name="alfabetizacao_pai" value={formDado.alfabetizacao_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Estado Civil:" name="estado_civil_pai" value={formDado.estado_civil_pai} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                        </div>
                    </div>

                    {/* MÃE */}
                    <h4 className={styles.subSectionTitle}>Mãe</h4>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome da Mãe:" name="nome_mae" value={formDado.nome_mae} onChange={handleChange} comp="grande" disabled={isPsico} />
                            <div className={styles.linhaDupla}>
                                <Input label="Ocupação:" name="ocupacao_mae" value={formDado.ocupacao_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Contato Trab.:" name="contato_trabalho_mae" value={formDado.contato_trabalho_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <Input label="Local Trabalho:" name="local_trabalho_mae" value={formDado.local_trabalho_mae} onChange={handleChange} comp="grande" disabled={isPsico} />
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input label="Contato Pessoal:" name="contato_mae" value={formDado.contato_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Instrução:" name="instrucao_mae" value={formDado.instrucao_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <div className={styles.linhaDupla}>
                                <Input label="Alfabetização:" name="alfabetizacao_mae" value={formDado.alfabetizacao_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Estado Civil:" name="estado_civil_mae" value={formDado.estado_civil_mae} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                        </div>
                    </div>

                    {/* CONTEXTO FAMILIAR */}
                    <h4 className={styles.subSectionTitle}>Contexto Familiar</h4>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input label="Qtd. Filhos:" name="qtd_filho" value={formDado.qtd_filho} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Benefício Gov.:" name="beneficio_governo" value={formDado.beneficio_governo} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <div className={styles.linhaDupla}>
                                <Input label="Mora com:" name="mora_familiar" value={formDado.mora_familiar} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Outro familiar:" name="outro_familiar" value={formDado.outro_familiar} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            <div className={styles.linhaDupla}>
                                <Input label="Todos moram juntos?" name="todos_moram_casa" value={formDado.todos_moram_casa} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Renda Total:" name="renda_total" value={formDado.renda_total} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input label="Transporte Família:" name="meio_transporte" value={formDado.meio_transporte} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Qtd. Transporte:" name="qtd_transporte" value={formDado.qtd_transporte} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>Trabalho (Qtd. Pessoas):</label>
                                <div className={styles.linhaDupla}>
                                    <Input label="CLT:" name="clt" value={formDado.clt} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                    <Input label="Autônomo:" name="autonomo" value={formDado.autonomo} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                </div>
                            </div>
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Família Congrega?" name="familia_congrega" value={formDado.familia_congrega} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Gostaria de Congregar?" name="gostaria_congregar" value={formDado.gostaria_congregar} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                        </div>
                    </div>

                    {/* --- 4. OUTRAS INFORMAÇÕES (SAÚDE/AULAS) --- */}
                    <h3 className={styles.sectionTitle}>Outras Informações & Saúde</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Doença:" name="doenca" value={formDado.doenca} onChange={handleChange} comp="grande" disabled={isPsico} />
                            <Input label="Remédio no Instituto:" name="remedio_instituto" value={formDado.remedio_instituto} onChange={handleChange} comp="grande" disabled={isPsico} />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Horário Medicamento:" type="time" name="horario_medicamento" value={formDado.horario_medicamento} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Pratica Esportes?" name="esportes" value={formDado.esportes} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>

                            {/* CHECKBOXES DE AULAS EXTRAS */}
                            <div className={styles.checkboxGroup}>
                                <p>Aulas Extras:</p>
                                <div className={styles.checkboxGrid}>
                                    {['karate', 'ballet', 'informatica', 'musica', 'artesanato', 'futsal', 'ingles'].map(aula => (
                                        <label key={aula} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name={aula}
                                                checked={formDado[aula] === true}
                                                onChange={(e) => setFormDado({ ...formDado, [aula]: e.target.checked })}
                                                disabled={isPsico}
                                            />
                                            {aula.charAt(0).toUpperCase() + aula.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* UPLOAD DIÁRIO */}
                            <div className={styles.uploadArea}>
                                <label>Diário de Acompanhamento:</label>
                                <div className={styles.dropzoneWrapper}>
                                    <div {...getRootProps({ className: styles.dropzone })}>
                                        <input {...getInputProps()} disabled={isPsico} />
                                        <span className={styles.filename}>
                                            {diario ? (diario.name || diario.data?.fileName) : "Clique ou arraste o arquivo..."}
                                        </span>
                                        <SiGoogledocs className={styles.iconDoc}/>
                                    </div>
                                    {diario && (
                                        <button type="button" className={styles.btnDownload} onClick={handleDownload} title="Baixar Diário">
                                            <IoIosDownload />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <Input label="Medicação:" name="medicacao" value={formDado.medicacao} onChange={handleChange} comp="grande" disabled={isPsico} />
                            <Input label="Tratamento:" name="tratamento" value={formDado.tratamento} onChange={handleChange} comp="grande" disabled={isPsico} />
                            
                            <div className={styles.linhaDupla}>
                                <Input label="Saída do Aluno:" name="saida_aluno" value={formDado.saida_aluno} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                                <Input label="Contato Saída:" name="contato_saida" value={formDado.contato_saida} onChange={handleChange} comp="pequeno" disabled={isPsico} />
                            </div>
                        </div>
                    </div>

                    {/* --- BOTÕES DE AÇÃO --- */}
                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        
                        {!isPsico && (
                            <Botao
                                nome="Salvar Dados" 
                                corFundo="#F29F05" 
                                corBorda="#8A6F3E" 
                                type="submit"
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Aluno_forms;