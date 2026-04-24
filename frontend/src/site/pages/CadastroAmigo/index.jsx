import React, { useState } from 'react';
import styles from './CadastroAmigo.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import amigoMelvinService from '../../../services/amigoMelvinService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

function CheckoutForm({ donationType, amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);
            
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: nome,
                    email: email,
                    phone: contato
                }
            });

            const { token: stripeTokenObj, error: tokenError } = await stripe.createToken(cardElement);

            if (stripeError || tokenError) {
                setError(stripeError?.message || tokenError?.message);
                setLoading(false);
                return;
            }

            const dados = {
                nome,
                email,
                contato,
                valor: amount,
                stripeToken: stripeTokenObj.id
            };

            if (donationType === 'monthly') {
                await amigoMelvinService.subscribe(dados);
                setSuccess(true);
            } else {
                const response = await amigoMelvinService.oneTimeDonation(dados);
                const clientSecret = response.data;
                const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: paymentMethod.id
                });
                
                if (confirmError) {
                    setError(confirmError.message);
                    setLoading(false);
                    return;
                }
                setSuccess(true);
            }
        } catch (err) {
            console.error("Erro no checkout:", err);
            setError('Ocorreu um erro ao processar sua doação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successContainer}>
                <h2>Obrigado, {nome}!</h2>
                <p>Sua contribuição foi processada com sucesso.</p>
                <button className={styles.button} onClick={() => navigate("/")}>Voltar para o Início</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <label className={styles.label}>
                Nome Completo:
                <input 
                    className={styles.input}
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
            </label>
            <label className={styles.label}>
                Email:
                <input 
                    className={styles.input}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label className={styles.label}>
                Telefone/Celular:
                <input
                    className={styles.input} 
                    type="text"
                    required
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                />
            </label>
            
            <label className={styles.label}>
                Dados do Cartão:
                <div className={styles.cardInputContainer}>
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#333',
                                '::placeholder': { color: '#888' },
                            },
                            invalid: {
                                color: '#e53935',
                            },
                        },
                    }}/>
                </div>
            </label>

            <button 
                className={styles.button} 
                type="submit" 
                disabled={!stripe || loading}
            >
                {loading ? "Processando..." : `Finalizar Doação de R$ ${amount}`}
            </button>
        </form>
    );
}

function CadastroAmigo() {
    const location = useLocation();
    const donationType = location.state?.type || 'monthly';
    const amount = location.state?.value || 50;

    return (
        <div className={styles.body}>
            <div className={styles.checkoutWrapper}>
                <div className={styles.headerInfo}>
                    <h2 className={styles.title}>Finalizar Apoio</h2>
                    <p className={styles.texto}>
                        Você escolheu a modalidade <strong>{donationType === 'monthly' ? 'Assinatura Mensal' : 'Doação Única'}</strong> no valor de <strong>R$ {amount}</strong>.
                    </p>
                    <p className={styles.texto}>
                        Preencha seus dados de forma segura para concluir.
                    </p>
                </div>
                <Elements stripe={stripePromise}>
                    <CheckoutForm donationType={donationType} amount={amount} />
                </Elements>
            </div>
        </div>
    );
}

export default CadastroAmigo;