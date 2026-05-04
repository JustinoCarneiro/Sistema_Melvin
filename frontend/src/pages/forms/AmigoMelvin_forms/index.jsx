import styles from './AmigoMelvin_forms.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { IoMdArrowRoundBack } from "react-icons/io";
import Botao from '../../../components/gerais/Botao';
import Input from '../../../components/gerais/Input';

import amigoMelvinService from '../../../services/amigoMelvinService';

function AmigoMelvin_forms(){
    const {id} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const [formDado, setFormDado] = useState({
        nome: '', email: '', contato: '', status: '', formaPagamento: 'Cartão', valorMensal: ''
    });
    
    useEffect(() => {
        const fetchAmigo = async () => {
            setErrorMessage('');
            if (id) {
                try {
                    const response = await amigoMelvinService.list();
                    if (response.data && Array.isArray(response.data)) {
                        const amigo = response.data.find(amg => amg.id === id);
                        if (amigo) {
                            setFormDado({
                                nome: amigo.nome || '',
                                email: amigo.email || '',
                                contato: amigo.contato || '',
                                status: amigo.status || 'PENDING',
                                formaPagamento: amigo.formaPagamento || 'Cartão',
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
                response = await amigoMelvinService.update({ ...formDado, id });
            } else {
                response = await amigoMelvinService.create(formDado);
            }

            if (response.error) throw new Error(response.error.message);

            alert('Salvo com sucesso!');
            navigate(-1);
        } catch (error) {
            console.error('Erro ao salvar!', error);
            setErrorMessage(error.message || 'Ocorreu um erro ao salvar.');
        }
    };

    const handleCancelSubscription = async () => {
        if(window.confirm("Tem certeza que deseja cancelar a assinatura deste apoiador no Stripe?")) {
            try {
                await amigoMelvinService.cancelSubscription(id);
                alert("Assinatura cancelada com sucesso!");
                setFormDado((prev) => ({...prev, status: 'CANCELLED'}));
            } catch (error) {
                alert("Erro ao cancelar assinatura: " + error.message);
            }
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
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="PENDING">Pendente</option>
                                        <option value="INACTIVE">Inativo</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Forma Contribuição: <span className={styles.required}>*</span></label>
                                    <input className={styles.select} value="Cartão" disabled />
                                </div>
                            </div>

                            <div className={styles.linhaDupla}>
                                <Input label="Valor Mensal:" name="valorMensal" value={formDado.valorMensal} onChange={handleChange} comp="pequeno" placeholder="R$ 0,00" />
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className={styles.footerActions} style={{ display: 'flex', gap: '1rem' }}>
                        {errorMessage && <div className={styles.errorMsg}>{errorMessage}</div>}
                        {id && formDado.status !== 'CANCELLED' && formDado.status !== 'INACTIVE' && (
                            <Botao nome="Cancelar Assinatura no Stripe" corFundo="#c62828" corBorda="#8e0000" type="button" onClick={handleCancelSubscription} />
                        )}
                        <Botao nome="Salvar Dados" corFundo="#F29F05" corBorda="#8A6F3E" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AmigoMelvin_forms;