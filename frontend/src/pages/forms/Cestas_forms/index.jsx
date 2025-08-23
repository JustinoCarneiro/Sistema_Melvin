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
                    console.log("reponse:", cesta);
                    if(cesta){
                        setFormDado({
                            nome: cesta.nome || '',
                            contato: cesta.contato || '',
                            dataEntrega: cesta.dataEntrega || '',
                            responsavel: cesta.responsavel || '',
                            lider_celula: cesta.lider_celula || '',
                            rede: cesta.rede || ''
                        })
                    }
                } else {
                    console.log('Nenhuma cesta encontrado');
                }

            }catch(error){
                console.error('5008:Erro ao obter dados da cesta!', error);
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

            const cesta = await get.cestas();
            if(cesta.data && Array.isArray(cesta.data)){
                const cestaExistente = cesta.data.find(cst => cst.id === id);

                if(cestaExistente){
                    console.log("Cesta já existe. Atualizando dados...");
                    response = await put.cestas(formDado);
                } else {
                    console.log("Cesta não existe. Criando novo embaixador...");
                    response = await post.cestas(formDado);
                }
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
                const response = await del.cestas(formDado);
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
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES DA CESTA</h2>
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
                        <div className={styles.linha}>
                            <Input
                                label="Líder de célula:"
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
                        <Input
                            label="Data da entrega:"
                            type="date"
                            name="dataEntrega"
                            value={formDado.dataEntrega}
                            onChange={handleChange}
                            comp="pequeno"
                            prioridade="true"
                        />
                        <Input
                            label="Responsável pela entrega:"
                            type="text"
                            name="responsavel"
                            value={formDado.responsavel}
                            onChange={handleChange}
                            comp="grande"
                            prioridade="true"
                        />
                    </div>
                </div>
                {errorMessage && (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorMessage}>{errorMessage}</p>
                    </div>
                )}
                <div className={styles.cadastrar}>
                    <Botao 
                        nome="Deletar" 
                        corFundo="#C60108" 
                        corBorda="#602929" 
                        comp="pequeno"
                        type="button"
                        onClick={handleDelete}
                    />
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

export default CestasForms;