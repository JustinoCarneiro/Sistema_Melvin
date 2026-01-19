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
    const {id} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        nome: '',
        contato: '',
        dataEntrega: '',
        responsavel: '',
        lider_celula: '',
        rede: ''
    })

    useEffect(()=>{
        const fetchCesta = async () => {
            setErrorMessage('');

            try{
                const response = await get.cestas();

                if(response.data && Array.isArray(response.data)){
                    const cesta = response.data.find(cst => cst.id === id);
                    if(cesta){
                        // Ajuste para garantir que o input date receba YYYY-MM-DD
                        let dataFormatada = cesta.dataEntrega || '';
                        if(dataFormatada.includes('T')) {
                            dataFormatada = dataFormatada.split('T')[0];
                        }

                        setFormDado({
                            nome: cesta.nome || '',
                            contato: cesta.contato || '',
                            dataEntrega: dataFormatada,
                            responsavel: cesta.responsavel || '',
                            lider_celula: cesta.lider_celula || '',
                            rede: cesta.rede || ''
                        })
                    }
                }
            }catch(error){
                console.error('Erro ao obter dados da cesta!', error);
                setErrorMessage(error.message || 'Não foi possível carregar os dados da cesta.');
            }
        };

        if(id){
            fetchCesta();
        }
    }, [id]);

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
            let response;

            // Se tem ID, é edição (PUT), senão é criação (POST)
            if(id){
                response = await put.cestas({ ...formDado, id }); // Passa ID para garantir update
            } else {
                response = await post.cestas(formDado);
            }

            if (response.error) {
                throw new Error(response.error.message);
            }

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar a cesta.');
        }
    }

    const handleDelete = async () => {
        setErrorMessage('');

        const confirmDelete = window.confirm('Tem certeza que deseja deletar esta cesta?');
        if (confirmDelete) {
            try {
                // Passa o ID se necessário ou o objeto formDado completo dependendo da API
                const response = await del.cestas(id || formDado); 
                
                if (response.error) {
                    throw new Error(response.error.message);
                }
                alert('Cesta deletada com sucesso!');
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
                {/* --- HEADER --- */}
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>
                        {id ? "Editar Cesta Básica" : "Nova Cesta Básica"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- CAMPOS --- */}
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input
                                label="Nome do Beneficiário:"
                                type="text"
                                name="nome"
                                value={formDado.nome}
                                onChange={handleChange}
                                comp="grande"
                                prioridade="true"
                            />
                            <Input
                                label="Contato:"
                                type="tel"
                                placeholder="(DDD) 9XXXX-XXXX"
                                name="contato"
                                value={formDado.contato}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="false"
                            />
                        </div>

                        <div className={styles.coluna}>
                            <div className={styles.linhaDupla}>
                                <Input
                                    label="Líder de Célula:"
                                    type="text"
                                    name="lider_celula"
                                    value={formDado.lider_celula}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="false"
                                />
                                <Input
                                    label="Rede:"
                                    type="text"
                                    name="rede"
                                    value={formDado.rede}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="false"
                                />
                            </div>
                            
                            <div className={styles.linhaDupla}>
                                <Input
                                    label="Data da Entrega:"
                                    type="date"
                                    name="dataEntrega"
                                    value={formDado.dataEntrega}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="true"
                                />
                                <Input
                                    label="Responsável Entrega:"
                                    type="text"
                                    name="responsavel"
                                    value={formDado.responsavel}
                                    onChange={handleChange}
                                    comp="pequeno"
                                    prioridade="true"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER (BOTÕES) --- */}
                    <div className={styles.footerActions}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        
                        <div className={styles.buttonsWrapper}>
                            {/* Botão Deletar (Só aparece se estiver editando) */}
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