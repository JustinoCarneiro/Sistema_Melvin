import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LuHeart, LuUsers, LuGlobe, LuBookOpen, LuStar, LuSun,
  LuMapPin, LuPhone, LuMail, LuArrowRight, LuInstagram,
  LuLeaf, LuTarget, LuAward, LuZap, LuPalette, LuDribbble, LuGraduationCap, LuMessageCircle, LuShieldCheck,
  LuLightbulb, LuFileText, LuCheck, LuCopy
} from 'react-icons/lu';
import { cn } from '../../../services/utils';
import voluntarioService from '../../../services/voluntarioService';
import WatercolorBlob from '../../../components/melvin/WatercolorBlob';

// Assets
import foto_principal from "../../../docs/imagem_sobrenos.jpeg";
import img_apoio_side from "../../../docs/imagem_principal.jpeg";
import o1 from "../../../docs/01_1.png";
import o3 from "../../../docs/03_0.png";
import o4 from "../../../docs/04_0.png";
import o16 from "../../../docs/16_0.png";
import m1 from "../../../docs/momento_estudo.png";
import m2 from "../../../docs/momento_arte.png";
import m3 from "../../../docs/momento_familia.png";
import img_nota from "../../../docs/suanotatemvalor.png";
import img_qrcode from "../../../docs/qrcode.jpeg";
import v1 from "../../../docs/videos/snapinsta.com.br-6a02122ec6937.mp4";
import v2 from "../../../docs/videos/snapinsta.com.br-6a02125699223.mp4";
import v3 from "../../../docs/videos/snapinsta.com.br-6a0212820c0d6.mp4";
import v4 from "../../../docs/videos/snapinsta.com.br-6a02129a1f7e0.mp4";
import v5 from "../../../docs/videos/snapinsta.com.br-6a0212b0e4153.mp4";
import v6 from "../../../docs/videos/snapinsta.com.br-6a0212e8ae5f7.mp4";
const WavyDivider = ({ className, flip }) => (
  <div className={cn("w-full h-48 pointer-events-none relative z-10", className, flip && "rotate-180")}>
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M0,160 L0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,80 L1440,160 Z"
        fill="white"
        fillOpacity="0.3"
      />
      <path
        d="M0,160 L0,100 C180,160 360,40 540,100 C720,160 900,40 1080,100 C1260,160 1440,100 L1440,160 Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M0,160 L0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,60 L1440,160 Z"
        fill="white"
        fillOpacity="0.1"
      />
    </svg>
  </div>
);

