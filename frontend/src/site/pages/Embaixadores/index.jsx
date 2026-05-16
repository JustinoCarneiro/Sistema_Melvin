import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { LuAward, LuStar, LuMessageCircle, LuChevronRight, LuUser, LuPhone, LuInstagram, LuMail, LuSend } from 'react-icons/lu';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';
import WaveDivider from '../../../components/melvin/WaveDivider';
import get from '../../../services/requests/get';
import post from '../../../services/requests/post';
import { cn } from '../../../services/utils';

// Assets
import foto_principal from "../../../docs/imagem_embaixadores.png";

const Embaixadores = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [embaixadores, setEmbaixadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [nome, setNome] = useState('');
    const [contato, setContato] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        
        const embaixadorData = {
            nome,
            contato,
            instagram,
            email,
            contatado: false,
            status: false
        };

        try {
            await post.embaixadores(embaixadorData);
            alert('Informações enviadas com sucesso! Entraremos em contato em breve.');
            setNome('');
            setContato('');
            setInstagram('');
            setEmail('');
        } catch (error) {
            console.error("Erro ao enviar as informações do embaixador:", error);
            alert('Erro ao enviar as informações. Tente novamente.');
        } finally {
            setFormLoading(false);
        }
    };

    useEffect(() => {
        const fetchEmbaixadores = async () => {
            try {
                const response = await get.embaixadores();
                const dados = response.data;

                if (!Array.isArray(dados)) {
                    setError(new Error("Erro ao carregar dados dos embaixadores."));
                    setLoading(false);
                    return;
                }

                const embaixadoresData = await Promise.all(dados
                    .filter(embaixador => embaixador.status)
                    .map(async embaixador => {
                        try {
                            const imagemResponse = await get.imagemlista();
                            const imagemData = Array.isArray(imagemResponse.data) ? imagemResponse.data : [];
                            const imagemParaEmbaixador = imagemData.find(imagem => imagem.idAtrelado === embaixador.id && imagem.tipo === 'embaixador');

                            if (imagemParaEmbaixador) {
                                const imageUrl = `${import.meta.env.VITE_REACT_APP_FETCH_URL}${imagemParaEmbaixador.filePath}`;
                                return { ...embaixador, imageUrl };
                            }
                            return { ...embaixador, imageUrl: null };
                        } catch (imageError) {
                            return { ...embaixador, imageUrl: null };
                        }
                    })
                );

                setEmbaixadores(embaixadoresData);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }
        fetchEmbaixadores();
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-melvin-blue border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-[#FDFCF8] min-h-screen pt-48 pb-12">
            <WatercolorBlob color="blue" className="-top-10 -right-10 scale-125" />
            <WatercolorBlob color="yellow" className="bottom-0 -left-10 scale-125" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <motion.div {...fadeIn}>
                        <h1 className="text-6xl md:text-8xl mb-8 text-melvin-text">
                            Seja um <span className="text-melvin-yellow brush-stroke">Embaixador</span>
                        </h1>
                        <div className="space-y-6 text-2xl text-gray-600 font-light leading-relaxed">
                            <p>
                                Use sua influência para fazer a diferença! Como embaixador, você ajudará a divulgar nossas ações e campanhas.
                            </p>
                            <p>
                                Sua voz pode impactar vidas e trazer recursos essenciais para nossos projetos em Fortaleza.
                            </p>
                        </div>
                        <button 
                            onClick={scrollToForm}
                            className="mt-10 bg-melvin-yellow text-melvin-text px-10 py-5 rounded-full text-2xl font-handwritten hover:scale-105 transition-transform shadow-xl flex items-center gap-4"
                        >
                            Quero ser um embaixador! <LuStar fill="currentColor" />
                        </button>
                    </motion.div>
                    <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                        <div className="rounded-[4rem] overflow-hidden -rotate-2 hover:rotate-0 transition-transform duration-700 watercolor-shadow-yellow border-8 border-white">
                            <img src={foto_principal} alt="Embaixadores" className="w-full h-[500px] object-cover" />
                        </div>
                    </motion.div>
                </div>

                {/* Embaixadores List */}
                {embaixadores.length > 0 && (
                    <div className="py-24">
                        <motion.h2 {...fadeIn} className="text-5xl text-center mb-16">
                            Nossos <span className="text-melvin-blue brush-stroke">Embaixadores</span> Atuais
                        </motion.h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {embaixadores.map((embaixador, i) => (
                                <motion.div 
                                    key={embaixador.id}
                                    {...fadeIn}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/30 backdrop-blur-md p-8 rounded-[3rem] shadow-xl text-center group hover-lift border-2 border-white/50"
                                >
                                    <div className="relative w-48 h-48 mx-auto mb-8">
                                        <WatercolorBlob color="blue" size="w-48 h-48" className="scale-125 opacity-10 group-hover:rotate-45 transition-transform duration-1000" />
                                        <img
                                            src={embaixador.imageUrl}
                                            alt={embaixador.nome}
                                            className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                        />
                                        <LuAward className="absolute -bottom-2 -right-2 w-12 h-12 text-melvin-yellow drop-shadow-md z-20" />
                                    </div>
                                    <h3 className="text-3xl mb-4 text-melvin-text">{embaixador.nome}</h3>
                                    <p className="text-lg text-slate-600 font-light line-clamp-3 leading-relaxed">
                                        {embaixador.descricao}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Registration Form Section */}
                <div ref={formRef} className="py-24 max-w-2xl mx-auto">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl text-melvin-text mb-6">
                            Você está perto de ser um <span className="text-melvin-yellow brush-stroke">Embaixador</span>
                        </h2>
                        <p className="text-xl text-slate-600 font-light leading-relaxed">
                            Precisamos apenas de alguns dados para entrar em contato e explicar como você pode nos ajudar.
                        </p>
                    </motion.div>

                    <motion.div 
                        {...fadeIn} 
                        transition={{ delay: 0.2 }}
                        className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white/60 shadow-2xl relative"
                    >
                        <WatercolorBlob color="yellow" size="w-32 h-32" className="-top-10 -right-10 opacity-20" />
                        
                        <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-melvin-text uppercase tracking-widest flex items-center gap-2 ml-4">
                                    <LuUser className="text-melvin-yellow" /> Nome Completo
                                </label>
                                <input 
                                    className="w-full bg-white/50 border border-white/80 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-melvin-yellow/10 focus:border-melvin-yellow/30 transition-all text-lg"
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Como prefere ser chamado?"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-melvin-text uppercase tracking-widest flex items-center gap-2 ml-4">
                                        <LuPhone className="text-melvin-yellow" /> Contato/WhatsApp
                                    </label>
                                    <input
                                        className="w-full bg-white/50 border border-white/80 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-melvin-yellow/10 focus:border-melvin-yellow/30 transition-all text-lg" 
                                        type="text"
                                        required
                                        value={contato}
                                        onChange={(e) => setContato(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-melvin-text uppercase tracking-widest flex items-center gap-2 ml-4">
                                        <LuInstagram className="text-melvin-yellow" /> Instagram
                                    </label>
                                    <input
                                        className="w-full bg-white/50 border border-white/80 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-melvin-yellow/10 focus:border-melvin-yellow/30 transition-all text-lg" 
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="@seuusuario"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-melvin-text uppercase tracking-widest flex items-center gap-2 ml-4">
                                    <LuMail className="text-melvin-yellow" /> E-mail
                                </label>
                                <input 
                                    className="w-full bg-white/50 border border-white/80 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-melvin-yellow/10 focus:border-melvin-yellow/30 transition-all text-lg"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <button 
                                className="w-full bg-melvin-yellow hover:bg-melvin-yellow-dark text-melvin-text py-6 rounded-full text-2xl font-handwritten hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-melvin-yellow/20 flex items-center justify-center gap-4 mt-12 disabled:opacity-50"
                                type="submit"
                                disabled={formLoading}
                            >
                                {formLoading ? "Enviando..." : (
                                    <>Enviar Solicitação <LuSend /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <WaveDivider position="bottom" color="fill-white" />
        </div>
    );
};

export default Embaixadores;