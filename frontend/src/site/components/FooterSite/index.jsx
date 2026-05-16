import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuMapPin, LuPhone, LuMail, LuInstagram, LuUser, LuAward } from 'react-icons/lu';
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
                        OSCIP reconhecida pelo Ministério da Justiça desde 2018.
                        <br />
                        <span className="text-melvin-text/60 text-xs">
                            Lei Municipal Nº 11.170/21 · Lei Estadual Nº 17.960/22.
                        </span>
                    </p>
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