const HoverVideoCard = ({ item, index }) => {
  const videoRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Play interrupted", e));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <motion.a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20, rotate: item.rotate }}
      whileInView={{ opacity: 1, y: 0, rotate: item.rotate }}
      viewport={{ once: true }}
      transition={{
        opacity: { duration: 0.6, delay: index * 0.1 },
        y: { duration: 0.6, delay: index * 0.1 },
        rotate: { duration: 0.8, type: "spring", stiffness: 100 }
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="block shrink-0 w-64 md:w-80 snap-center rounded-[1.5rem] bg-white p-3 shadow-2xl border border-gray-100 cursor-pointer relative group"
    >
      <div className="rounded-[1rem] overflow-hidden aspect-[9/16] bg-gray-50 relative pointer-events-none">
        {item.video ? (
          <video
            ref={videoRef}
            src={item.video}
            preload="metadata"
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <img
            src={item.img}
            alt="Momento"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        {/* Overlay do Instagram que aparece ao passar o mouse */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full flex flex-col items-center">
            <LuInstagram className="w-8 h-8 text-white mb-2" />
            <span className="text-white text-xs font-bold uppercase tracking-wider">Assistir Reel</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [voluntarios, setVoluntarios] = useState([]);
  const [loadingVoluntarios, setLoadingVoluntarios] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("13.285.292/0001-06");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchVoluntarios = async () => {
      try {
        const response = await voluntarioService.listNomesFuncoes();
        const colors = [
          "bg-melvin-red/20",
          "bg-melvin-green/20",
          "bg-melvin-yellow/20",
          "bg-melvin-blue/20"
        ];

        // Take maximum 8 volunteers to match the grid layout
        const mappedData = (response.data || []).slice(0, 8).map((vol, index) => ({
          name: vol.nome,
          role: vol.funcao || 'Voluntário',
          initial: vol.nome ? vol.nome.charAt(0).toUpperCase() : 'V',
          color: colors[index % colors.length]
        }));
        setVoluntarios(mappedData);
      } catch (error) {
        console.error("Erro ao carregar voluntários:", error);
      } finally {
        setLoadingVoluntarios(false);
      }
    };
    fetchVoluntarios();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full max-w-[100vw]">
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 sm:pt-32 pb-12 sm:pb-24 px-4 sm:px-6 z-10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-2 bg-melvin-green/20 text-melvin-green-dark px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-8">
              <LuLeaf className="w-4 h-4" /> OSCIP desde 2010
            </div>

            <h1 className="mb-4 sm:mb-8 leading-[1.05]">
              <span className="font-handwritten text-melvin-blue text-5xl sm:text-7xl md:text-8xl block mb-1 sm:mb-2">Transformando</span>
              <span className="font-body font-bold text-melvin-text text-4xl sm:text-6xl md:text-7xl tracking-tight">histórias com amor</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-melvin-text/80 font-light mb-6 sm:mb-12 max-w-xl leading-relaxed">
              O Instituto Melvin Huber acolhe crianças, jovens e famílias em situação de vulnerabilidade social — hoje somos mais de 400 famílias caminhando juntas.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-6">
              <button
                onClick={() => navigate('/amigos-do-melvin')}
                className="bg-melvin-red text-white px-6 sm:px-10 py-3 sm:py-5 rounded-3xl text-xl sm:text-2xl font-handwritten hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 sm:gap-3 shadow-xl"
              >
                <LuHeart className="w-5 h-5 sm:w-6 sm:h-6" fill="white" /> Quero ser amigo
              </button>
              <button
                onClick={() => navigate('/doacoes')}
                className="bg-melvin-green/40 text-melvin-text px-6 sm:px-10 py-3 sm:py-5 rounded-3xl text-xl sm:text-2xl font-handwritten hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 sm:gap-3 shadow-lg"
              >
                <LuZap className="w-5 h-5 sm:w-6 sm:h-6" /> Fazer doação
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl bg-white/20 backdrop-blur-md p-3 sm:p-6 border border-white/40">
              <div className="rounded-[2rem] sm:rounded-[4rem] overflow-hidden aspect-[4/3] sm:aspect-square lg:aspect-[4/5]">
                <img src={foto_principal} alt="Melvin Huber" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-[120%] h-[120%] bg-melvin-yellow/20 rounded-full -z-10 blur-3xl" />
          </motion.div>
        </div>
      </section>

      <WavyDivider className="-mt-12 mb-12" />

      {/* 7. HISTÓRIAS QUE FLORESCEM SECTION */}
      <section className="py-12 sm:py-24 px-6 relative z-10 text-center">
        <motion.div {...fadeIn} className="mb-16">
          <span className="font-handwritten text-melvin-blue text-3xl mb-4 block">Momentos</span>
          <h2 className="text-5xl md:text-6xl font-bold text-melvin-text font-handwritten">Histórias que florescem</h2>
        </motion.div>

        <div className="w-full max-w-[100vw] overflow-hidden">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-12 pt-4 px-6 md:px-12 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { 
                img: m1, 
                video: v1, 
                rotate: -2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              },
              { 
                img: m2, 
                video: v2, 
                rotate: 2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              },
              { 
                img: m3, 
                video: v3, 
                rotate: -2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              },
              { 
                img: m1, 
                video: v4, 
                rotate: 2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              },
              { 
                img: m2, 
                video: v5, 
                rotate: -2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              },
              { 
                img: m3, 
                video: v6, 
                rotate: 2, 
                link: "https://www.instagram.com/instituto_melvin/" 
              }
          ].map((item, i) => (
            <HoverVideoCard key={i} item={item} index={i} />
          ))}
          </div>
        </div>
      </section>

      <WavyDivider className="rotate-180 my-12" flip />

      {/* 2. QUEM SOMOS SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20">
          <motion.div {...fadeIn}>
            <span className="font-handwritten text-melvin-blue text-3xl mb-4 block">Quem somos</span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text mb-6 sm:mb-10 leading-tight">Uma história de compaixão e dedicação</h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-xl text-slate-700 font-normal leading-relaxed">
              <p>O Instituto Melvin Edward Huber é uma organização da sociedade civil de interesse público e sem fins lucrativos, voltada ao auxílio e amparo de crianças, jovens, adultos e idosos em situação de vulnerabilidade social.</p>
              <p>Fundado em <span className="font-semibold text-melvin-text">23 de fevereiro de 2010</span> com 18 famílias, hoje atendemos <span className="font-semibold text-melvin-text">mais de 400 famílias</span>. Trabalhamos no contraturno escolar para fortalecer vínculos familiares e ativar potenciais por meio de oficinas de arte, esporte, cursos profissionalizantes, palestras, rodas de conversa e terapias de grupo.</p>
              <p>O nome homenageia o missionário norte-americano <span className="italic">Melvin Edward Huber</span> (1920-2008), que junto à esposa Catherine Von Tobel deixou os EUA em 1956 e serviu o Brasil por 52 anos.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[
              { title: "Missão", desc: "Promover o desenvolvimento integral de crianças, adolescentes e famílias com vista à plena cidadania.", color: "bg-melvin-red/20", icon: LuStar, iconColor: "text-melvin-red-dark", shadow: "shadow-[0_20px_40px_-15px_rgba(241,148,148,0.4)]" },
              { title: "Visão", desc: "Servir com responsabilidade e amor, fortalecendo o desenvolvimento físico, emocional e espiritual.", color: "bg-melvin-green/20", icon: LuSun, iconColor: "text-melvin-green-dark", shadow: "shadow-[0_20px_40px_-15px_rgba(168,230,186,0.4)]" },
              { title: "Valores", desc: "Amor, solidariedade, transparência, ética, amizade, compromisso e respeito ao próximo.", color: "bg-melvin-yellow/20", icon: LuHeart, iconColor: "text-melvin-yellow-dark", shadow: "shadow-[0_20px_40px_-15px_rgba(255,230,128,0.4)]" },
              { title: "Reconhecimento", desc: "OSCIP MJ • Lei Municipal 11.170/21 • Lei Estadual 17.960/22.", color: "bg-melvin-blue/20", icon: LuLeaf, iconColor: "text-melvin-blue-dark", shadow: "shadow-[0_20px_40px_-15px_rgba(174,203,250,0.4)]" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                whileHover={{ rotate: 2, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] backdrop-blur-md flex flex-col items-start gap-3 sm:gap-6 border border-white/40 cursor-pointer",
                  item.color,
                  item.shadow
                )}
              >
                <item.icon className={cn("w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2", item.iconColor)} />
                <div>
                  <h3 className="text-xl sm:text-2xl font-handwritten text-melvin-text mb-1 sm:mb-2 leading-none">{item.title}</h3>
                  <p className="text-slate-800 font-body font-medium text-xs sm:text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WavyDivider className="mb-24" />

      {/* 3. ODS SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 text-center overflow-hidden">
        <motion.div {...fadeIn} className="mb-10 sm:mb-20">
          <span className="font-handwritten text-melvin-blue text-2xl sm:text-3xl mb-2 sm:mb-4 block">Nosso compromisso</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text">Objetivos do Desenvolvimento Sustentável</h2>
        </motion.div>

        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 max-w-6xl">
          {[
            { img: o1, label: "ERRADICAÇÃO DA POBREZA", shadow: "shadow-[0_20px_50px_rgba(242,139,130,0.3)]" },
            { img: o3, label: "SAÚDE E BEM-ESTAR", shadow: "shadow-[0_20px_50px_rgba(168,218,181,0.3)]" },
            { img: o4, label: "EDUCAÇÃO DE QUALIDADE", shadow: "shadow-[0_20px_50px_rgba(253,222,125,0.3)]" },
            { img: o16, label: "PAZ E JUSTIÇA", shadow: "shadow-[0_20px_50px_rgba(174,203,250,0.3)]" },
          ].map((ods, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}>
              <div className={cn("w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl mx-auto mb-4 sm:mb-8 flex items-center justify-center overflow-hidden transition-transform hover:scale-110 shadow-lg")}>
                <img
                  src={ods.img}
                  alt={ods.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-bold tracking-[0.2em] text-melvin-text/60 uppercase">{ods.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <WavyDivider className="rotate-180 my-24" flip />

      {/* 4. FRENTES DE ATUAÇÃO SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 text-center">
        <motion.div {...fadeIn} className="mb-10 sm:mb-20">
          <span className="font-handwritten text-melvin-blue text-2xl sm:text-3xl mb-2 sm:mb-4 block">O que fazemos</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text">Nossas frentes de atuação</h2>
        </motion.div>

        <div className="container mx-auto grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {[
            { icon: LuBookOpen, title: "Contraturno Escolar", desc: "Reforço e acompanhamento pedagógico no contraturno.", color: "text-melvin-red-dark", bg: "bg-melvin-red/20" },
            { icon: LuPalette, title: "Oficinas de Arte", desc: "Expressão criativa através da pintura, música e teatro.", color: "text-melvin-yellow-dark", bg: "bg-melvin-yellow/20" },
            { icon: LuStar, title: "Esporte", desc: "Disciplina, saúde e trabalho em equipe.", color: "text-melvin-green-dark", bg: "bg-melvin-green/20" },
            { icon: LuGraduationCap, title: "Cursos Profissionalizantes", desc: "Capacitação para gerar renda e autonomia.", color: "text-melvin-blue-dark", bg: "bg-melvin-blue/20" },
            { icon: LuMessageCircle, title: "Rodas de Conversa", desc: "Palestras e diálogos sobre cidadania e família.", color: "text-melvin-red-dark", bg: "bg-melvin-red/20" },
            { icon: LuHeart, title: "Terapias de Grupo", desc: "Cuidado emocional e fortalecimento de vínculos.", color: "text-melvin-green-dark", bg: "bg-melvin-green/20" },
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              whileHover={{ rotate: 2, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn("p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] backdrop-blur-xl text-left shadow-xl flex flex-col items-start gap-3 sm:gap-6 cursor-pointer", item.bg)}
            >
              <div className={cn("w-12 h-12 shrink-0 rounded-[1rem] bg-white/40 flex items-center justify-center")}>
                <item.icon className={cn("w-6 h-6", item.color)} />
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-handwritten text-melvin-text mb-1 leading-none">{item.title}</h3>
                <p className="text-gray-500 font-light text-[11px] sm:text-[13px] leading-tight">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <WavyDivider className="my-24" />

      {/* 5. IMPACTO EM NÚMEROS SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 text-center">
        <motion.div {...fadeIn} className="mb-10 sm:mb-20">
          <span className="font-handwritten text-melvin-blue text-2xl sm:text-3xl mb-2 sm:mb-4 block">Transparência</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text">Nosso impacto em números</h2>
        </motion.div>

        <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {[
            { count: "400+", label: "Famílias atendidas", icon: LuHeart, color: "bg-melvin-red/10", iconColor: "text-melvin-red" },
            { count: "15", label: "Anos de história", icon: LuStar, color: "bg-melvin-yellow/10", iconColor: "text-melvin-yellow" },
            { count: "12", label: "Voluntários ativos", icon: LuUsers, color: "bg-melvin-green/10", iconColor: "text-melvin-green-dark" },
            { count: "4", label: "ODS atuados", icon: LuLeaf, color: "bg-melvin-blue/10", iconColor: "text-melvin-blue" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              {...fadeIn}
              className="bg-white/50 backdrop-blur-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] border border-white/50 shadow-sm"
            >
              <div className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-8", stat.color)}>
                <stat.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.iconColor)} />
              </div>
              <div className="text-3xl sm:text-5xl font-bold text-melvin-text mb-1 sm:mb-2 font-body tracking-tighter">{stat.count}</div>
              <div className="text-melvin-text/60 text-[10px] sm:text-sm uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. APOIE O INSTITUTO */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 overflow-hidden">
        {/* Background Blobs for depth */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-melvin-red/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-melvin-yellow/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto max-w-6xl flex flex-col gap-12">
          {/* Amigo do Melvin - Hero Card */}
          <motion.div
            {...fadeIn}
            className="bg-white/40 backdrop-blur-xl p-12 md:p-20 rounded-[4rem] border border-white/60 shadow-2xl text-center relative overflow-hidden group"
          >
            <div className="relative z-10">
              <span className="font-handwritten text-melvin-blue text-2xl mb-4 block">Junte-se a nós</span>
              <h3 className="text-4xl md:text-6xl mb-6 leading-tight">
                <span className="font-body font-bold text-melvin-text">Seja um </span>
                <span className="font-handwritten text-melvin-blue">Amigo do Melvin</span>
              </h3>
              <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
                Com sua doação mensal, você contribui diretamente para a alimentação dos nossos alunos e cestas básicas para suas famílias.
              </p>
              <button
                onClick={() => navigate('/amigos-do-melvin')}
                className="bg-melvin-red text-white px-12 py-4 rounded-full font-handwritten text-2xl hover:shadow-2xl hover:scale-105 transition-all shadow-xl"
              >
                Quero ser amigo!
              </button>
            </div>
            {/* Inner glows */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-melvin-red/5 rounded-full blur-3xl -z-10 group-hover:bg-melvin-red/10 transition-colors" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-melvin-yellow/5 rounded-full blur-3xl -z-10 group-hover:bg-melvin-yellow/10 transition-colors" />
          </motion.div>

          {/* Secondary Support Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Embaixadores */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.1 }}
              className="bg-melvin-green/10 p-10 rounded-[3.5rem] border border-melvin-green/20 flex flex-col items-start shadow-sm"
            >
              <LuLightbulb className="w-10 h-10 text-melvin-green-dark mb-6" />
              <h4 className="text-3xl font-bold text-melvin-text mb-4 font-body">Embaixadores</h4>
              <p className="text-slate-600 font-normal mb-8 text-lg leading-relaxed">Use sua influência para arrecadar doações e ampliar o impacto do Instituto.</p>
              <button
                onClick={() => navigate('/embaixadores')}
                className="bg-melvin-green/40 text-melvin-green-dark border border-melvin-green-dark/20 px-8 py-3 rounded-2xl font-handwritten text-xl hover:bg-melvin-green/60 transition-all"
              >
                Quero ser embaixador
              </button>
            </motion.div>

            {/* Nota tem Valor */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="bg-melvin-yellow/10 p-10 rounded-[3.5rem] border border-melvin-yellow/20 flex items-center gap-8 shadow-sm"
            >
              <div className="hidden sm:flex w-32 h-32 bg-white rounded-3xl items-center justify-center shadow-md shadow-melvin-yellow/20 shrink-0 p-4 overflow-hidden">
                <img
                  src={img_nota}
                  alt="Sua Nota tem Valor"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-melvin-text mb-4 font-body">Sua Nota tem Valor</h4>
                <p className="text-slate-600 font-normal mb-6 text-lg leading-relaxed">Cadastre suas notas fiscais e ajude o Instituto sem gastar nada.</p>
                <button
                  onClick={() => navigate('/notatemvalor')}
                  className="bg-melvin-yellow/40 text-melvin-yellow-dark border border-melvin-yellow-dark/20 px-8 py-3 rounded-2xl font-handwritten text-xl hover:bg-melvin-yellow/60 transition-all"
                >
                  Saiba como
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <WavyDivider className="rotate-180 my-12" flip />

      {/* 8. CORPO DE VOLUNTÁRIOS SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 text-center">
        <motion.div {...fadeIn} className="mb-10 sm:mb-20">
          <span className="font-handwritten text-melvin-blue text-2xl sm:text-3xl mb-2 sm:mb-4 block">Mãos que cuidam</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text font-handwritten">Corpo de voluntários</h2>
        </motion.div>

        <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {loadingVoluntarios ? (
            <div className="col-span-full text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-melvin-red border-t-transparent rounded-full mx-auto"
              />
            </div>
          ) : (
            voluntarios.map((vol, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.05 }}
                whileHover={{ rotate: i % 2 === 0 ? 2 : -2, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="bg-white/70 backdrop-blur-md p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[3rem] border border-white/60 shadow-sm hover:shadow-xl transition-all cursor-default group"
              >
                <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-[40%_60%_70%_30%/40%_40%_60%_60%] mx-auto mb-3 sm:mb-6 flex items-center justify-center text-2xl sm:text-3xl font-handwritten text-melvin-text/60 group-hover:scale-110 transition-transform duration-500", vol.color)}>
                  {vol.initial}
                </div>
                <h4 className="font-bold text-melvin-text text-sm sm:text-lg leading-tight mb-1">{vol.name}</h4>
                <p className="text-[10px] sm:text-xs text-melvin-text/60 uppercase tracking-widest">{vol.role}</p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <WavyDivider className="rotate-180 my-12" flip />

      {/* 9. DOAÇÃO SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative z-10 text-center pb-32">
        <motion.div {...fadeIn} className="mb-8 sm:mb-16">
          <span className="font-handwritten text-melvin-blue text-2xl sm:text-3xl mb-2 sm:mb-4 block">Aqui você pode contribuir</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-melvin-text font-handwritten">Faça sua doação agora</h2>
        </motion.div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center max-w-7xl">
          <motion.div
            {...fadeIn}
            className="bg-white/70 backdrop-blur-xl p-12 sm:p-16 rounded-[4rem] sm:rounded-[5rem] border border-white/60 shadow-2xl"
          >
            <span className="font-handwritten text-melvin-blue text-3xl mb-8 block">Chave PIX (CNPJ)</span>
            <div className="bg-white rounded-3xl p-6 w-56 h-56 mx-auto mb-10 shadow-inner flex items-center justify-center overflow-hidden">
              <img src={img_qrcode} alt="QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="bg-gray-100/50 rounded-2xl p-4 mb-8 font-mono text-slate-800 break-all border border-gray-200 text-lg">
              13.285.292/0001-06
            </div>

            <button
              onClick={handleCopy}
              className="bg-melvin-red/80 hover:bg-melvin-red text-white px-10 py-4 rounded-2xl font-body font-semibold transition-all mb-10 flex items-center gap-2 mx-auto shadow-lg shadow-melvin-red/20 active:scale-95"
            >
              {copied ? (
                <><LuCheck className="w-5 h-5" /> Copiado!</>
              ) : (
                <><LuCopy className="w-5 h-5" /> Copiar chave</>
              )}
            </button>

            <div className="text-base text-slate-700 space-y-1 text-center">
              <p className="font-bold text-melvin-text">Bradesco · Agência 2572 · CC 0160996-3</p>
              <p className="font-medium text-melvin-text/80">Chave CNPJ: 13.285.292/0001-06</p>
            </div>

            <button
              onClick={() => navigate('/doacoes')}
              className="mt-12 text-slate-700 font-handwritten text-3xl hover:text-melvin-red transition-colors"
            >
              Ver todas as formas de doar →
            </button>
          </motion.div>

          <motion.div
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="rounded-[4rem] overflow-hidden -rotate-2 watercolor-shadow-yellow border-8 border-white">
              <img 
                src={img_apoio_side} 
                alt="Faça sua doação" 
                className="w-full h-[650px] object-cover"
              />
            </div>
            <WatercolorBlob color="yellow" size="w-48 h-48" className="-bottom-10 -left-10 opacity-20" />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;