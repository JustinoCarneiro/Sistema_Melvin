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
        // REMOVIDO: status
    });

    const mascaraCPF = (value) => {
        return value
            .replace(/\D/g, '') 
            .replace(/(\d{3})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d{1,2})/, '$1-$2') 
            .replace(/(-\d{2})\d+?$/, '$1'); 
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
                        if(dataFormatada.includes('T')) {
                            dataFormatada = dataFormatada.split('T')[0];
                        }
                        setFormDado({
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
                            // REMOVIDO: status
                        });
                    }
                }
            }catch(error){
                console.error('Erro ao obter dados!', error);
                setErrorMessage(error.message || 'Não foi possível carregar os dados.');
            }
        };
        if(id){ fetchCesta(); }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setFormDado(prev => ({ ...prev, [name]: mascaraCPF(value) }));
        } else {
            setFormDado(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try{
            const dadosParaEnvio = {
                ...formDado,
                cpf: formDado.cpf.replace(/\D/g, ''),
                voluntario: formDado.voluntario === 'true'
                // REMOVIDO: status
            };

            let response;
            if(id){
                response = await put.cestas({ ...dadosParaEnvio, id });
            } else {
                response = await post.cestas(dadosParaEnvio);
            }
            if (response.error) throw new Error(response.error.message);
            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar.');
        }
    }

    const handleDelete = async () => {
        setErrorMessage('');
        const confirmDelete = window.confirm('Tem certeza que deseja deletar este registro?');
        if (confirmDelete) {
            try {
                const response = await del.cestas(id); 
                if (response.error) throw new Error(response.error.message);
                alert('Registro deletado com sucesso!');
                navigate(-1);
            } catch (error) {
                console.error('Erro ao deletar!', error);
                setErrorMessage(error.message || 'Não foi possível deletar o registro.');
            }
        }
    }

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>
                        {id ? "Editar Doação" : "Nova Doação"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- 1. DADOS PESSOAIS --- */}
                    <fieldset className={styles.fieldset}>
                        <legend>Dados do Beneficiário</legend>
                        <div className={styles.gridContainer}>
                            
                            <div className={styles.fullWidth}>
                                <Input
                                    label="Nome Completo:"
                                    type="text"
                                    name="nome"
                                    value={formDado.nome}
                                    onChange={handleChange}
                                    prioridade="true"
                                    comp="grande" 
                                />
                            </div>
                            
                            <div className={styles.linhaDupla}>
                                <Input
                                    label="CPF:"
                                    type="text"
                                    name="cpf"
                                    value={formDado.cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    maxLength="14"
                                    prioridade="true"
                                />
                                <Input
                                    label="Contato:"
                                    type="tel"
                                    placeholder="(DDD) 9XXXX-XXXX"
                                    name="contato"
                                    value={formDado.contato}
                                    onChange={handleChange}
                                />
                                <div className={styles.inputGroup}>
                                    <label>É Voluntário?</label>
                                    <select 
                                        className={styles.select} 
                                        name="voluntario" 
                                        value={formDado.voluntario} 
                                        onChange={handleChange}
                                    >
                                        <option value="false">Não</option>
                                        <option value="true">Sim</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* --- 2. DADOS ECLESIÁSTICOS --- */}
                    <fieldset className={styles.fieldset}>
                        <legend>Dados da Igreja</legend>
                        <div className={styles.gridContainer}>
                            <div className={styles.fullWidth}>
                                <Input
                                    label="Líder de Célula:"
                                    type="text"
                                    name="lider_celula"
                                    value={formDado.lider_celula}
                                    onChange={handleChange}
                                    comp="grande"
                                />
                            </div>
                            <div className={styles.fullWidth}>
                                <Input
                                    label="Pastor da Rede:"
                                    type="text"
                                    name="pastor_rede"
                                    value={formDado.pastor_rede}
                                    onChange={handleChange}
                                    comp="grande"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Qual a Rede?</label>
                                <select 
                                    className={styles.select} 
                                    name="rede" 
                                    value={formDado.rede} 
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Verde">Rede Verde</option>
                                    <option value="Roxa">Rede Azul</option>
                                    <option value="Branca">Rede Amarela</option>
                                    <option value="VinhoNovo">Rede VinhoNovo</option>
                                    <option value="Vermelha">Rede Roxa</option>
                                    <option value="Laranja">Rede Dourada</option>
                                    <option value="Visitante">Visitante</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* --- 3. DETALHES DA DOAÇÃO --- */}
                    <fieldset className={styles.fieldset}>
                        <legend>Detalhes da Entrega</legend>
                        <div className={styles.gridContainer}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Tipo de Item: <span className={styles.required}>*</span></label>
                                    <select 
                                        className={styles.select} 
                                        name="tipo" 
                                        value={formDado.tipo} 
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="ALIMENTO">Cesta Básica / Alimentos</option>
                                        <option value="VESTUARIO">Roupas / Calçados</option>
                                        <option value="HIGIENE">Itens de Higiene</option>
                                        <option value="MOVEIS">Móveis / Eletro</option>
                                        <option value="BRINQUEDOS">Brinquedos</option>
                                        <option value="OUTROS">Outros</option>
                                    </select>
                                </div>
                                <Input
                                    label="Peso Aprox. (Kg):"
                                    type="number"
                                    name="peso"
                                    value={formDado.peso}
                                    onChange={handleChange}
                                    placeholder="Ex: 12.5"
                                    step="0.1"
                                />
                            </div>

                            <div className={styles.fullWidth}>
                                <div className={styles.inputGroup}>
                                    <label>Descrição detalhada dos itens:</label>
                                    <input 
                                        className={styles.inputText}
                                        type="text"
                                        name="itens_doados"
                                        value={formDado.itens_doados}
                                        onChange={handleChange}
                                        placeholder="Ex: 2 camisas, 1 par de sapatos..."
                                    />
                                </div>
                            </div>
                            
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Frequência:</label>
                                    <select 
                                        className={styles.select} 
                                        name="frequencia" 
                                        value={formDado.frequencia} 
                                        onChange={handleChange}
                                    >
                                        <option value="AVULSA">Avulsa (Única vez)</option>
                                        <option value="RECORRENTE">Recorrente (Mensal)</option>
                                    </select>
                                </div>

                                <Input
                                    label="Data da Entrega:"
                                    type="date"
                                    name="dataEntrega"
                                    value={formDado.dataEntrega}
                                    onChange={handleChange}
                                    prioridade="true"
                                />
                            </div>

                            <div className={styles.linhaDupla}>
                                <Input
                                    label="Quem Entregou?"
                                    type="text"
                                    name="responsavel"
                                    value={formDado.responsavel}
                                    onChange={handleChange}
                                />
                                {/* REMOVIDO CAMPO STATUS DAQUI */}
                            </div>
                        </div>
                    </fieldset>

                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        
                        <div className={styles.buttonsWrapper}>
                            {id && (
                                <Botao 
                                    nome="Deletar" 
                                    corFundo="#C60108" 
                                    corBorda="#602929" 
                                    type="button"
                                    onClick={handleDelete}
                                />
                            )}
                            
                            <Botao 
                                nome="Salvar Dados" 
                                corFundo="#F29F05" 
                                corBorda="#8A6F3E" 
                                type="submit"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CestasForms;