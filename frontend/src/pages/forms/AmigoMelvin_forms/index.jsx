import styles from './AmigoMelvin_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdArrowRoundBack } from "react-icons/io";
 
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import post from '../../../services/requests/post';
import get from '../../../services/requests/get';
import put from '../../../services/requests/put';

function AmigoMelvin_forms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [formDado, setFormDado] = useState({
        nome: '',
        email: '',
        contato: '',
        status: '',
        contatado: '',
        formaPagamento: '',
        valorMensal: ''
    })
    
    useEffect(() => {
        const fetchAmigo = async () => {
            try {
                const response = await get.amigosmelvin();
                if (response.data && Array.isArray(response.data)) {
                    const amigo = response.data.find(amg => amg.id === id);
                    if (amigo) {
                        setFormDado({
                            nome: amigo.nome || '',
                            email: amigo.email || '',
                            contato: amigo.contato || '',
                            status: amigo.status ? 'true' : 'false',
                            contatado: amigo.contatado ? 'true' : 'false',
                            formaPagamento: amigo.formaPagamento || '',
                            valorMensal: amigo.valorMensal || ''
                        });
                    } else {
                        console.log('Amigo não encontrado');
                    }
                } else {
                    console.log('Nenhum amigo encontrado');
                }
            } catch (error) {
                console.error('5008:Erro ao obter dados do amigo!', error);
                alert('Erro ao obter dados do aluno!');
            }
        };
    
        if (id) {
            fetchAmigo();
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
        try {
            let response;
            const amigoExistente = formDado;

            if (amigoExistente) {
                console.log("Amigo já existe. Atualizando dados...");
                response = await put.amigosmelvin(formDado);
            } else {
                console.log("Amigo não existe. Criando novo voluntário...");
                response = await post.amigosmelvin(formDado);
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
    };

    return(
        <div className={styles.body}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.linha_voltar}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                </div>
                <h2 className={styles.title}>INFORMAÇÕES AMIGO DO MELVIN</h2>
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
                        <div className={styles.linha}>
                            <label className={styles.label_select}>
                                <div className={styles.sublabel_select}>Forma de contribuição:<p className={styles.asterisco}>*</p></div>
                                <select className={styles.select} name="formaPagamento" value={formDado.formaPagamento} onChange={handleChange}>
                                    <option value="" hidden>Selecione...</option>
                                    <option value="Pix">Pix</option>
                                    <option value="Cartão">Cartão</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                </select>
                            </label>
                            <Input
                                label="Valor da contribuição mensal:"
                                type="text"
                                placeholder="R$"
                                name="valorMensal"
                                value={formDado.valorMensal}
                                onChange={handleChange}
                                comp="pequeno"
                                prioridade="true"
                            />
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

export default AmigoMelvin_forms;