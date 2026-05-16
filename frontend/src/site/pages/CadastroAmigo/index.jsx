import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { LuUser, LuPhone, LuMail, LuCreditCard, LuHeart, LuChevronLeft, LuCircleCheck, LuPencilLine } from 'react-icons/lu';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';
import amigoMelvinService from '../../../services/amigoMelvinService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

function CheckoutForm({ donationType, amount, initialData }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [nome, setNome] = useState(initialData?.nome || '');
    const [contato, setContato] = useState(initialData?.telefone || initialData?.contato || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [isEditing, setIsEditing] = useState(!initialData?.nome);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isCardComplete, setIsCardComplete] = useState(false);

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
                stripeToken: stripeTokenObj.id,
                dia: initialData?.dia || '',
                mensagem: initialData?.mensagem || ''
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
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
            >
                <LuCircleCheck className="w-32 h-32 text-melvin-green mx-auto mb-10 drop-shadow-xl" />
                <h2 className="text-5xl font-handwritten text-melvin-text mb-6">Obrigado, {nome.split(' ')[0]}!</h2>
                <p className="text-xl text-slate-600 font-light mb-12 max-w-md mx-auto leading-relaxed">
                    Sua contribuição foi processada com sucesso. Você agora faz parte da nossa rede de amigos que transformam vidas.
                </p>
                <button 
                    className="bg-melvin-green hover:bg-melvin-green-dark text-white px-10 py-4 rounded-full text-2xl font-handwritten transition-all shadow-xl"
                    onClick={() => navigate("/")}
                >
                    Voltar para o Início
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border-l-4 border-melvin-red p-6 rounded-2xl text-melvin-red-dark text-sm animate-pulse">
                    {error}
                </div>
            )}
            
            <div className="space-y-6">
                {!isEditing && initialData ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 border border-white/80 rounded-[2.5rem] p-8 relative group"
                    >
                        {/* Edit button removed to avoid redundancy */}

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-melvin-green/10 flex items-center justify-center shrink-0">
                                    <LuUser className="text-melvin-green w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Doador</p>
                                    <p className="text-xl text-melvin-text font-medium leading-tight">{nome}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-melvin-green/10 flex items-center justify-center shrink-0">
                                        <LuMail className="text-melvin-green w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">E-mail</p>
                                        <p className="text-base text-slate-600 truncate max-w-[180px]">{email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-melvin-green/10 flex items-center justify-center shrink-0">
                                        <LuPhone className="text-melvin-green w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Contato</p>
                                        <p className="text-base text-slate-600">{contato}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                                <LuUser className="text-melvin-green" /> Nome Completo
                            </label>
                            <input 
                                className="w-full bg-white/60 border border-white/80 rounded-3xl px-8 py-4 outline-none focus:ring-4 focus:ring-melvin-green/10 focus:border-melvin-green/30 transition-all text-lg"
                                type="text"
                                required
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Como no cartão"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                                    <LuMail className="text-melvin-green" /> E-mail
                                </label>
                                <input 
                                    className="w-full bg-white/60 border border-white/80 rounded-3xl px-8 py-4 outline-none focus:ring-4 focus:ring-melvin-green/10 focus:border-melvin-green/30 transition-all text-lg"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                                    <LuPhone className="text-melvin-green" /> Telefone
                                </label>
                                <input
                                    className="w-full bg-white/60 border border-white/80 rounded-3xl px-8 py-4 outline-none focus:ring-4 focus:ring-melvin-green/10 focus:border-melvin-green/30 transition-all text-lg" 
                                    type="text"
                                    required
                                    value={contato}
                                    onChange={(e) => setContato(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                        {initialData && (
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)}
                                className="text-xs font-bold text-melvin-green uppercase tracking-widest ml-4 hover:underline"
                            >
                                Confirmar dados e voltar
                            </button>
                        )}
                    </motion.div>
                )}
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-4">
                        <LuCreditCard className="text-melvin-green" /> Dados do Cartão
                    </label>
                    <div className="bg-white/60 border border-white/80 rounded-3xl px-8 py-5 focus-within:ring-4 focus-within:ring-melvin-green/10 focus-within:border-melvin-green/30 transition-all shadow-inner">
                        <CardElement 
                            onChange={(e) => setIsCardComplete(e.complete)}
                            options={{
                            hidePostalCode: true,
                            style: {
                                base: {
                                    fontSize: '20px',
                                    fontFamily: 'Recursive, sans-serif',
                                    color: '#2A363B',
                                    '::placeholder': { color: '#888' },
                                },
                                invalid: {
                                    color: '#E53935',
                                },
                            },
                        }}/>
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={!stripe || loading || !nome || !email || !contato || !isCardComplete}
                className={`w-full text-white py-8 rounded-full text-2xl font-handwritten transition-all flex items-center justify-center gap-4 mt-8 ${
                    (!stripe || loading || !nome || !email || !contato || !isCardComplete)
                        ? "bg-slate-300 cursor-not-allowed shadow-none opacity-50"
                        : "bg-melvin-green hover:bg-melvin-green-dark hover:scale-[1.02] active:scale-95 shadow-2xl shadow-melvin-green/20"
                }`}
            >
                {loading ? "Processando..." : (
                    <>Finalizar Doação de R$ {amount} <LuHeart fill="white" /></>
                )}
            </button>
        </form>
    );
}

function CadastroAmigo() {
    const location = useLocation();
    const navigate = useNavigate();
    const rawState = location.state || {};
    const donationType = rawState.type || (rawState.isMensal ? 'monthly' : 'monthly');
    const amount = rawState.value || rawState.valor || 50;
    const initialData = rawState.user || (rawState.nome ? rawState : null);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="relative overflow-hidden min-h-screen pt-48 pb-20 px-6">
            <WatercolorBlob color="blue" className="-top-20 -right-20 scale-150" />
            <WatercolorBlob color="green" className="bottom-0 -left-20 scale-150" />

            <div className="container mx-auto max-w-2xl relative z-10">
                <motion.button 
                    onClick={() => navigate('/amigos-do-melvin')}
                    className="flex items-center gap-2 text-slate-400 hover:text-melvin-text mb-12 transition-colors group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <LuChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium uppercase tracking-widest text-xs">Voltar</span>
                </motion.button>

                <motion.div {...fadeIn} className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl text-melvin-text mb-6 font-handwritten">
                        Finalizar <span className="text-melvin-green brush-stroke">Apoio</span>
                    </h1>
                    <div className="bg-melvin-green/10 inline-block px-6 py-2 rounded-full text-melvin-green-dark font-medium text-sm mb-4">
                        {donationType === 'monthly' ? 'Assinatura Mensal' : 'Doação Única'} • R$ {amount}
                    </div>
                    <p className="text-lg text-slate-600 font-light max-w-md mx-auto">
                        Seus dados são protegidos por criptografia de ponta a ponta.
                    </p>
                </motion.div>

                <motion.div 
                    {...fadeIn} 
                    transition={{ delay: 0.2 }}
                    className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white/60 shadow-2xl"
                >
                    <Elements stripe={stripePromise}>
                        <CheckoutForm donationType={donationType} amount={amount} initialData={initialData} />
                    </Elements>
                </motion.div>
                
                <p className="mt-12 text-center text-slate-400 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                    Pagamento processado via <span className="text-slate-600">Stripe</span>
                </p>
            </div>
        </div>
    );
}

export default CadastroAmigo;