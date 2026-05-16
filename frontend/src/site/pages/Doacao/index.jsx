import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCopy, LuCheck, LuHeart, LuShieldCheck, LuZap, LuShoppingBag, LuBookOpen, LuHandHeart, LuArrowRight } from 'react-icons/lu';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';
import WaveDivider from '../../../components/melvin/WaveDivider';

// Assets
import qrcode from "../../../docs/qrcode.jpeg";
import imagem_doacao from "../../../docs/imagem_doacao_crianca.jpg";

const Doacao = () => {
  const [copied, setCopied] = useState(false);
  const pixKey = "13.285.292/0001-06";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="relative overflow-hidden min-h-screen pt-48 pb-32">
      <WatercolorBlob color="red" className="-top-10 -right-10 scale-125" />
      <WatercolorBlob color="yellow" className="bottom-0 -left-10 scale-125" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div {...fadeIn} className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl mb-6 text-melvin-text">Sua Doação Transforma <span className="text-melvin-red brush-stroke">Vidas</span></h1>
          <p className="text-2xl text-gray-600 font-light max-w-2xl mx-auto">
            Cada real doado é investido diretamente em nossos programas de assistência social e educação.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Pix Card */}
          <motion.div 
            {...fadeIn} 
            className="bg-white/30 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-[3rem] watercolor-shadow-red border-2 border-white/50 w-full overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-8">
              <LuZap className="text-melvin-yellow w-10 h-10 shrink-0" />
              <h2 className="text-3xl sm:text-4xl font-handwritten">Doação via PIX</h2>
            </div>
            
            <p className="text-lg sm:text-xl mb-8 text-gray-600 text-center sm:text-left">
              Aponte a câmera do seu celular para o QR Code abaixo ou copie a chave PIX.
            </p>

            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white rounded-[2.5rem] border-4 border-melvin-red/10 shadow-lg shadow-melvin-red/5">
                <img src={qrcode} alt="QR Code PIX" className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover" />
              </div>
            </div>

            <div className="relative group w-full">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="w-full">
                  <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest mb-1">Chave CNPJ</p>
                  <p className="text-lg sm:text-2xl font-body font-bold text-melvin-text break-all">{pixKey}</p>
                </div>
                <button 
                  onClick={handleCopy}
                  className="bg-melvin-red text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 w-full sm:w-auto flex justify-center"
                >
                  {copied ? <LuCheck /> : <LuCopy />}
                </button>
              </div>
              {copied && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 right-0 bg-melvin-green text-white px-4 py-2 rounded-xl text-sm"
                >
                  Copiado!
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <div className="rounded-[4rem] overflow-hidden mb-12 watercolor-shadow-blue border-8 border-white -rotate-2">
              <img src={imagem_doacao} alt="Doação" className="w-full h-96 object-cover object-[center_75%]" />
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="bg-melvin-blue/10 p-4 rounded-3xl h-fit">
                  <LuShieldCheck className="text-melvin-blue-dark w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl mb-2 text-melvin-text font-handwritten">Transparência Total</h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">Nossas contas são auditadas e publicamos relatórios periódicos de impacto.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="bg-melvin-green/10 p-4 rounded-3xl h-fit">
                  <LuHeart className="text-melvin-green-dark w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl mb-2 text-melvin-text font-handwritten">Impacto Direto</h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">Sua contribuição vai direto para a compra de cestas básicas e material escolar.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Outras Formas de Ajudar Section */}
        <section className="pt-32">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-melvin-text">Outras formas de ajudar</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: LuShoppingBag,
                title: "Alimentos",
                desc: "Cestas básicas e itens não perecíveis para as famílias.",
                color: "text-melvin-red",
                link: "https://wa.me/5585999243836"
              },
              {
                icon: LuBookOpen,
                title: "Materiais escolares",
                desc: "Cadernos, livros, lápis e mochilas.",
                color: "text-melvin-red",
                link: "https://wa.me/5585999243836"
              },
              {
                icon: LuHandHeart,
                title: "Voluntariado",
                desc: "Doe seu tempo e talento ao Instituto.",
                color: "text-melvin-red",
                link: "https://wa.me/5585999243836"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                {...fadeIn}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-10 rounded-[2.5rem] text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all border border-gray-50"
              >
                <div className={`mx-auto mb-6 flex items-center justify-center ${item.color}`}>
                  <div className="w-16 h-16 rounded-full bg-melvin-red/5 flex items-center justify-center">
                    <item.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-melvin-text mb-4 font-body">{item.title}</h3>
                <p className="text-slate-500 font-light mb-8 px-2 text-sm">{item.desc}</p>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs uppercase tracking-wider font-medium text-slate-500 hover:text-melvin-red transition-colors flex items-center justify-center gap-1"
                >
                  Falar no WhatsApp <LuArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Doacao;