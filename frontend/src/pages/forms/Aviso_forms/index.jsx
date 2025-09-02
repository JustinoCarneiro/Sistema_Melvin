import styles from "./Aviso_forms.module.scss";

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// O import do 'useDropzone' foi removido

import { IoMdArrowRoundBack } from "react-icons/io";
// O import do 'SiGoogledocs' foi removido

import Botao from '../../../components/gerais/Botao';
import Input from "../../../components/gerais/Input";

import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import put from '../../../services/requests/put';

function AvisoForms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    // O estado 'imagem' foi removido

    const [formDado, setFormDado] = useState({
        titulo: '',
        corpo: '',
        data_inicio: '',
        data_final: '',
        status: ''
    });

    useEffect(()=>{
        setErrorMessage('');
        if (!id) return;

        const fetchAviso = async () => {
            try{
                const response = await get.aviso();
                // A busca pela imagem foi removida daqui

                if(response.data && Array.isArray(response.data)){
                    const aviso = response.data.find(avs => avs.id === id);
                    if(aviso){
                        setFormDado({
                            titulo: aviso.titulo || '',
                            corpo: aviso.corpo || '',
                            data_inicio: aviso.data_inicio || '',
                            data_final: aviso.data_final || '',
                            status: aviso.status ? 'true' : 'false'
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

    // A função 'onDrop' e o hook 'useDropzone' foram removidos

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try{
            let response;
            const aviso = await get.aviso();

            if(aviso.data && Array.isArray(aviso.data)){
                const avisoExistente = aviso.data.find(avs => avs.id ===id);
                if(avisoExistente){
                    response = await put.aviso(formDado);
                    // A lógica de atualizar imagem foi removida
                } else {
                    response = await post.aviso(formDado);
                    // A lógica de postar imagem foi removida
                }
            }

            if (response.error) {
                throw new Error(response.error.message);
            }

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar aviso!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar. Tente novamente.');
        }
    }

    return(
        <div className={styles.body}>
            <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES DO AVISO</h2>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Título:"
                            type="text"
                            placeholder=""
                            name="titulo"
                            value={formDado.titulo}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <label className={styles.label_select}>
                            <div className={styles.sublabel_select}>Descrição do aviso:<p className={styles.asterisco}>*</p></div>
                            <textarea 
                                className={styles.areatext}
                                name="corpo"
                                value={formDado.corpo}
                                onChange={handleChange}
                            ></textarea>
                        </label>
                    </div>
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <Input
                                label="Data de início:"
                                type="date"
                                placeholder="DD/MM/AAAA"
                                name="data_inicio"
                                value={formDado.data_inicio}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                            <Input
                                label="Data de término:"
                                type="date"
                                placeholder="DD/MM/AAAA"
                                name="data_final"
                                value={formDado.data_final}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                        </div>
                        <label className={styles.label_select}>
                            <div className={styles.sublabel_select}>Status:<p className={styles.asterisco}>*</p></div>
                            <select className={styles.select} name="status" value={formDado.status} onChange={handleChange}>
                                <option value="" hidden>Selecione...</option>
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </label>
                        
                        {/* A DIV DE UPLOAD DE IMAGEM FOI REMOVIDA DAQUI */}

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

export default AvisoForms;