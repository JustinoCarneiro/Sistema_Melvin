import React from 'react';
import { motion } from 'framer-motion';
import { LuTicket, LuTrophy, LuGift, LuArrowUpRight, LuShieldCheck, LuStar } from 'react-icons/lu';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';
import WaveDivider from '../../../components/melvin/WaveDivider';

// Assets
import foto_principal from "../../../docs/suanotatemvalor.png";
import foto_segunda_faixa from "../../../docs/imagem_nota_valor_aquarela.png";
import foto_terceira_faixa from "../../../docs/money.jpg";

const NotaValor = () => {
    const openNewTab = () => {
        window.open('https://suanotatemvalor.sefaz.ce.gov.br/app/#/services/usuario/cadastro', '_blank');
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="relative overflow-hidden bg-[#FDFCF8] min-h-screen pt-48 pb-12">
            <WatercolorBlob color="green" className="-top-20 -left-20 scale-150" />
            <WatercolorBlob color="blue" className="top-1/2 -right-20 scale-150" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section 1 */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div {...fadeIn}>
                        <div className="flex items-center gap-4 mb-6 text-melvin-green uppercase tracking-widest font-bold">
                            <LuTicket />
                            <span>Programa Nota Tem Valor</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl mb-8 text-melvin-text">
                            Sua Nota Tem <span className="text-melvin-green brush-stroke">Valor!</span>
                        </h1>
                        <p className="text-2xl text-gray-600 font-light leading-relaxed mb-10">
                            Você imagina o que tem por trás da sua nota fiscal? Tem saúde, segurança e oportunidades para quem mais precisa. Ajude o Instituto Melvin e concorra a prêmios mensalmente!
                        </p>
                        <button 
                            onClick={openNewTab}
                            className="bg-melvin-green text-white px-10 py-5 rounded-full text-2xl font-handwritten hover:scale-105 transition-transform shadow-xl flex items-center gap-4"
                        >
                            Cadastre-se Agora <LuArrowUpRight />
                        </button>
                    </motion.div>
                    <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                        <div className="rounded-[4rem] overflow-hidden rotate-2 watercolor-shadow-green border-8 border-white">
                            <img src={foto_principal} alt="Nota Tem Valor" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                </div>

                {/* Section 2 */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div {...fadeIn} className="order-2 lg:order-1">
                        <div className="rounded-[4rem] overflow-hidden -rotate-2 watercolor-shadow-yellow border-8 border-white">
                            <img src={foto_segunda_faixa} alt="Premiações" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                    <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="order-1 lg:order-2">
                        <div className="flex items-center gap-4 mb-6 text-melvin-yellow">
                            <LuTrophy className="w-10 h-10" />
                            <h2 className="text-5xl">Premiações Mensais!</h2>
                        </div>
                        <div className="space-y-6 text-xl text-gray-600 font-light">
                            <p>
                                O programa premia cidadãos por meio de sorteios mensais e oferece até 5% de desconto no IPVA.
                            </p> 
                            <p>
                                Ao adotar o Instituto Melvin no cadastro, você concorre e ainda ajuda a instituição a receber repasses do governo para projetos sociais.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-12">
                            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50">
                                <LuGift className="text-melvin-yellow-dark w-8 h-8 mb-4" />
                                <h4 className="text-2xl mb-2 font-handwritten text-melvin-text">IPVA Zero</h4>
                                <p className="text-sm text-slate-500 font-light">Descontos reais no seu imposto.</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50">
                                <LuStar className="text-melvin-yellow-dark w-8 h-8 mb-4" />
                                <h4 className="text-2xl mb-2 font-handwritten text-melvin-text">Sorteios</h4>
                                <p className="text-sm text-slate-500 font-light">Prêmios em dinheiro todo mês.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Section 3 */}
                <motion.div 
                    {...fadeIn}
                    className="bg-melvin-blue/10 p-12 md:p-24 rounded-[4rem] relative overflow-hidden"
                >
                    <WatercolorBlob color="blue" className="top-0 left-0 opacity-20" />
                    <div className="grid lg:grid-cols-3 gap-12 items-center relative z-10">
                        <div className="lg:col-span-2">
                            <h2 className="text-5xl mb-8 flex items-center gap-4 text-melvin-text">
                                <LuShieldCheck className="text-melvin-blue-dark" />
                                Como funciona a pontuação?
                            </h2>
                            <p className="text-xl text-slate-600 font-light leading-relaxed mb-10">
                                Os sorteios são baseados na Loteria Federal. Cada valor gasto em notas com seu CPF gera pontos que se acumulam durante o mês, aumentando suas chances e a do Instituto Melvin!
                            </p>
                            <button 
                                onClick={openNewTab}
                                className="bg-melvin-blue hover:bg-melvin-blue-dark text-white px-8 py-4 rounded-full text-xl font-handwritten hover:scale-105 transition-transform shadow-xl"
                            >
                                Entrar no Portal Sefaz
                            </button>
                        </div>
                        <div className="rounded-3xl overflow-hidden watercolor-shadow-blue border-4 border-white rotate-3">
                            <img src={foto_terceira_faixa} alt="Pontuação" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <WaveDivider position="bottom" color="fill-white" className="mt-24" />
        </div>
    );
};

export default NotaValor;