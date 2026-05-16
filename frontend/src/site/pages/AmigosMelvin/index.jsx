import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { LuHeart, LuStar, LuMessageSquare, LuPhone, LuMail, LuUser, LuCalendar } from 'react-icons/lu';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';
import WaveDivider from '../../../components/melvin/WaveDivider';
import { cn } from '../../../services/utils';

// Assets
import img_hero from "../../../docs/imagem_amigos_bola.png";
import img_form from "../../../docs/imagem_amigo_form.png";
import img_form_2 from "../../../docs/imagem_amigo_hero.png";

const AmigosMelvin = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(50);
    const [customValue, setCustomValue] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        dia: '',
        mensagem: ''
    });

    const plans = [
        { value: 30, label: 'R$ 30' },
        { value: 50, label: 'R$ 50' },
        { value: 100, label: 'R$ 100' },
        { value: 0, label: 'Outro' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCurrencyChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value) {
            setCustomValue("");
            return;
        }
        const numericValue = parseInt(value, 10) / 100;
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(numericValue);
        setCustomValue(formattedValue);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let parsedCustomValue = 0;
        if (customValue) {
            parsedCustomValue = parseFloat(customValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
        }
        
        const finalValue = selectedPlan === 0 ? parsedCustomValue : selectedPlan;

        if (!finalValue || finalValue < 30) {
            alert('O valor mínimo para apoio mensal é de R$ 30,00.');
            return;
        }

        // Pass selection to checkout
        navigate('/cadastroamigo', {
            state: {
                valor: finalValue,
                isMensal: true,
                ...formData
            }
        });
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-melvin-blue/10 via-melvin-yellow/10 to-melvin-green/10 pt-20 overflow-hidden relative">
            {/* Background Blobs */}
            <WatercolorBlob color="bg-melvin-red/5" className="top-0 -left-20 w-[600px] h-[600px]" />
            <WatercolorBlob color="bg-melvin-blue/5" className="bottom-0 -right-20 w-[600px] h-[600px]" />

            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div {...fadeIn}>
                        <div className="flex items-center gap-4 mb-6 text-melvin-red uppercase tracking-widest font-bold">
                            <span>Programa de apoio mensal</span>
                        </div>
                        <h1 className="text-7xl md:text-8xl text-melvin-text mb-8 leading-tight">
                            Amigos do <span className="text-melvin-red brush-stroke">Melvin</span>
                        </h1>
                        <p className="text-xl text-slate-600 font-light leading-relaxed mb-10 max-w-xl">
                            Faça a diferença na vida de nossas crianças. Com sua doação mensal, você sustenta a alimentação dos alunos e a distribuição de cestas básicas para suas famílias.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 0.8, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl watercolor-shadow-red transform hover:rotate-0 transition-transform duration-500">
                            <img
                                src={img_hero}
                                alt="Crianças do Instituto"
                                className="rounded-[1.5rem] w-full aspect-[4/5] object-cover"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-melvin-red text-white p-6 rounded-3xl shadow-xl rotate-12">
                                <p className="text-2xl font-bold">Doe Amor ❤️</p>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-melvin-yellow/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-melvin-blue/20 rounded-full blur-3xl animate-pulse delay-700" />
                    </motion.div>
                </div>
            </section>

            {/* Donation Flow Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Form Side */}
                        <motion.div {...fadeIn} className="relative z-10 bg-[#faf9f6] p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 max-w-2xl mx-auto w-full">
                            <h2 className="text-4xl text-melvin-text mb-8">Escolha como <span className="text-melvin-red italic">ajudar</span></h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Value Selection */}
                                <div className="space-y-4">
                                    <p className="text-slate-500 font-medium">Selecione o valor mensal:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {plans.map((plan) => (
                                            <button
                                                key={plan.value}
                                                type="button"
                                                onClick={() => setSelectedPlan(plan.value)}
                                                className={cn(
                                                    "py-4 rounded-2xl font-bold transition-all duration-300 border-2",
                                                    selectedPlan === plan.value
                                                        ? "bg-melvin-red border-melvin-red text-white shadow-lg scale-105"
                                                        : "bg-white border-slate-100 text-slate-400 hover:border-melvin-red/30 hover:text-melvin-red"
                                                )}
                                            >
                                                {plan.label}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedPlan === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative"
                                        >
                                            <input
                                                type="text"
                                                placeholder="R$ 0,00"
                                                value={customValue}
                                                onChange={handleCurrencyChange}
                                                className="w-full bg-white border-2 border-melvin-red/20 rounded-2xl p-4 outline-none focus:border-melvin-red transition-colors text-lg"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* User Data */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <LuUser className="text-melvin-red" /> Nome Completo
                                        </label>
                                        <input
                                            required
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleInputChange}
                                            placeholder="Como prefere ser chamado?"
                                            className="w-full bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-melvin-red/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <LuMail className="text-melvin-red" /> E-mail
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="voce@email.com"
                                            className="w-full bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-melvin-red/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <LuPhone className="text-melvin-red" /> Telefone (WhatsApp)
                                        </label>
                                        <input
                                            required
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleInputChange}
                                            placeholder="(85) 9 9999-9999"
                                            className="w-full bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-melvin-red/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                            <LuCalendar className="text-melvin-red" /> Melhor dia do mês
                                        </label>
                                        <input
                                            required
                                            name="dia"
                                            value={formData.dia}
                                            onChange={handleInputChange}
                                            placeholder="Ex: dia 5"
                                            className="w-full bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-melvin-red/50 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <LuMessageSquare className="text-melvin-red" /> Mensagem (Opcional)
                                    </label>
                                    <textarea
                                        name="mensagem"
                                        value={formData.mensagem}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Quer compartilhar algo com a gente?"
                                        className="w-full bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-melvin-red/50 transition-colors resize-none"
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-melvin-red/5 rounded-2xl border border-melvin-red/10">
                                    <input 
                                        type="checkbox" 
                                        required 
                                        className="mt-1 accent-melvin-red" 
                                        id="terms" 
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    />
                                    <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                                        Autorizo a coleta e o tratamento dos meus dados pessoais pelo Instituto Social Melvin para a gestão da minha doação mensal e envio de comunicações do projeto, conforme a LGPD. Compreendo que os dados de pagamento são processados em ambiente seguro externo (Stripe) e que posso solicitar a exclusão dos meus dados ou o cancelamento da assinatura a qualquer momento pelo WhatsApp (85) 99924-3836.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!(agreedToTerms && formData.nome && formData.email && formData.telefone && formData.dia && (selectedPlan > 0 || customValue))}
                                    className={cn(
                                        "w-full text-white py-6 rounded-full font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-3",
                                        (agreedToTerms && formData.nome && formData.email && formData.telefone && formData.dia && (selectedPlan > 0 || customValue)) 
                                            ? "bg-melvin-red shadow-melvin-red/20 hover:scale-[1.02] active:scale-[0.98]" 
                                            : "bg-slate-300 cursor-not-allowed shadow-none opacity-50"
                                    )}
                                >
                                    Quero ser amigo! <LuHeart className="fill-white" />
                                </button>
                            </form>
                        </motion.div>

                        {/* Visual Side */}
                        <div className="flex flex-col justify-center">

                            <div className="relative space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 20, rotate: 3 }}
                                    whileInView={{ opacity: 1, x: 0, rotate: 5 }}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 0.8, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-3 rounded-3xl shadow-xl border border-slate-100 max-w-sm mx-auto lg:ml-auto watercolor-shadow-blue cursor-pointer"
                                >
                                    <img src={img_form} alt="Apoio" className="rounded-2xl" />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20, rotate: -3 }}
                                    whileInView={{ opacity: 1, x: 0, rotate: -3 }}
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 0.8, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
                                    whileHover={{ scale: 1.05, rotate: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-3 rounded-3xl shadow-xl border border-slate-100 max-w-sm mx-auto watercolor-shadow-yellow cursor-pointer"
                                >
                                    <img src={img_form_2} alt="Impacto" className="rounded-2xl" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AmigosMelvin;