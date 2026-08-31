import styles from "./Form.module.scss";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IoMdArrowRoundBack } from "react-icons/io";

import Botao from '@core/components/gerais/Botao';
import Input from "@core/components/gerais/Input";

import ocorrenciaTecnicaService from '../api/ocorrenciaTecnicaService';

function OcorrenciaTecnicaForm(){
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        titulo: '',
        categoria: '',
        severidade: '',
        descricao: '',
        data_ocorrencia: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDado((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try{
            const dadosParaEnvio = {
                titulo: formDado.titulo,
                categoria: formDado.categoria,
                severidade: formDado.severidade,
                descricao: formDado.descricao,
                dataOcorrencia: formDado.data_ocorrencia
            };

            const response = await ocorrenciaTecnicaService.create(dadosParaEnvio);

            if (response.error) {
                throw new Error(response.error.message);
            }

            alert('Ocorrência técnica registrada!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao registrar ocorrência técnica!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar. Tente novamente.');
        }
    }

    return(
        <div className={styles.body}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <IoMdArrowRoundBack
                            className={styles.voltar}
                            onClick={() => navigate(-1)}
                        />
                        <h2 className={styles.title}>Nova Ocorrência Técnica</h2>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input
                                label="Título:"
                                type="text"
                                name="titulo"
                                value={formDado.titulo}
                                onChange={handleChange}
                                comp="grande"
                                prioridade="true"
                            />

                            <div className={styles.inputGroup}>
                                <label>Descrição: <span className={styles.required}>*</span></label>
                                <textarea
                                    className={styles.textarea}
                                    name="descricao"
                                    value={formDado.descricao}
                                    onChange={handleChange}
                                    rows="8"
                                    placeholder="Causa raiz, contexto, o que foi feito para resolver..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.inputGroup}>
                                <label>Categoria: <span className={styles.required}>*</span></label>
                                <select
                                    className={styles.select}
                                    name="categoria"
                                    value={formDado.categoria}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" hidden>Selecione...</option>
                                    <option value="BUG">Bug</option>
                                    <option value="INCIDENTE">Incidente</option>
                                    <option value="MANUTENCAO">Manutenção</option>
                                    <option value="DECISAO_TECNICA">Decisão Técnica</option>
                                    <option value="SEGURANCA">Segurança</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Severidade: <span className={styles.required}>*</span></label>
                                <select
                                    className={styles.select}
                                    name="severidade"
                                    value={formDado.severidade}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" hidden>Selecione...</option>
                                    <option value="BAIXA">Baixa</option>
                                    <option value="MEDIA">Média</option>
                                    <option value="ALTA">Alta</option>
                                </select>
                            </div>

                            <Input
                                label="Data:"
                                type="date"
                                name="data_ocorrencia"
                                value={formDado.data_ocorrencia}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
                        </div>
                    </div>

                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        <Botao
                            nome="Registrar Ocorrência"
                            corFundo="#1A4D80"
                            corBorda="#12365B"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default OcorrenciaTecnicaForm;
