import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import HeaderSite from './site/components/HeaderSite';
import FooterSite from './site/components/FooterSite';
import Home from './site/pages/Home';
import Embaixadores from './site/pages/Embaixadores';
import AmigosMelvin from './site/pages/AmigosMelvin';
import CadastroAmigo from './site/pages/CadastroAmigo';
import Doacao from './site/pages/Doacao';
import NotaValor from './site/pages/NotaValor';

import Login from "./pages/Login";
import HomeApp from "./pages/HomeApp";
import PrivateRoute from "./services/PrivateRoute";
import Header from "./components/Header";
import Config from "./pages/Config";
import Relatorios from './pages/Relatorios';
import Rendimento from './pages/Rendimento';
import ConfiguracoesPermissoes from './pages/ConfiguracoesPermissoes';

// --- COMPONENTES DE LISTAGEM UNIFICADOS ---
import Alunos from "./pages/lista/Alunos";
import Voluntarios from "./pages/lista/Voluntarios";
import EmbaixadoresApp from './pages/lista/EmbaixadoresApp';
import AmigosMelvinApp from './pages/lista/AmigosMelvinApp';
import Avisos from './pages/lista/Avisos';
import Cestas from './pages/lista/Cestas';

// --- FORMULÁRIOS ---
import AlunoForms from "./pages/forms/Aluno_forms";
import VoluntarioForms from "./pages/forms/Voluntario_forms";
import EmbaixadorForms from './pages/forms/Embaixador_forms';
import AmigoMelvinForms from './pages/forms/AmigoMelvin_forms';
import AvisoForms from './pages/forms/Aviso_forms';
import CestasForms from './pages/forms/Cestas_forms';

// --- FREQUÊNCIAS ---
import Aluno_frequencia from "./pages/frequencias/Aluno_frequencia";
import Voluntario_frequencia from "./pages/frequencias/Voluntario_frequencia";
import ScrollToTopRouter from './components/ScrollToTopRouter';


function AppRoutes() {
    return (
        <Router>
            <ScrollToTopRouter />
            <MainLayout />
        </Router>
    );
}

function MainLayout() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/app/*" element={<AppContent />} />
                <Route path="/*" element={<SiteContent />} />
            </Routes>
        </>
    );
}

function SiteContent() {
    return (
        <div className="site-layout relative min-h-screen">
            {/* Camada 0: Fundo Sólido (via CSS) */}
            <div className="site-bg-base" />

            {/* Camada 1: Manchas de Aquarela - Intensidade Aumentada */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">
                <div className="absolute top-[-15%] left-[-15%] w-[80vw] h-[80vw] rounded-full animate-slow-pulse"
                    style={{ background: 'radial-gradient(circle, hsla(210, 90%, 55%, 0.4) 0%, transparent 75%)', filter: 'blur(80px)' }} />

                <div className="absolute top-[-10%] right-[-15%] w-[70vw] h-[70vw] rounded-full animate-slow-pulse"
                    style={{ background: 'radial-gradient(circle, hsla(217, 85%, 45%, 0.35) 0%, transparent 75%)', filter: 'blur(80px)', animationDelay: '2s' }} />

                <div className="absolute bottom-[-15%] left-[15%] w-[90vw] h-[90vw] rounded-full animate-slow-pulse"
                    style={{ background: 'radial-gradient(circle, hsla(45, 100%, 50%, 0.4) 0%, transparent 75%)', filter: 'blur(120px)', animationDelay: '4s' }} />
            </div>

            <HeaderSite />
            <main className="site-content relative z-10">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/embaixadores" element={<Embaixadores />} />
                    <Route path="/amigos-do-melvin" element={<AmigosMelvin />} />
                    <Route path="/amigosmelvin" element={<AmigosMelvin />} />
                    <Route path="/cadastroamigo" element={<CadastroAmigo />} />
                    <Route path="/doacoes" element={<Doacao />} />
                    <Route path="/notatemvalor" element={<NotaValor />} />
                </Routes>
            </main>
            <FooterSite />
        </div>
    )
}

