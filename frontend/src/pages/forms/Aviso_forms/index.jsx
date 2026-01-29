import styles from "./Aviso_forms.module.scss";

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdArrowRoundBack } from "react-icons/io";

import Botao from '../../../components/gerais/Botao';
import Input from "../../../components/gerais/Input";

import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import put from '../../../services/requests/put';

function AvisoForms(){
    const {id} = useParams(); // Pega o ID da URL
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        titulo: '',
        corpo: '',
        data_inicio: '',
        data_final: '',
        status: ''
    });

    // --- CARREGAR DADOS NA EDIÇÃO ---
    useEffect(()=>{
        setErrorMessage('');
        if (!id) return;

        const fetchAviso = async () => {
            try{
                // Como não temos endpoint GET /aviso/{id} ainda, filtramos no front
                const response = await get.aviso();

                if(response.data && Array.isArray(response.data)){
                    const aviso = response.data.find(avs => avs.id === id);
                    if(aviso){
                        setFormDado({
                            titulo: aviso.titulo || '',
                            corpo: aviso.corpo || '',
                            data_inicio: aviso.data_inicio || '',
                            data_final: aviso.data_final || '',
                            // Converte Boolean do banco para String do Select
                            status: aviso.status === true ? 'true' : 'false'
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar aviso!', error);
                setErrorMessage(error.message || 'Não foi possível carregar os dados do aviso.');
            }
        };

        fetchAviso();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDado((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // --- ENVIAR DADOS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try{
            // PREPARAÇÃO DOS DADOS:
            // O Java espera boolean no status, mas o <select> devolve string "true"/"false"
            const dadosParaEnvio = {
                ...formDado,
                status: formDado.status === 'true' // Converte para Boolean real
            };

            let response;
            
            if(id){
                // --- EDIÇÃO (PUT) ---
                // Importante: Passamos o ID junto para o serviço montar a URL /aviso/{id}
                response = await put.aviso({ ...dadosParaEnvio, id }); 
            } else {
                // --- CRIAÇÃO (POST) ---
                response = await post.aviso(dadosParaEnvio);
            }

            if (response.error) {
                throw new Error(response.error.message);
            }

            alert('Salvo com sucesso!');
            navigate(-1); // Volta para a tela anterior
        } catch (error) {
            console.error('Erro ao salvar aviso!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar. Tente novamente.');
        }
    }

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                
                {/* --- HEADER (Estrutura ajustada para animação da seta) --- */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack 
                            className={styles.voltar} 
                            onClick={() => navigate(-1)}
                        />
                        <h2 className={styles.title}>
                            {id ? "Editar Aviso" : "Novo Aviso"}
                        </h2>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- DADOS DO AVISO --- */}
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input
                                label="Título do Aviso:"
                                type="text"
                                name="titulo"
                                value={formDado.titulo}
                                onChange={handleChange}
                                comp="grande"
                                prioridade="true"
                            />
                            
                            <div className={styles.inputGroup}>
                                <label>Descrição do Aviso: <span className={styles.required}>*</span></label>
                                <textarea 
                                    className={styles.textarea}
                                    name="corpo"
                                    value={formDado.corpo}
                                    onChange={handleChange}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input
                                    label="Data Início:"
                                    type="date"
                                    name="data_inicio"
                                    value={formDado.data_inicio}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="true"
                                />
                                <Input
                                    label="Data Término:"
                                    type="date"
                                    name="data_final"
                                    value={formDado.data_final}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="true"
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>Status: <span className={styles.required}>*</span></label>
                                <select 
                                    className={styles.select} 
                                    name="status" 
                                    value={formDado.status} 
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        <Botao 
                            nome="Salvar Aviso" 
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

export default AvisoForms;