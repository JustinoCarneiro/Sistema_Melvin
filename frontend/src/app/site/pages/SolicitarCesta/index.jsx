import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LuUser, LuPhone, LuUsers, LuNetwork, LuFileText, LuSend, LuCircleCheck, LuShieldCheck } from 'react-icons/lu';
import WatercolorBlob from '@core/components/melvin/WatercolorBlob';

import { cestaService } from '@features/Cestas';

const NIVEIS = [
    { valor: 'CELULA', rotulo: 'Líder de Célula' },
    { valor: 'SETOR', rotulo: 'Supervisor de Setor' },
    { valor: 'AREA', rotulo: 'Líder de Área' },
    { valor: 'DISTRITO', rotulo: 'Líder de Distrito' },
    { valor: 'REDE', rotulo: 'Pastor de Rede' }
];

const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const inputClassName = "w-full bg-white/50 border border-white/80 rounded-3xl px-8 py-5 outline-none focus:ring-4 focus:ring-melvin-yellow/10 focus:border-melvin-yellow/30 transition-all text-lg";
const labelClassName = "text-sm font-bold text-melvin-text uppercase tracking-widest flex items-center gap-2 ml-4";

function SolicitarCesta() {
    const [form, setForm] = useState({
        nomeSolicitante: '',
        nivelSolicitante: '',
        nome: '',
        contato: '',
        lider_celula: '',
        rede: '',
        itens_doados: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Mesma trava de duplo-submit usada no cadastro de Amigos do Melvin
    // (ver incidente de cobrança em dobro, 06/06/2026).
    const submittingRef = useRef(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submittingRef.current) return;

        submittingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            await cestaService.solicitar(form);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Não foi possível enviar a solicitação. Tente novamente.');
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="pt-32 sm:pt-40 pb-24 max-w-2xl mx-auto px-4">
                <motion.div {...fadeIn} className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white/60 shadow-2xl relative text-center">
                    <WatercolorBlob color="green" size="w-32 h-32" className="-top-10 -right-10 opacity-20" />

                    <div className="relative z-10">
                        <LuCircleCheck className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl text-melvin-text mb-6">
                            Solicitação <span className="text-melvin-yellow brush-stroke">enviada!</span>
                        </h2>
                        <p className="text-xl text-slate-600 font-light leading-relaxed mb-4">
                            A coordenação do Instituto Melvin recebeu seu pedido e vai avaliar em breve.
                        </p>
                        <p className="text-lg text-slate-500 font-light leading-relaxed">
                            Quando a solicitação for aprovada, você será avisado com a data de retirada da cesta.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-32 sm:pt-40 pb-24 max-w-2xl mx-auto px-4">
            <motion.div {...fadeIn} className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl text-melvin-text mb-6">
                    Solicitar <span className="text-melvin-yellow brush-stroke">Cesta Básica</span>
                </h1>
                <p className="text-xl text-slate-600 font-light leading-relaxed">
                    Preencha os dados abaixo para solicitar uma cesta básica para um membro de célula.
                    A coordenação vai avaliar o pedido e definir a data de retirada.
                </p>
            </motion.div>

            <motion.div 
                {...fadeIn} 
                transition={{ delay: 0.2 }}
                className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white/60 shadow-2xl relative"
            >
                <WatercolorBlob color="yellow" size="w-32 h-32" className="-top-10 -right-10 opacity-20" />
                <WatercolorBlob color="blue" size="w-24 h-24" className="-bottom-8 -left-8 opacity-15" />
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* Dados do solicitante */}
                    <div className="space-y-2">
                        <label className={labelClassName}>
                            <LuUser className="text-melvin-yellow" /> Seu nome
                        </label>
                        <input
                            className={inputClassName}
                            type="text"
                            name="nomeSolicitante"
                            value={form.nomeSolicitante}
                            onChange={handleChange}
                            required
                            placeholder="Nome completo do solicitante"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={labelClassName}>
                            <LuShieldCheck className="text-melvin-yellow" /> Você é líder de:
                        </label>
                        <select
                            className={inputClassName}
                            name="nivelSolicitante"
                            value={form.nivelSolicitante}
                            onChange={handleChange}
                            required
                        >
                            <option value="" hidden>Selecione...</option>
                            {NIVEIS.map(nivel => (
                                <option key={nivel.valor} value={nivel.valor}>{nivel.rotulo}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dados do beneficiário */}
                    <div className="pt-4 border-t border-white/40">
                        <p className="text-xs font-bold text-melvin-blue uppercase tracking-widest ml-4 mb-6">
                            Dados de quem vai receber
                        </p>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className={labelClassName}>
                                    <LuUser className="text-melvin-yellow" /> Nome do beneficiário
                                </label>
                                <input
                                    className={inputClassName}
                                    type="text"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nome de quem vai receber a cesta"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={labelClassName}>
                                        <LuPhone className="text-melvin-yellow" /> Contato
                                    </label>
                                    <input
                                        className={inputClassName}
                                        type="text"
                                        name="contato"
                                        value={form.contato}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClassName}>
                                        <LuNetwork className="text-melvin-yellow" /> Rede
                                    </label>
                                    <input
                                        className={inputClassName}
                                        type="text"
                                        name="rede"
                                        value={form.rede}
                                        onChange={handleChange}
                                        placeholder="Nome da rede"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClassName}>
                                    <LuUsers className="text-melvin-yellow" /> Líder da célula
                                </label>
                                <input
                                    className={inputClassName}
                                    type="text"
                                    name="lider_celula"
                                    value={form.lider_celula}
                                    onChange={handleChange}
                                    placeholder="Nome do líder da célula"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClassName}>
                                    <LuFileText className="text-melvin-yellow" /> Observações (opcional)
                                </label>
                                <textarea
                                    className={`${inputClassName} resize-y min-h-[120px]`}
                                    name="itens_doados"
                                    value={form.itens_doados}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Alguma informação que a coordenação precise saber"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-6 rounded-2xl text-base border border-red-200/50">
                            {error}
                        </div>
                    )}

                    <button
                        className="w-full bg-melvin-yellow hover:bg-melvin-yellow-dark text-melvin-text py-6 rounded-full text-2xl font-handwritten hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-melvin-yellow/20 flex items-center justify-center gap-4 mt-12 disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : (
                            <>Enviar Solicitação <LuSend /></>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default SolicitarCesta;
