import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMapPin, LuPhone, LuMail, LuInstagram, LuUser, LuAward, LuShieldCheck, LuLock, LuFileText } from 'react-icons/lu';
import logo from '../../../docs/logo_institutomelvin_horizontal.png';

const FooterSite = () => {
    const navigate = useNavigate();

    return (
        <footer className="relative z-10 pt-12 pb-6 px-6 bg-[#d6e8da] overflow-visible">
            {/* Wavy Top Edge */}
            <div className="absolute -top-24 left-0 w-full h-24 pointer-events-none">
                <svg
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <path d="M0,120 L0,60 C180,0 360,100 540,40 C720,0 900,80 1080,40 C1260,0 1440,60 1440,60 L1440,120 Z" fill="#d6e8da" />
                </svg>
            </div>

            <div className="container mx-auto grid lg:grid-cols-4 gap-8 relative z-10">
                {/* Brand & OSCIP Info */}
                <div className="lg:col-span-1">
                    <img src={logo} alt="Instituto Melvin" className="h-36 mb-2 object-contain object-left -mt-14" />
                    <p className="text-slate-600 text-xs leading-relaxed mb-2 font-normal">
                        Organização da Sociedade Civil de Interesse Público - OSCIP reconhecida pelo Ministério da Justiça desde 2018.
                    </p>

                    {/* Security Seals */}
                    <div className="mt-6 pt-6 border-t border-slate-300/40 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-1.5 text-melvin-green-dark/60 grayscale hover:grayscale-0 transition-all cursor-default" title="Ambiente Seguro e Criptografado">
                            <LuShieldCheck className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Site<br/>Seguro</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-melvin-blue-dark/60 grayscale hover:grayscale-0 transition-all cursor-default" title="Conforme a LGPD">
                            <LuLock className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Dados<br/>Protegidos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 grayscale hover:grayscale-0 transition-all cursor-default" title="Pagamentos processados pelo Stripe">
                            <svg className="w-12 h-6" viewBox="0 0 40 16" fill="currentColor">
                                <path d="M17.43 7.82c0-1.25.96-1.78 2.45-1.78 1.4 0 2.87.35 3.96.95l.43-3.05c-1.12-.5-2.6-.82-4.13-.82-3.48 0-5.74 1.83-5.74 5.04 0 3.32 2.65 4.3 4.8 4.88l.68.18c1.3.36 1.83.75 1.83 1.48 0 .86-.88 1.4-2.3 1.4-1.6 0-3.32-.47-4.63-1.2l-.5 3.12c1.4.67 3.33 1.02 5.07 1.02 3.6 0 5.95-1.73 5.95-4.8 0-3.53-2.65-4.52-5.07-5.18l-.63-.16c-1.12-.3-1.6-.72-1.6-1.06zm13.1-4.3l-2.9 1.15V.17L24.3 1.25v13.6h3.32V7.12l3.32-1.32v9.05h3.33V3.5h-3.75zM8.33 3.5c-2.3 0-3.9 1-4.7 2.2V3.75H.32v14.4h3.33V12c.8 1.1 2.4 2.1 4.67 2.1 3.53 0 6.13-2.62 6.13-5.3 0-2.68-2.6-5.3-6.13-5.3zm-.65 8.1c-1.8 0-3.05-1.25-3.05-2.8 0-1.55 1.25-2.8 3.05-2.8s3.05 1.25 3.05 2.8c0 1.55-1.25 2.8-3.05 2.8z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Contact */}
                <div>
                    <h5 className="text-melvin-text font-bold mb-4 uppercase tracking-widest text-xs">Contato</h5>
                    <ul className="space-y-3">
                        <li className="flex gap-4 items-start text-slate-600 text-sm">
                            <LuMapPin className="w-5 h-5 text-melvin-blue shrink-0" />
                            <span>Av. Recreio, 840, Fortaleza - CE <br /> CEP 60831-600</span>
                        </li>
                        <li className="flex gap-4 items-center text-slate-600 text-sm">
                            <LuAward className="w-5 h-5 text-melvin-green shrink-0" />
                            <span>CNPJ 13.285.292/0001-06</span>
                        </li>
                        <li className="flex gap-4 items-center text-slate-600 text-sm">
                            <LuPhone className="w-5 h-5 text-melvin-blue shrink-0" />
                            <span>(85) 99924-3836</span>
                        </li>
                        <li className="flex gap-4 items-center text-slate-600 text-sm">
                            <LuMail className="w-5 h-5 text-melvin-red shrink-0" />
                            <span>imeh@igrejadapaz.com.br</span>
                        </li>
                        <li className="flex gap-4 items-center text-slate-600 text-sm">
                            <a
                                href="https://instagram.com/instituto_melvin"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-4 hover:text-melvin-red transition-all group"
                            >
                                <LuInstagram className="w-5 h-5 text-melvin-red shrink-0 transition-transform group-hover:scale-110" />
                                <span className="font-medium">@instituto_melvin</span>
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Location Map */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h5 className="text-melvin-text font-bold uppercase tracking-widest text-xs">Onde Estamos</h5>
                    <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white h-40 relative group">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.9869589739665!2d-38.45222052582052!3d-3.812896696160908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c7451b1375cb55%3A0xb286c02bfb84ce9c!2sAv.%20Recreio%2C%20840%20-%20Lagoa%20Redonda%2C%20Fortaleza%20-%20CE%2C%2060831-600!5e0!3m2!1spt-BR!2sbr!4v1720466467007!5m2!1spt-BR!2sbr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                        ></iframe>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-slate-400 hover:text-melvin-blue transition-all text-[10px] uppercase tracking-[0.2em] font-bold group self-start"
                    >
                        <LuUser className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Acesso do voluntário</span>
                    </button>
                </div>
            </div>

            <div className="container mx-auto mt-10 pt-6 border-t border-slate-300/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                <p>&copy; {new Date().getFullYear()} Instituto Melvin Huber. Todos os direitos reservados.</p>
                <p className="text-melvin-red/80">Feito com amor em Fortaleza.</p>
            </div>
        </footer>
    );
};

export default FooterSite;