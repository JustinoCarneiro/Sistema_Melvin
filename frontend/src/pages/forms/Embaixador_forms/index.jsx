import styles from './Embaixador_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import { IoMdArrowRoundBack } from "react-icons/io";
import { SiGoogledocs } from "react-icons/si";
 
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';

function Embaixador_forms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [imagem, setImagem] = useState(null);

    const [formDado, setFormDado] = useState({
        nome: '',
        email: '',
        instagram: '',
        contato: '',
        status: '',
        contatado: '',
        apelido: '',
        descricao: ''
    })

    useEffect(()=>{
        const fetchEmbaixador = async () => {
            try{
                const response = await get.embaixadores();
                const imagemExistente = await get.imagemPorId(id, "embaixador");

                if(imagemExistente.data != ""){
                    console.log("Imagem existente", imagemExistente);
                    setImagem(imagemExistente);
                }

                if(response.data && Array.isArray(response.data)){
                    const embaixador = response.data.find(emb => emb.id === id);
                    console.log("reponse:", embaixador);
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
                } else {
                    console.log('Nenhum embaixador encontrado');
                }
            } catch (error) {
                console.error('5008:Erro ao obter dados do amigo!', error);
                alert('Erro ao obter dados do aluno!');
            }
        };

        if(id){
            fetchEmbaixador();
        }
    }, [id])

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
        try{
            let response;
            let responseImagem;

            const embaixador = await get.embaixadores();

            if(embaixador.data && Array.isArray(embaixador.data)){
                const embaixadorExistente = embaixador.data.find(emb => emb.id === id);
            
                if (embaixadorExistente) {
                    console.log("Embaixador já existe. Atualizando dados...");
                    response = await put.embaixadores(formDado);
    
                    if (imagem instanceof File) {
                        console.log("imagem", imagem);
                        responseImagem = await put.imagem(id, "embaixador", imagem);
                    }
                } else {
                    console.log("Embaixador não existe. Criando novo voluntário...");
                    response = await post.embaixadores(formDado);
    
                    if (imagem && imagem instanceof File) {
                        responseImagem = await post.imagem(id, "embaixador", imagem);
                    }
                }
            }

            if (response.error) {
                throw new Error(response.error.message);
            }

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            alert('Erro ao salvar!');
        }
    }

    return(
        <div className={styles.body}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES DO EMBAIXADOR</h2>
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
                    <div className={styles.coluna}>
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
                                label="Instagram:"
                                type="text"
                                name="instagram"
                                value={formDado.instagram}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="false"
                            />
                        </div>
                    </div>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES DE STATUS</h2>
                <div className={styles.informacoes}>
                    <div className={styles.coluna}>
                        <Input
                            label="Nome usado no site:"
                            type="text"
                            placeholder=""
                            name="apelido"
                            value={formDado.apelido}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <Input
                            label="Descrição breve de quem é o embaixador:"
                            type="text"
                            placeholder=""
                            name="descricao"
                            value={formDado.descricao}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                        <div className={styles.diario}>
                            Imagem para site:
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
                    <div className={styles.coluna}>
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Status:<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="status" value={formDado.status} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                </select>
                            </label>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Foi contatado?<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="contatado" value={formDado.contatado} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={styles.cadastrar}>
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

export default Embaixador_forms;