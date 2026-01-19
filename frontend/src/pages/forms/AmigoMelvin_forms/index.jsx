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
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        nome: '', email: '', contato: '', status: '', contatado: '', formaPagamento: '', valorMensal: ''
    });
    
    useEffect(() => {
        const fetchAmigo = async () => {
            setErrorMessage('');
            if (id) {
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
                        }
                    }
                } catch (error) {
                    console.error('Erro ao buscar amigo do Melvin!', error);
                    setErrorMessage('Não foi possível carregar os dados.');
                }
            }
        };
        fetchAmigo();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDado((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            let response;
            // Verifica se está editando (id existe) ou criando novo
            if (id) {
                // Passa o ID junto com os dados para o PUT saber qual atualizar
                response = await put.amigosmelvin({ ...formDado, id });
            } else {
                response = await post.amigosmelvin(formDado);
            }

            if (response.error) throw new Error(response.error.message);

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar.');
        }
    };

    return(
        <div className={styles.body}>
            <div className={styles.container}>
                {/* --- HEADER --- */}
                <div className={styles.headerForm}>
                    <IoMdArrowRoundBack className={styles.voltar} onClick={() => navigate(-1)}/>
                    <h2 className={styles.titlePage}>
                        {id ? "Editar Amigo do Melvin" : "Novo Amigo do Melvin"}
                    </h2>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    
                    {/* --- INFORMAÇÕES PESSOAIS --- */}
                    <h3 className={styles.sectionTitle}>Dados Pessoais</h3>
                    <div className={styles.gridContainer}>
                        <div className={styles.coluna}>
                            <Input label="Nome Completo:" name="nome" value={formDado.nome} onChange={handleChange} comp="grande" prioridade="true" />
                            <Input label="Email:" type="email" name="email" value={formDado.email} onChange={handleChange} comp="grande" prioridade="false" />
                            <Input label="Contato:" type="tel" name="contato" value={formDado.contato} onChange={handleChange} comp="pequeno" placeholder="(00) 00000-0000" prioridade="true" />
                        </div>

                        {/* --- STATUS E CONTRIBUIÇÃO --- */}
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

                            <div className={styles.linhaDupla}>
                                <div className={styles.inputGroup}>
                                    <label>Forma Contribuição: <span className={styles.required}>*</span></label>
                                    <select className={styles.select} name="formaPagamento" value={formDado.formaPagamento} onChange={handleChange}>
                                        <option value="" hidden>Selecione...</option>
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão">Cartão</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                    </select>
                                </div>
                                <Input label="Valor Mensal:" name="valorMensal" value={formDado.valorMensal} onChange={handleChange} comp="pequeno" placeholder="R$ 0,00" />
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

export default AmigoMelvin_forms;