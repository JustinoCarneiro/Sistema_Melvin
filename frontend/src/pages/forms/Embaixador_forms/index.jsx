import styles from './Embaixador_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import { IoMdArrowRoundBack } from "react-icons/io";
import { SiGoogledocs } from "react-icons/si"; // Ou use um ícone de imagem se preferir
 
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';

function Embaixador_forms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [imagem, setImagem] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        nome: '', email: '', instagram: '', contato: '', status: '', contatado: '', apelido: '', descricao: ''
    });

    useEffect(()=>{
        const fetchEmbaixador = async () => {
            setErrorMessage('');

            try{
                // Busca dados gerais
                const response = await get.embaixadores();
                
                // Tenta buscar imagem se estiver editando
                if (id) {
                    try {
                        const imagemExistente = await get.imagemPorId(id, "embaixador");
                        if(imagemExistente && imagemExistente.data){
                            setImagem(imagemExistente);
                        }
                    } catch (e) {
                        console.log("Sem imagem ou erro ao buscar imagem");
                    }
                }

                if(response.data && Array.isArray(response.data)){
                    const embaixador = response.data.find(emb => emb.id === id);
                    if(embaixador){
                        setFormDado({
                            nome: embaixador.nome || '',
                            email: embaixador.email || '',
                            instagram: embaixador.instagram || '',
                            contato: embaixador.contato || '',
                            status: embaixador.status ? 'true' : 'false',
                            contatado: embaixador.contatado ? 'true' : 'false',
                            apelido: embaixador.apelido || '',
                            descricao: embaixador.descricao || ''
                        })
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar embaixador!', error);
                if (error.response?.status !== 404) {
                    setErrorMessage('Não foi possível carregar os dados.');
                }
            }
        };

        if(id){
            fetchEmbaixador();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDado((prevData) => ({ ...prevData, [name]: value }));
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setImagem(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try{
            let response;
            // Verifica existência pelo ID na lista ou simplesmente pelo ID da URL
            if(id){
                console.log("Atualizando embaixador...");
                // PUT geralmente precisa do ID no corpo ou na URL, dependendo da API. 
                // Aqui assumo que o objeto formDado vai, mas a função put.embaixadores deve tratar.
                response = await put.embaixadores({ ...formDado, id });

                if (imagem instanceof File) {
                    await put.imagem(id, "embaixador", imagem);
                }
            } else {
                console.log("Criando embaixador...");
                response = await post.embaixadores(formDado);

                if (imagem && imagem instanceof File && response.data?.id) {
                    await post.imagem(response.data.id, "embaixador", imagem);
                }
            }

            if (response.error) throw new Error(response.error.message);

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar. Verifique os dados.');
        }
    }

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                {/* --- HEADER --- */}
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>
                        {id ? "Editar Embaixador" : "Novo Embaixador"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- INFORMAÇÕES PESSOAIS --- */}
                    <h3 className={styles.sectionTitle}>Informações Pessoais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome Completo:" name="nome" value={formDado.nome} onChange={handleChange} comp="grande" prioridade="true" />
                            <Input label="Email:" type="email" name="email" value={formDado.email} onChange={handleChange} comp="grande" prioridade="false" />
                        </div>
                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input label="Contato:" name="contato" value={formDado.contato} onChange={handleChange} comp="pequeno" placeholder="(00) 00000-0000" prioridade="true" />
                                <Input label="Instagram:" name="instagram" value={formDado.instagram} onChange={handleChange} comp="pequeno" placeholder="@usuario" prioridade="false" />
                            </div>
                        </div>
                    </div>

                    {/* --- STATUS E SITE --- */}
                    <h3 className={styles.sectionTitle}>Perfil no Site & Status</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome no Site (Apelido):" name="apelido" value={formDado.apelido} onChange={handleChange} comp="grande" />
                            <Input label="Breve Descrição:" name="descricao" value={formDado.descricao} onChange={handleChange} comp="grande" />
                            
                            {/* UPLOAD IMAGEM */}
                            <div className={styles.uploadArea}>
                                <label>Foto do Embaixador:</label>
                                <div className={styles.dropzoneWrapper}>
                                    <div {...getRootProps({ className: styles.dropzone })}>
                                        <input {...getInputProps()} />
                                        <span className={styles.filename}>
                                            {imagem ? (imagem.name || imagem.data?.fileName) : "Clique ou arraste a foto aqui..."}
                                        </span>
                                        <SiGoogledocs className={styles.iconDoc}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Status: <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="status" value={formDado.status} onChange={handleChange}>
                                        <option value="" hidden>Selecione...</option>
                                        <option value="true">Ativo</option>
                                        <option value="false">Inativo</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Foi Contatado? <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="contatado" value={formDado.contatado} onChange={handleChange}>
                                        <option value="" hidden>Selecione...</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        <Botao nome="Salvar Dados" corFundo="#F29F05" corBorda="#8A6F3E" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Embaixador_forms;