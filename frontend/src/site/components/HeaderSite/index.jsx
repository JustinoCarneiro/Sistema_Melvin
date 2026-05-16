import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../../services/utils';
import logo from '../../../docs/logo_institutomelvin_horizontal.png';

const HeaderSite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { label: 'Sobre Nós', path: '/' },
        { label: 'Embaixadores', path: '/embaixadores' },
        { label: 'Amigos do Melvin', path: '/amigos-do-melvin' },
        { label: 'Sua Nota tem Valor', path: '/notatemvalor' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-lg shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between relative z-10">
                {/* Logo Section */}
                <div
                    className="cursor-pointer flex items-center group h-full"
                    onClick={() => handleNavigate('/')}
                >
                    <img
                        src={logo}
                        alt="Instituto Melvin"
                        className="h-32 sm:h-48 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-10">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "text-[17px] transition-all hover:text-melvin-blue font-body font-medium tracking-tight relative group",
                                location.pathname === item.path ? "text-melvin-blue" : "text-slate-700"
                            )}
                        >
                            {item.label}
                            <span className={cn(
                                "absolute -bottom-1 left-0 h-[2px] bg-melvin-blue transition-all duration-300",
                                location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"
                            )} />
                        </button>
                    ))}

                    <button
                        onClick={() => navigate('/doacoes')}
                        className="bg-melvin-red hover:bg-melvin-red-dark text-white px-7 py-2.5 rounded-full text-2xl font-handwritten transition-all shadow-md active:scale-95 ml-2"
                    >
                        Doar
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button
                        className="text-melvin-text p-2"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Menu"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={cn(
                "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/90 backdrop-blur-xl border-t border-white/50",
                mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={cn(
                                "text-left py-3 px-4 rounded-2xl text-base font-medium transition-all",
                                location.pathname === item.path
                                    ? "text-melvin-blue bg-melvin-blue/5"
                                    : "text-slate-700 hover:bg-gray-50"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button
                        onClick={() => handleNavigate('/doacoes')}
                        className="bg-melvin-red text-white py-3 px-6 rounded-2xl text-xl font-handwritten mt-2 shadow-md text-center"
                    >
                        Doar
                    </button>
                </nav>
            </div>

            {/* Wavy Bottom */}
            <div className="absolute bottom-[-80px] left-0 w-full h-24 pointer-events-none">
                <svg
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    <path d="M0,0 L0,40 C180,100 360,-20 540,40 C720,100 900,-20 1080,40 C1260,100 1440,40 L1440,0 Z" fill="white" fillOpacity="0.2" />
                    <path d="M0,0 L0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,60 L1440,0 Z" fill="white" fillOpacity="0.1" />
                </svg>
            </div>
        </header>
    );
};

export default HeaderSite;