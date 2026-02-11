import styles from './Cestas_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';
import del from '../../../services/requests/delete';

function CestasForms(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        operacao: 'SAIDA', // Padrão é SAÍDA
        nome: '',
        cpf: '', 
        contato: '',
        voluntario: 'false',
        lider_celula: '',
        pastor_rede: '',
        rede: '',
        tipo: 'ALIMENTO',
        peso: '',
        itens_doados: '', 
        frequencia: 'AVULSA',
        dataEntrega: '',
        responsavel: ''
    });

    const mascaraCPF = (value) => {
        return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1'); 
    };

    useEffect(()=>{
        const fetchCesta = async () => {
            setErrorMessage('');
            try{
                const response = await get.cestas();
                if(response.data && Array.isArray(response.data)){
                    const cesta = response.data.find(cst => cst.id === id);
                    if(cesta){
                        let dataFormatada = cesta.dataEntrega || '';
                        if(dataFormatada.includes('T')) dataFormatada = dataFormatada.split('T')[0];
                        
                        setFormDado({
                            operacao: cesta.operacao || 'SAIDA',
                            nome: cesta.nome || '',
                            cpf: cesta.cpf || '', 
                            contato: cesta.contato || '',
                            voluntario: cesta.voluntario === true ? 'true' : 'false',
                            lider_celula: cesta.lider_celula || '',
                            pastor_rede: cesta.pastor_rede || '',
                            rede: cesta.rede || '',
                            tipo: cesta.tipo || 'ALIMENTO',
                            peso: cesta.peso || '',
                            itens_doados: cesta.itens_doados || '',
                            frequencia: cesta.frequencia || 'AVULSA',
                            dataEntrega: dataFormatada,
                            responsavel: cesta.responsavel || ''
                        });
                    }
                }
            }catch(error){
                setErrorMessage('Não foi possível carregar os dados.');
            }
        };
        if(id) fetchCesta();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Se trocar para ENTRADA, limpa os dados pessoais e frequência que não serão usados
        if (name === 'operacao' && value === 'ENTRADA') {
            setFormDado(prev => ({ 
                ...prev, 
                [name]: value,
                nome: '', cpf: '', contato: '', voluntario: 'false', frequencia: 'AVULSA'
            }));
        } 
        else if (name === 'cpf') {
            setFormDado(prev => ({ ...prev, [name]: mascaraCPF(value) }));
        } 
        else {
            setFormDado(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        // Validação extra se for ENTRADA (Igreja obrigatória)
        if (formDado.operacao === 'ENTRADA') {
            if (!formDado.rede || !formDado.pastor_rede || !formDado.lider_celula) {
                setErrorMessage('Para doações recebidas (ENTRADA), os dados da Rede, Pastor e Líder são obrigatórios.');
                return;
            }
        }

        try{
            const dadosParaEnvio = {
                ...formDado,
                cpf: formDado.cpf.replace(/\D/g, ''),
                voluntario: formDado.voluntario === 'true'
            };

            let response;
            if(id) response = await put.cestas({ ...dadosParaEnvio, id });
            else response = await post.cestas(dadosParaEnvio);

            if (response.error) throw new Error(response.error.message);
            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            setErrorMessage('Ocorreu um erro ao salvar.');
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja deletar este registro?')) {
            try {
                await del.cestas(id); 
                alert('Registro deletado com sucesso!');
                navigate(-1);
            } catch (error) {
                setErrorMessage('Não foi possível deletar o registro.');
            }
        }
    }

    const isEntrada = formDado.operacao === 'ENTRADA';

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>
                        {id ? "Editar Registro" : "Novo Registro"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- TIPO DE OPERAÇÃO RESPONSIVO --- */}
                    <div className={`${styles.operacaoContainer} ${isEntrada ? styles.isEntrada : styles.isSaida}`}>
                        <h3>Tipo de Operação:</h3>
                        <div className={styles.opcoesBox}>
                            <label className={styles.labelEntrada}>
                                <input type="radio" name="operacao" value="ENTRADA" checked={isEntrada} onChange={handleChange} />
                                📥 ENTRADA (Recebimento de Doação)
                            </label>
                            <label className={styles.labelSaida}>
                                <input type="radio" name="operacao" value="SAIDA" checked={!isEntrada} onChange={handleChange} />
                                📤 SAÍDA (Entrega para Beneficiário)
                            </label>
                        </div>
                    </div>

                    {/* --- 1. DADOS PESSOAIS (SÓ MOSTRA SE FOR SAÍDA) --- */}
                    {!isEntrada && (
                        <fieldset className={styles.fieldset}>
                            <legend>Dados do Beneficiário</legend>
                            <div className={styles.gridContainer}>
                                <div className={styles.fullWidth}>
                                    <Input label="Nome Completo:" type="text" name="nome" value={formDado.nome} onChange={handleChange} prioridade="true" comp="grande" />
                                </div>
                                <div className={styles.linhaDupla}>
                                    <Input label="CPF (Opcional):" type="text" name="cpf" value={formDado.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength="14" prioridade="true" />
                                    <Input label="Contato:" type="tel" placeholder="(DDD) 9XXXX-XXXX" name="contato" value={formDado.contato} onChange={handleChange} />
                                    <div className={styles.inputGroup}>
                                        <label>É Voluntário?</label>
                                        <select className={styles.select} name="voluntario" value={formDado.voluntario} onChange={handleChange}>
                                            <option value="false">Não</option>
                                            <option value="true">Sim</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    )}

                    {/* --- 2. DADOS ECLESIÁSTICOS (OBRIGATÓRIO SE ENTRADA) --- */}
                    <fieldset className={styles.fieldset}>
                        <legend>Vínculo com a Igreja {isEntrada ? <span className={styles.required}>* (Obrigatório)</span> : '(Opcional)'}</legend>
                        <div className={styles.gridContainer}>
                            <div className={styles.fullWidth}>
                                <Input label="Líder de Célula:" type="text" name="lider_celula" value={formDado.lider_celula} onChange={handleChange} comp="grande" required={isEntrada} />
                            </div>
                            <div className={styles.fullWidth}>
                                <Input label="Pastor da Rede:" type="text" name="pastor_rede" value={formDado.pastor_rede} onChange={handleChange} comp="grande" required={isEntrada} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Qual a Rede? {isEntrada && <span className={styles.required}>*</span>}</label>
                                <select className={styles.select} name="rede" value={formDado.rede} onChange={handleChange} required={isEntrada}>
                                    <option value="">Selecione...</option>
                                    <option value="Verde">Rede Verde</option>
                                    <option value="Roxa">Rede Azul</option>
                                    <option value="Branca">Rede Amarela</option>
                                    <option value="VinhoNovo">Rede VinhoNovo</option>
                                    <option value="Vermelha">Rede Roxa</option>
                                    <option value="Laranja">Rede Dourada</option>
                                    <option value="Visitante">Visitante / Outra</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* --- 3. DETALHES DA DOAÇÃO --- */}
                    <fieldset className={styles.fieldset}>
                        <legend>Detalhes da {isEntrada ? 'Doação Recebida' : 'Entrega'}</legend>
                        <div className={styles.gridContainer}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Tipo de Item: <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="tipo" value={formDado.tipo} onChange={handleChange} required>
                                        <option value="ALIMENTO">Cesta Básica / Alimentos</option>
                                        <option value="VESTUARIO">Roupas / Calçados</option>
                                        <option value="HIGIENE">Itens de Higiene</option>
                                        <option value="MOVEIS">Móveis / Eletro</option>
                                        <option value="BRINQUEDOS">Brinquedos</option>
                                        <option value="OUTROS">Outros</option>
                                    </select>
                                </div>
                                <Input label="Peso Aprox. (Kg):" type="number" name="peso" value={formDado.peso} onChange={handleChange} placeholder="Ex: 12.5" step="0.1" required={isEntrada} />
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputGroup}>
                                    <label>Descrição detalhada dos itens:</label>
                                    <input className={styles.inputText} type="text" name="itens_doados" value={formDado.itens_doados} onChange={handleChange} placeholder="Ex: 2 camisas, 1 par de sapatos..." required={isEntrada} />
                                </div>
                            </div>
                            
                            <div className={styles.linhaDupla}>
                                {/* SÓ MOSTRA FREQUÊNCIA SE FOR SAÍDA */}
                                {!isEntrada && (
                                    <div className={styles.inputGroup}>
                                        <label>Frequência:</label>
                                        <select className={styles.select} name="frequencia" value={formDado.frequencia} onChange={handleChange}>
                                            <option value="AVULSA">Avulsa (Única vez)</option>
                                            <option value="RECORRENTE">Recorrente (Mensal)</option>
                                        </select>
                                    </div>
                                )}
                                
                                <Input label={isEntrada ? "Data do Recebimento:" : "Data da Entrega:"} type="date" name="dataEntrega" value={formDado.dataEntrega} onChange={handleChange} prioridade="true" required />
                            </div>

                            <div className={styles.linhaDupla}>
                                <Input label={isEntrada ? "Quem preencheu/recebeu?" : "Quem Entregou?"} type="text" name="responsavel" value={formDado.responsavel} onChange={handleChange} required />
                            </div>
                        </div>
                    </fieldset>

                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        <div className={styles.buttonsWrapper}>
                            {id && <Botao nome="Deletar" corFundo="#C60108" corBorda="#602929" type="button" onClick={handleDelete}/>}
                            <Botao nome="Salvar Dados" corFundo="#F29F05" corBorda="#8A6F3E" type="submit" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CestasForms;