function AppContent() {
    const perfisGerais = ['ADM', 'DIRE', 'COOR', 'PROF', 'PSICO', 'ASSIST'];

    // Lista completa de perfis da equipe para módulos dinamicos
    const perfisEquipe = ['ADM', 'DIRE', 'COOR', 'PROF', 'PSICO', 'ASSIST', 'AUX', 'MARK', 'COZI', 'ZELA'];

    // Lista de perfis que podem acessar Doações (Cestas)
    const perfisDoacao = ['ADM', 'DIRE', 'AUX'];

    return (
        <>
            <Header />
            <div className="main-wrapper">
                <Routes>
                    {/* --- HOME DASHBOARD (Por Função) --- */}
                    <Route path="/coor" element={<PrivateRoute element={HomeApp} role="COOR" />} />
                    <Route path="/prof" element={<PrivateRoute element={HomeApp} role="PROF" />} />
                    <Route path="/aux" element={<PrivateRoute element={HomeApp} role="AUX" />} />
                    <Route path="/cozi" element={<PrivateRoute element={HomeApp} role="COZI" />} />
                    <Route path="/dire" element={<PrivateRoute element={HomeApp} role="DIRE" />} />
                    <Route path="/adm" element={<PrivateRoute element={HomeApp} role="ADM" />} />
                    <Route path="/mark" element={<PrivateRoute element={HomeApp} role="MARK" />} />
                    <Route path="/zela" element={<PrivateRoute element={HomeApp} role="ZELA" />} />
                    <Route path="/psico" element={<PrivateRoute element={HomeApp} role="PSICO" />} />
                    <Route path="/assist" element={<PrivateRoute element={HomeApp} role="ASSIST" />} />

                    {/* --- ALUNOS --- */}
                    <Route path="/alunos" element={<PrivateRoute role={perfisGerais} element={Alunos} />} />
                    <Route path="/aluno/criar" element={<PrivateRoute role={perfisGerais} element={AlunoForms} />} />
                    <Route path="/aluno/editar/:matricula" element={<PrivateRoute role={perfisGerais} element={AlunoForms} />} />

                    {/* --- VOLUNTÁRIOS --- */}
                    <Route path="/voluntarios" element={<PrivateRoute role={perfisEquipe} element={Voluntarios} />} />
                    <Route path="/voluntario/criar" element={<PrivateRoute role={perfisEquipe} element={VoluntarioForms} />} />
                    <Route path="/voluntario/editar/:matricula" element={<PrivateRoute role={perfisEquipe} element={VoluntarioForms} />} />

                    {/* --- EMBAIXADORES --- */}
                    <Route path="/embaixadores" element={<PrivateRoute role={perfisEquipe} element={EmbaixadoresApp} />} />
                    <Route path="/embaixador/editar/:id" element={<PrivateRoute role={perfisEquipe} element={EmbaixadorForms} />} />

                    {/* --- AMIGOS DO MELVIN --- */}
                    <Route path="/amigosmelvin" element={<PrivateRoute role={perfisEquipe} element={AmigosMelvinApp} />} />
                    <Route path="/amigomelvin/editar/:id" element={<PrivateRoute role={perfisEquipe} element={AmigoMelvinForms} />} />

                    {/* --- AVISOS --- */}
                    <Route path="/avisos" element={<PrivateRoute role={perfisEquipe} element={Avisos} />} />
                    <Route path="/avisos/criar" element={<PrivateRoute role={perfisEquipe} element={AvisoForms} />} />
                    <Route path="/avisos/editar/:id" element={<PrivateRoute role={perfisEquipe} element={AvisoForms} />} />

                    {/* --- CESTAS (DOAÇÕES) --- */}
                    <Route path="/cestas" element={<PrivateRoute role={perfisEquipe} element={Cestas} />} />
                    <Route path="/cestas/criar" element={<PrivateRoute role={perfisEquipe} element={CestasForms} />} />
                    <Route path="/cestas/editar/:id" element={<PrivateRoute role={perfisEquipe} element={CestasForms} />} />

                    {/* --- OUTROS --- */}
                    <Route path="/rendimento_aluno/:matricula" element={<PrivateRoute role={perfisGerais} element={Rendimento} />} />
                    <Route path="/relatorios" element={<PrivateRoute role={perfisGerais} element={Relatorios} />} />

                    {/* Config apenas para ADM e DIRE (ou ajuste conforme necessidade) */}
                    <Route path="/config" element={<PrivateRoute role={['ADM', 'DIRE', 'COOR', 'AUX', 'PROF', 'PSICO', 'ASSIST', 'COZI', 'ZELA', 'MARK']} element={Config} />} />

                    {/* --- FREQUÊNCIAS --- */}
                    <Route path="/frequencias/alunos" element={<PrivateRoute role={perfisGerais} element={Aluno_frequencia} />} />
                    {/* Frequências de staff geralmente são ADM/DIRE/COOR */}
                    <Route path="/voluntario/frequencias/coordenadores" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <Voluntario_frequencia tipo="coordenador" />} />} />
                    <Route path="/voluntario/frequencias/professores" element={<PrivateRoute role={['ADM', 'DIRE', 'COOR']} element={() => <Voluntario_frequencia tipo="professor" />} />} />
                    <Route path="/voluntario/frequencias/auxiliares" element={<PrivateRoute role={['ADM', 'DIRE', 'COOR']} element={() => <Voluntario_frequencia tipo="auxiliar" />} />} />
                    <Route path="/voluntario/frequencias/cozinheiros" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <Voluntario_frequencia tipo="cozinheiro" />} />} />
                    <Route path="/voluntario/frequencias/diretores" element={<PrivateRoute role={['ADM']} element={() => <Voluntario_frequencia tipo="diretor" />} />} />
                    <Route path="/voluntario/frequencias/administradores" element={<PrivateRoute role={['ADM']} element={() => <Voluntario_frequencia tipo="administrador" />} />} />
                    <Route path="/voluntario/frequencias/marketing" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <Voluntario_frequencia tipo="marketing" />} />} />
                    <Route path="/voluntario/frequencias/zeladores" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <Voluntario_frequencia tipo="zelador" />} />} />
                    <Route path="/voluntario/frequencias/psicologos" element={<PrivateRoute role={['ADM', 'DIRE', 'COOR']} element={() => <Voluntario_frequencia tipo="psicologo" />} />} />
                    <Route path="/voluntario/frequencias/assistentes" element={<PrivateRoute role={['ADM', 'DIRE', 'COOR']} element={() => <Voluntario_frequencia tipo="assistente" />} />} />

                    {/* --- ROTAS DE CONFIGURAÇÃO (ARQUIVO MORTO / DESATIVADOS) --- */}
                    <Route path="/config/matriculasdesativadas/alunos" element={<PrivateRoute role={perfisGerais} element={() => <Alunos modoDesativados={true} />} />} />
                    <Route path="/config/matriculasdesativadas/voluntarios" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <Voluntarios modoDesativados={true} />} />} />
                    <Route path="/config/embaixadoresdesativados" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <EmbaixadoresApp modoDesativados={true} />} />} />
                    <Route path="/config/amigosmelvindesativados" element={<PrivateRoute role={['ADM', 'DIRE']} element={() => <AmigosMelvinApp modoDesativados={true} />} />} />
                    <Route path="/config/avisosdesativados" element={<PrivateRoute role="ADM" element={() => <Avisos modoDesativados={true} />} />} />

                    {/* --- CONFIGURAÇÕES DE SEGURANÇA --- */}
                    <Route path="/config/permissoes" element={<PrivateRoute role="ADM" element={ConfiguracoesPermissoes} />} />

                </Routes>
            </div>
        </>
    );
}

export default AppRoutes;