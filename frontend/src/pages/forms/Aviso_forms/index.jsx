import styles from "./Aviso_forms.module.scss";

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import { IoMdArrowRoundBack } from "react-icons/io";
import { SiGoogledocs } from "react-icons/si";

import Botao from '../../../components/gerais/Botao';
import Input from "../../../components/gerais/Input";

import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import put from '../../../services/requests/put';

function AvisoForms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [imagem, setImagem] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        titulo: '',
        corpo: '',
        data_inicio: '',
        data_final: '',
        status: ''
    })

    useEffect(()=>{
        setErrorMessage('');

        if (!id) {
            return;
        }

        const fetchAviso = async () => {
            try{
                
                const response = await get.aviso();
                console.log("response get", response);
                const imagemExistente = await get.imagemPorId(id, "aviso");

                if(imagemExistente && imagemExistente.data){
                    console.log("Imagem existente", imagemExistente);
                    setImagem(imagemExistente);
                }

                if(response.data && Array.isArray(response.data)){
                    const aviso = response.data.find(avs => avs.id === id);
                    console.log("response", aviso);
                    if(aviso){
                        setFormDado({
                            titulo: aviso.titulo || '',
                            corpo: aviso.corpo || '',
                            data_inicio: aviso.data_inicio || '',
                            data_final: aviso.data_final || '',
                            status: aviso.status ? 'true' : 'false'
                        })
                    }
                } else {
                    console.log('Nenhum aviso encontrado');
                }

            } catch (error) {
                console.error('Erro ao buscar aviso!', error);
                if (error.response?.status !== 404) {
                    setErrorMessage(error.message || 'Não foi possível carregar os dados do aviso.');
                }
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

    const onDrop = (acceptedFiles) => {
        console.log('Files dropped:', acceptedFiles);
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setImagem(file);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try{
            let response;
            let responseImagem;

            const aviso = await get.aviso();

            if(aviso.data && Array.isArray(aviso.data)){
                const avisoExistente = aviso.data.find(avs => avs.id ===id);
                if(avisoExistente){
                    console.log("Aviso já existe. Atualizando dados...");
                    response = await put.aviso(formDado);
                    if(imagem instanceof File){
                        console.log("imagem", imagem);
                        responseImagem = await put.imagem(response.data.id, "aviso", imagem);
                    }
                } else {
                    console.log("Aviso não existe. Criando novo aviso...");
                    response = await post.aviso(formDado);
                    console.log("response", response);
                    if(imagem instanceof File){
                        console.log("imagem", imagem);
                        responseImagem = await post.imagem(response.data.id, "aviso", imagem);
                    }
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
                        <div className={styles.diario}>
                            Imagem para aviso:
                            <div className={styles.container_diario}>
                                <label className={styles.label_diario}>
                                    <div {...getRootProps({ className: styles.dropzone })}>
                                        <input {...getInputProps()} />
                                        {imagem ? (
                                            <p className={styles.placeholderdiario}>{imagem.name || imagem.data.fileName}</p>
                                        ) : (
                                            <p className={styles.placeholderdiario}>Adicione o arquivo aqui...</p>
                                        )}
                                        <SiGoogledocs/>
                                    </div>
                                </label>
                            </div>
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

export default AvisoForms;